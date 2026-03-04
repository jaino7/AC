import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - Purchase content with credits
export async function POST(request: NextRequest) {
    try {
        console.log("=== Purchase API called ===");
        const session = await getServerSession(authOptions);
        console.log("Session:", session?.user?.email);

        if (!session?.user?.email) {
            console.error("No session found");
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { contentId } = body;
        console.log("Content ID:", contentId);

        if (!contentId) {
            console.error("No contentId provided");
            return NextResponse.json(
                { error: "コンテンツIDが必要です" },
                { status: 400 }
            );
        }

        // Find content first to get creatorId
        const content = await prisma.post.findUnique({
            where: { id: contentId },
            select: {
                id: true,
                title: true,
                price: true,
                isLocked: true,
                creatorId: true,
            },
        });

        console.log("Content:", content);

        if (!content) {
            console.error("Content not found");
            return NextResponse.json(
                { error: "コンテンツが見つかりません" },
                { status: 404 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        console.log("User:", user?.email);

        if (!user) {
            console.error("User not found");
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        // Find fan profile for this creator
        const fanProfile = await prisma.fanProfile.findUnique({
            where: {
                userId_creatorId: {
                    userId: user.id,
                    creatorId: content.creatorId,
                },
            },
            select: {
                id: true,
                credits: true,
            },
        });

        console.log("Fan profile:", fanProfile?.id);
        console.log("Credits:", fanProfile?.credits);

        if (!fanProfile) {
            console.error("No fan profile found for this creator");
            return NextResponse.json(
                { error: "このクリエイターのファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        if (!content.isLocked || !content.price) {
            return NextResponse.json(
                { error: "このコンテンツは購入対象ではありません" },
                { status: 400 }
            );
        }

        // Check if already purchased
        const existingPurchase = await prisma.purchase.findFirst({
            where: {
                fanId: fanProfile.id,
                postId: contentId,
            },
        });

        if (existingPurchase) {
            return NextResponse.json(
                { error: "既に購入済みです" },
                { status: 400 }
            );
        }

        // Check credits
        if (fanProfile.credits < content.price) {
            return NextResponse.json(
                {
                    error: "クレジットが不足しています",
                    currentCredits: fanProfile.credits,
                    requiredAmount: content.price,
                    shortage: content.price - fanProfile.credits,
                },
                { status: 400 }
            );
        }

        // 購入発生時点のクリエイターのプランの手数料率を取得
        const creatorSubscription = await prisma.creatorSubscription.findUnique({
            where: { creatorId: content.creatorId },
            include: { plan: true },
        });
        const freePlan = await prisma.creatorPlan.findUnique({ where: { type: "FREE" } });
        const rawFeeRate =
            creatorSubscription?.status === "ACTIVE" && creatorSubscription.plan
                ? creatorSubscription.plan.feeRate
                : (freePlan?.feeRate ?? 8);
        const feeRate = rawFeeRate / 100; // 8.0 → 0.08
        const platformFee = Math.floor(content.price! * feeRate);
        const netAmount = content.price! - platformFee;

        // 締め月（YYYY-MM）
        const now = new Date();
        const settlementMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // Execute purchase transaction
        console.log("Starting transaction with fanId:", fanProfile.id);
        console.log("Content price:", content.price);

        const result = await prisma.$transaction(async (tx) => {
            console.log("Inside transaction - updating fan profile");

            // Deduct credits
            const updatedFan = await tx.fanProfile.update({
                where: { id: fanProfile.id },
                data: {
                    credits: {
                        decrement: content.price!,
                    },
                },
            });

            // マイナス残高防止（トランザクション外のチェックとの間に別の減算が入った場合のガード）
            if (updatedFan.credits < 0) {
                throw new Error("INSUFFICIENT_CREDITS");
            }

            console.log("Fan profile updated, new credits:", updatedFan.credits);

            // Create purchase record
            const purchase = await tx.purchase.create({
                data: {
                    fanId: fanProfile.id,
                    postId: contentId,
                    amount: content.price!,
                },
            });

            // Create credit history
            await tx.creditHistory.create({
                data: {
                    fanId: fanProfile.id,
                    type: "PURCHASE",
                    amount: -content.price!,
                    balance: updatedFan.credits,
                    description: `コンテンツ購入: ${content.title}`,
                },
            });

            // 収益記録（手数料控除後のクリエイター受取額をスナップショット）
            await tx.creatorEarning.create({
                data: {
                    creatorId: content.creatorId,
                    grossAmount: content.price!,
                    platformFee,
                    netAmount,
                    feeRate,
                    earningType: "PURCHASE",
                    referenceId: purchase.id,
                    settlementMonth,
                    status: "PENDING",
                },
            });

            return {
                purchase,
                newCredits: updatedFan.credits,
            };
        });

        return NextResponse.json({
            success: true,
            purchase: result.purchase,
            newCredits: result.newCredits,
            message: "購入が完了しました",
        });
    } catch (error) {
        console.error("Error purchasing content:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error details:", errorMessage);

        if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
            return NextResponse.json(
                { error: "クレジットが不足しています。残高をご確認ください。" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            {
                error: "購入処理に失敗しました",
                details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
            },
            { status: 500 }
        );
    }
}
