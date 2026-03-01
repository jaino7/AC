import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// PATCH - Cancel creator's subscription
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Find user and creator profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                creatorProfile: {
                    select: { id: true },
                },
            },
        });

        if (!user?.creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // Get subscription
        const subscription = await prisma.creatorSubscription.findUnique({
            where: {
                creatorId: user.creatorProfile.id,
            },
            include: {
                plan: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
            },
        });

        if (!subscription) {
            return NextResponse.json(
                { error: "サブスクリプションが見つかりません" },
                { status: 404 }
            );
        }

        // Check if subscription is already cancelled
        if (subscription.status === "CANCELLED") {
            return NextResponse.json(
                { error: "既にキャンセル済みです" },
                { status: 400 }
            );
        }

        // If the subscription is PENDING (unpaid), change status to CANCELLED and clear projected dates
        // This preserves billingBalance while preventing access
        if (subscription.status === "PENDING") {
            await prisma.$transaction([
                prisma.creatorSubscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: "CANCELLED",
                        endDate: null,
                        nextBillingDate: null,
                    }
                }),
                prisma.virtualAccount.updateMany({
                    where: { assignedToPaymentId: subscription.id },
                    data: {
                        isUsed: false,
                        assignedToPaymentId: null,
                        assignedAt: null
                    }
                })
            ]);

            return NextResponse.json({
                success: true,
                message: `${subscription.plan.name}プランの申し込みをキャンセルしました。`,
            });
        }

        // Update subscription status to CANCELLED
        // The subscription will remain active until endDate, but won't auto-renew
        const updatedSubscription = await prisma.creatorSubscription.update({
            where: {
                id: subscription.id,
            },
            data: {
                status: "CANCELLED",
                // Keep endDate as is - subscription remains active until then
                nextBillingDate: null, // Clear next billing date to indicate no renewal
            },
            include: {
                plan: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: `${subscription.plan.name}プランのキャンセルが完了しました。${subscription.endDate ? new Date(subscription.endDate).toLocaleDateString("ja-JP") : ""}まで利用可能です。`,
            subscription: {
                id: updatedSubscription.id,
                status: updatedSubscription.status,
                plan: updatedSubscription.plan,
                endDate: updatedSubscription.endDate,
            },
        });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        return NextResponse.json(
            { error: "サブスクリプションのキャンセルに失敗しました" },
            { status: 500 }
        );
    }
}
