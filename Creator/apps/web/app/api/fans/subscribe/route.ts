import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { sendEmailSafe } from "@/lib/email/client";
import { PurchaseNotificationEmail } from "@/lib/email/templates/creator/PurchaseNotificationEmail";
import React from "react";

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

// GET - Get active subscriptions for a fan
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const url = new URL(request.url);
        const handle = url.searchParams.get("handle");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }

        // Search for active subscriptions
        const whereClause: any = {
            fan: { userId: user.id },
            status: "ACTIVE"
        };

        if (handle) {
            whereClause.plan = { creator: { handle } };
        }

        const subscriptions = await prisma.subscription.findMany({
            where: whereClause,
            include: {
                plan: {
                    include: {
                        creator: {
                            select: { handle: true, displayName: true }
                        }
                    }
                }
            },
            orderBy: { startDate: "desc" }
        });

        return NextResponse.json({ subscriptions });
    } catch (error) {
        console.error("Fetch subscriptions error:", error);
        return NextResponse.json({ error: "プラン情報の取得に失敗しました" }, { status: 500 });
    }
}

// POST - Subscribe to a plan using credits
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { planId } = body;

        if (!planId) {
            return NextResponse.json(
                { error: "プランIDが指定されていません" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        // Find plan with creator info
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            include: {
                creator: {
                    select: {
                        id: true,
                        handle: true,
                        displayName: true,
                        notifyPurchase: true,
                        user: { select: { id: true, email: true } },
                    },
                },
            },
        });

        if (!plan) {
            return NextResponse.json(
                { error: "プランが見つかりません" },
                { status: 404 }
            );
        }

        // Find or create fan profile for this creator
        let fanProfile = await prisma.fanProfile.findUnique({
            where: {
                userId_creatorId: {
                    userId: user.id,
                    creatorId: plan.creatorId,
                },
            },
        });

        if (!fanProfile) {
            return NextResponse.json(
                { error: "ファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // Check if already subscribed
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                fanId: fanProfile.id,
                planId: plan.id,
                status: "ACTIVE",
            },
        });

        if (existingSubscription) {
            return NextResponse.json(
                { error: "既にこのプランに登録済みです" },
                { status: 409 }
            );
        }

        // Check if fan has enough credits
        if (fanProfile.credits < plan.price) {
            return NextResponse.json(
                {
                    error: "クレジットが不足しています",
                    shortage: plan.price - fanProfile.credits,
                    currentCredits: fanProfile.credits,
                    requiredAmount: plan.price,
                },
                { status: 400 }
            );
        }

        // 購入発生時点のクリエイターのプランの手数料率を取得
        const creatorSubscription = await prisma.creatorSubscription.findUnique({
            where: { creatorId: plan.creatorId },
            include: { plan: true },
        });
        const freePlan = await prisma.creatorPlan.findUnique({ where: { type: "FREE" } });
        const rawFeeRate =
            creatorSubscription?.status === "ACTIVE" && creatorSubscription.plan
                ? creatorSubscription.plan.feeRate
                : (freePlan?.feeRate ?? 8);
        const feeRate = rawFeeRate / 100; // 8.0 → 0.08
        const platformFee = Math.floor(plan.price * feeRate);
        const netAmount = plan.price - platformFee;

        // 締め月（YYYY-MM）
        const now = new Date();
        const settlementMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // Create subscription and deduct credits in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Deduct credits
            const updatedFanProfile = await tx.fanProfile.update({
                where: { id: fanProfile!.id },
                data: {
                    credits: {
                        decrement: plan.price,
                    },
                },
            });

            // マイナス残高防止（トランザクション外のチェックとの間に別の減算が入った場合のガード）
            if (updatedFanProfile.credits < 0) {
                throw new Error("INSUFFICIENT_CREDITS");
            }

            // Create subscription
            const subscription = await tx.subscription.create({
                data: {
                    fanId: fanProfile!.id,
                    planId: plan.id,
                    status: "ACTIVE",
                    startDate: new Date(),
                    // 翌月同日更新（月末補正あり）
                    endDate: calculateNextBillingDate(new Date()),
                },
            });

            // Record credit history
            await tx.creditHistory.create({
                data: {
                    fanId: fanProfile!.id,
                    type: "SUBSCRIBE",
                    amount: -plan.price,
                    balance: updatedFanProfile.credits,
                    description: `${plan.name}プランに登録`,
                },
            });

            // 収益記録（手数料控除後のクリエイター受取額をスナップショット）
            await tx.creatorEarning.create({
                data: {
                    creatorId: plan.creatorId,
                    grossAmount: plan.price,
                    platformFee,
                    netAmount,
                    feeRate,
                    earningType: "SUBSCRIPTION",
                    referenceId: subscription.id,
                    settlementMonth,
                    status: "PENDING",
                },
            });

            return { subscription, newBalance: updatedFanProfile.credits };
        });

        // クリエイターにダッシュボード通知を作成（非同期）
        prisma.notification.create({
            data: {
                creatorId: plan.creatorId,
                type: "PURCHASE",
                title: "プランが購入されました",
                message: `「${plan.name}」プランに新しいメンバーが参加しました（¥${plan.price.toLocaleString()}）`,
                metadata: {
                    planId: plan.id,
                    planName: plan.name,
                    amount: plan.price,
                    subscriptionId: result.subscription.id,
                },
            },
        }).catch(err => console.error("Failed to create plan purchase notification:", err));

        // クリエイターにメール通知（notifyPurchase が有効な場合）
        if (plan.creator.notifyPurchase && plan.creator.user.email) {
            const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            sendEmailSafe({
                to: plan.creator.user.email,
                subject: `【購入通知】プラン「${plan.name}」に新しいメンバーが参加しました`,
                react: React.createElement(PurchaseNotificationEmail, {
                    creatorName: plan.creator.displayName,
                    purchaseType: "plan",
                    itemName: plan.name,
                    amount: plan.price,
                    dashboardUrl: `${siteUrl}/creators/dashboard`,
                }),
                emailType: "CREATOR_CONTENT_PURCHASED",
                recipientId: plan.creator.user.id,
                metadata: { planId: plan.id, subscriptionId: result.subscription.id },
            }).catch(err => console.error("Plan purchase email send failed:", err));
        }

        return NextResponse.json({
            success: true,
            message: "プランに登録しました",
            subscription: {
                id: result.subscription.id,
                planName: plan.name,
                startDate: result.subscription.startDate,
                endDate: result.subscription.endDate,
            },
            newBalance: result.newBalance,
        });
    } catch (error) {
        console.error("Subscription error:", error);
        if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
            return NextResponse.json(
                { error: "クレジットが不足しています。残高をご確認ください。" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "プランへの登録に失敗しました" },
            { status: 500 }
        );
    }
}
