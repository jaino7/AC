import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

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

            // Create subscription
            const subscription = await tx.subscription.create({
                data: {
                    fanId: fanProfile!.id,
                    planId: plan.id,
                    status: "ACTIVE",
                    startDate: new Date(),
                    // Set end date to 30 days from now
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

            return { subscription, newBalance: updatedFanProfile.credits };
        });

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
        return NextResponse.json(
            { error: "プランへの登録に失敗しました" },
            { status: 500 }
        );
    }
}
