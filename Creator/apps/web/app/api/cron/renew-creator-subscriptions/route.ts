import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";

/**
 * Creator Subscription Renewal Cron Job
 *
 * Runs daily. For each ACTIVE CreatorSubscription where endDate <= tomorrow:
 * - If billingBalance >= plan amount → renew (extend dates, deduct balance)
 * - If billingBalance < plan amount → expire the subscription
 *
 * In production, trigger via Vercel Cron / AWS EventBridge / etc.
 * Secure with CRON_SECRET bearer token.
 */

// 月末補正付きの次回請求日計算
function calculateNextEndDate(fromDate: Date, isYearly: boolean): Date {
    const nextDate = new Date(fromDate);
    if (isYearly) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
        const originalDate = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + 1);
        // 日付がずれた場合（例: 1月31日 -> 3月3日）
        if (nextDate.getDate() !== originalDate) {
            nextDate.setDate(0); // 前月の末日に戻る
        }
    }
    return nextDate;
}

export async function POST(request: NextRequest) {
    try {
        // Security check
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find ACTIVE creator subscriptions expiring within the next day
        const expiringSubscriptions = await prisma.creatorSubscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: {
                    lte: tomorrow,
                },
            },
            include: {
                creator: {
                    select: { id: true, displayName: true, handle: true },
                },
                plan: {
                    select: {
                        id: true,
                        name: true,
                        monthlyPrice: true,
                        yearlyPrice: true,
                    },
                },
            },
        });

        const results = {
            total: expiringSubscriptions.length,
            renewed: 0,
            expired: 0,
            errors: 0,
            details: [] as any[],
        };

        for (const subscription of expiringSubscriptions) {
            try {
                const requiredAmount = subscription.isYearly
                    ? subscription.plan.yearlyPrice
                    : subscription.plan.monthlyPrice;

                const isTrial = !!(subscription as any).trialEndDate;

                if (subscription.billingBalance >= requiredAmount) {
                    // Renew: deduct balance and extend dates
                    const newEndDate = calculateNextEndDate(
                        subscription.endDate ?? now,
                        subscription.isYearly
                    );
                    const newBalance = subscription.billingBalance - requiredAmount;

                    await prisma.creatorSubscription.update({
                        where: { id: subscription.id },
                        data: {
                            billingBalance: newBalance,
                            endDate: newEndDate,
                            nextBillingDate: newEndDate,
                            // トライアル終了後の初回課金 → trialEndDate をクリアして通常契約へ移行
                            ...(isTrial && { trialEndDate: null }),
                        },
                    });

                    results.renewed++;
                    results.details.push({
                        subscriptionId: subscription.id,
                        creator: `${subscription.creator.displayName} (@${subscription.creator.handle})`,
                        planName: subscription.plan.name,
                        status: isTrial ? "trial_converted" : "renewed",
                        deducted: requiredAmount,
                        newBalance,
                        newEndDate: newEndDate.toISOString(),
                    });

                    console.log(
                        `[Cron] ${isTrial ? "Trial converted to paid" : "Renewed"} creator subscription: ` +
                        `${subscription.creator.displayName} (@${subscription.creator.handle}), ` +
                        `plan: ${subscription.plan.name}, deducted: ¥${requiredAmount}, newBalance: ¥${newBalance}`
                    );
                } else {
                    // Insufficient balance → expire (trial: back to FREE, regular: expired)
                    await prisma.creatorSubscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: "EXPIRED",
                            nextBillingDate: null,
                        },
                    });

                    results.expired++;
                    results.details.push({
                        subscriptionId: subscription.id,
                        creator: `${subscription.creator.displayName} (@${subscription.creator.handle})`,
                        planName: subscription.plan.name,
                        status: isTrial ? "trial_expired" : "expired",
                        requiredAmount,
                        availableBalance: subscription.billingBalance,
                    });

                    console.log(
                        `[Cron] ${isTrial ? "Trial expired (no balance)" : "Expired"} creator subscription: ` +
                        `${subscription.creator.displayName} (@${subscription.creator.handle}), ` +
                        `plan: ${subscription.plan.name}, ` +
                        `balance: ¥${subscription.billingBalance} < required: ¥${requiredAmount}`
                    );
                }
            } catch (error) {
                console.error(`Error processing creator subscription ${subscription.id}:`, error);
                results.errors++;
                results.details.push({
                    subscriptionId: subscription.id,
                    creator: `${subscription.creator.displayName} (@${subscription.creator.handle})`,
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        console.log("[Cron] Creator subscription renewal completed:", results);

        return NextResponse.json({
            success: true,
            message: "Creator subscription renewal completed",
            results,
        });
    } catch (error) {
        console.error("Creator subscription renewal error:", error);
        return NextResponse.json(
            { error: "Failed to renew creator subscriptions" },
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
