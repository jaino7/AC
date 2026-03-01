import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";

// 月末補正付きの次回請求日（1ヶ月後）計算関数
function calculateNextBillingDate(fromDate: Date): Date {
    const nextDate = new Date(fromDate);
    const originalDate = nextDate.getDate();
    nextDate.setMonth(nextDate.getMonth() + 1);

    // 日付がずれた場合（例: 1月31日 -> 3月3日になってしまった場合等）
    if (nextDate.getDate() !== originalDate) {
        nextDate.setDate(0); // その月の前日（前月の末日）に戻る
    }
    return nextDate;
}

/**
 * Subscription renewal cron job
 * This endpoint should be called daily to renew expiring subscriptions
 *
 * In production, use a service like:
 * - Vercel Cron Jobs
 * - AWS EventBridge
 * - GitHub Actions
 *
 * For security, add authorization header check in production
 */
export async function POST(request: NextRequest) {
    try {
        // Security check - verify cron secret in production
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find all active subscriptions expiring within the next day
        const expiringSubscriptions = await prisma.subscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: {
                    gte: now,
                    lte: tomorrow,
                },
            },
            include: {
                fan: {
                    select: {
                        id: true,
                        credits: true,
                        userId: true,
                        creatorId: true,
                    },
                },
                plan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        creatorId: true,
                    },
                },
            },
        });

        const results = {
            total: expiringSubscriptions.length,
            renewed: 0,
            cancelled: 0,
            errors: 0,
            details: [] as any[],
        };

        for (const subscription of expiringSubscriptions) {
            try {
                const outcome = await prisma.$transaction(async (tx) => {
                    // べき等性: トランザクション内でサブスクの最新状態を再取得し、
                    // 既に更新済み（endDateが延長済み）or キャンセル済みなら何もしない
                    const current = await tx.subscription.findUnique({
                        where: { id: subscription.id },
                        select: { status: true, endDate: true },
                    });

                    if (!current || current.status !== "ACTIVE") {
                        return { action: "skipped", reason: "not_active" } as const;
                    }

                    // endDateが既にtomorrowより後なら、別のCron実行で更新済み
                    if (current.endDate && current.endDate > tomorrow) {
                        return { action: "skipped", reason: "already_renewed" } as const;
                    }

                    // 最新の残高を取得して判定（外側のスナップショットは古い可能性がある）
                    const fan = await tx.fanProfile.findUnique({
                        where: { id: subscription.fan.id },
                        select: { credits: true },
                    });

                    if (!fan || fan.credits < subscription.plan.price) {
                        // 残高不足 → キャンセル
                        await tx.subscription.update({
                            where: { id: subscription.id },
                            data: { status: "CANCELLED" },
                        });
                        return {
                            action: "cancelled",
                            availableCredits: fan?.credits ?? 0,
                        } as const;
                    }

                    // 残高十分 → 更新
                    const updatedFan = await tx.fanProfile.update({
                        where: { id: subscription.fan.id },
                        data: {
                            credits: { decrement: subscription.plan.price },
                        },
                    });

                    // マイナス残高防止（並行減算のガード）
                    if (updatedFan.credits < 0) {
                        throw new Error("INSUFFICIENT_CREDITS");
                    }

                    const newEndDate = calculateNextBillingDate(new Date(subscription.endDate!));

                    await tx.subscription.update({
                        where: { id: subscription.id },
                        data: { endDate: newEndDate },
                    });

                    await tx.creditHistory.create({
                        data: {
                            fanId: subscription.fan.id,
                            type: "SUBSCRIBE",
                            amount: -subscription.plan.price,
                            balance: updatedFan.credits,
                            description: `${subscription.plan.name}プラン更新（自動）`,
                        },
                    });

                    // 収益記録（自動更新時も記録する）
                    const now = new Date();
                    const settlementMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

                    // クリエイターの手数料率を取得
                    const creatorSub = await tx.creatorSubscription.findUnique({
                        where: { creatorId: subscription.plan.creatorId },
                        include: { plan: true },
                    });
                    const freePlan = await tx.creatorPlan.findUnique({ where: { type: "FREE" } });
                    const rawFeeRate =
                        creatorSub?.status === "ACTIVE" && creatorSub.plan
                            ? creatorSub.plan.feeRate
                            : (freePlan?.feeRate ?? 10);
                    const feeRate = rawFeeRate / 100;
                    const platformFee = Math.floor(subscription.plan.price * feeRate);
                    const netAmount = subscription.plan.price - platformFee;

                    await tx.creatorEarning.create({
                        data: {
                            creatorId: subscription.plan.creatorId,
                            grossAmount: subscription.plan.price,
                            platformFee,
                            netAmount,
                            feeRate,
                            earningType: "SUBSCRIPTION",
                            referenceId: subscription.id,
                            settlementMonth,
                            status: "PENDING",
                        },
                    });

                    return { action: "renewed" } as const;
                });

                if (outcome.action === "renewed") {
                    results.renewed++;
                    results.details.push({
                        subscriptionId: subscription.id,
                        planName: subscription.plan.name,
                        status: "renewed",
                        creditsDeducted: subscription.plan.price,
                    });
                } else if (outcome.action === "cancelled") {
                    results.cancelled++;
                    results.details.push({
                        subscriptionId: subscription.id,
                        planName: subscription.plan.name,
                        status: "cancelled",
                        reason: "insufficient_credits",
                        requiredCredits: subscription.plan.price,
                        availableCredits: outcome.availableCredits,
                    });
                    // TODO: Send notification email to fan about cancellation
                }
                // skipped の場合はカウントしない（二重実行による正常スキップ）
            } catch (error) {
                console.error(`Error processing subscription ${subscription.id}:`, error);
                results.errors++;
                results.details.push({
                    subscriptionId: subscription.id,
                    planName: subscription.plan.name,
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        console.log("Subscription renewal completed:", results);

        return NextResponse.json({
            success: true,
            message: "Subscription renewal completed",
            results,
        });
    } catch (error) {
        console.error("Subscription renewal error:", error);
        return NextResponse.json(
            { error: "Failed to renew subscriptions" },
            { status: 500 }
        );
    }
}

// Allow GET for testing in development
export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "This endpoint is only available in development" },
            { status: 403 }
        );
    }

    return POST(request);
}
