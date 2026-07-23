import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get creator's subscription information
export async function GET(request: NextRequest) {
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

        // Get subscription information
        const subscription = await prisma.creatorSubscription.findUnique({
            where: {
                creatorId: user.creatorProfile.id,
            },
            include: {
                plan: {
                    select: {
                        id: true,
                        type: true,
                        name: true,
                        monthlyPrice: true,
                        yearlyPrice: true,
                        feeRate: true,
                    },
                },
            },
        });

        // Get fixed virtual account for creator (CREATOR_PLAN purpose)
        const virtualAccountRaw = await prisma.virtualAccount.findFirst({
            where: {
                creatorId: user.creatorProfile.id,
                purpose: "CREATOR_PLAN",
                isActive: true,
            },
        });

        // Extract branchName safely
        const virtualAccount = virtualAccountRaw ? {
            accountNumber: virtualAccountRaw.accountNumber,
            accountName: virtualAccountRaw.accountName,
            branchCode: virtualAccountRaw.branchCode,
            branchName: virtualAccountRaw.branchName || null,
        } : null;

        // If no subscription exists, return free plan info
        if (!subscription) {
            return NextResponse.json({
                subscription: {
                    status: "FREE",
                    plan: {
                        type: "FREE",
                        name: "無料プラン",
                        monthlyPrice: 0,
                        yearlyPrice: 0,
                        feeRate: 0.08,
                    },
                    isYearly: false,
                    nextBillingDate: null,
                    endDate: null,
                    billingBalance: 0,
                },
                virtualAccount: virtualAccount || null,
            });
        }

        return NextResponse.json({
            subscription: {
                id: subscription.id,
                status: subscription.status,
                plan: subscription.plan,
                isYearly: subscription.isYearly,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                nextBillingDate: subscription.nextBillingDate,
                trialEndDate: subscription.trialEndDate,
                billingBalance: subscription.billingBalance,
            },
            virtualAccount: virtualAccount || null,
        });
    } catch (error) {
        console.error("Error fetching subscription:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            {
                error: "サブスクリプション情報の取得に失敗しました",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
