import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// Admin guard
async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true },
    });
    if (!user || user.role !== "ADMIN") return null;
    return user;
}

// POST - Confirm a bank transfer and activate plan/credits
export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "権限がありません" }, { status: 403 });
        }

        const body = await request.json();
        const { type, id, actualAmount } = body; // type: "creator" | "fan", id: subscription or chargeRequest id

        if (!type || !id) {
            return NextResponse.json(
                { error: "type と id が必要です" },
                { status: 400 }
            );
        }

        if (type === "creator") {
            // Confirm creator plan payment → activate subscription
            const subscription = await prisma.creatorSubscription.findUnique({
                where: { id },
                include: {
                    plan: true,
                    creator: { select: { id: true, displayName: true } },
                },
            });

            if (!subscription) {
                return NextResponse.json(
                    { error: "サブスクリプションが見つかりません" },
                    { status: 404 }
                );
            }

            if (subscription.status !== "PENDING") {
                return NextResponse.json(
                    { error: "このサブスクリプションは既に処理済みです" },
                    { status: 400 }
                );
            }

            // Calculate billing period
            const now = new Date();
            const endDate = new Date(now);
            if (subscription.isYearly) {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            // Activate the subscription
            const amount = subscription.isYearly
                ? subscription.plan.yearlyPrice
                : subscription.plan.monthlyPrice;

            await prisma.creatorSubscription.update({
                where: { id },
                data: {
                    status: "ACTIVE",
                    startDate: now,
                    endDate: endDate,
                    nextBillingDate: endDate,
                    billingBalance: Math.max(0, subscription.billingBalance - amount),
                },
            });

            // Release the virtual account back to inventory
            await prisma.virtualAccount.updateMany({
                where: {
                    assignedToPaymentId: id,
                    purpose: "CREATOR_PLAN",
                },
                data: {
                    isUsed: false,
                    assignedToPaymentId: null,
                    assignedAt: null,
                },
            });

            return NextResponse.json({
                success: true,
                message: `${subscription.creator.displayName} の ${subscription.plan.name} プランを有効化しました`,
            });
        } else if (type === "fan") {
            // Confirm fan credit charge
            const chargeRequest = await prisma.chargeRequest.findUnique({
                where: { id },
                include: {
                    fan: {
                        select: {
                            id: true,
                            credits: true,
                            tier: true,
                            trustScore: true,
                            displayName: true,
                            user: { select: { name: true } },
                        },
                    },
                    bankTransferClaims: {
                        where: { status: "PENDING" },
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            });

            if (!chargeRequest) {
                return NextResponse.json(
                    { error: "チャージ申請が見つかりません" },
                    { status: 404 }
                );
            }

            if (chargeRequest.status === "APPROVED") {
                return NextResponse.json(
                    { error: "このチャージ申請は既に承認済みです" },
                    { status: 400 }
                );
            }

            const claim = chargeRequest.bankTransferClaims[0];
            const immediateAlreadyGranted = claim?.immediateCredit ?? 0;
            // For Tier 0 (amount=0), use actualAmount provided by admin
            const resolvedAmount = chargeRequest.amount === 0 && actualAmount > 0
                ? actualAmount
                : chargeRequest.amount;
            const pendingToGrant = claim?.pendingCredit ?? resolvedAmount;
            const totalCreditsToAdd = claim
                ? pendingToGrant // Only add the pending portion (immediate was already granted)
                : resolvedAmount; // No claim exists, grant full amount

            // Calculate new trust score and tier
            const newTrustScore = chargeRequest.fan.trustScore + 1;
            let newTier = chargeRequest.fan.tier;

            if (newTrustScore >= 3 && chargeRequest.fan.tier < 2) {
                newTier = 2; // Premium
            } else if (newTrustScore >= 1 && chargeRequest.fan.tier < 1) {
                newTier = 1; // Trusted
            }

            // Update in a transaction
            await prisma.$transaction([
                // 1. Update fan credits, trust score, and tier
                prisma.fanProfile.update({
                    where: { id: chargeRequest.fanId },
                    data: {
                        credits: { increment: totalCreditsToAdd },
                        trustScore: newTrustScore,
                        tier: newTier,
                    },
                }),
                // 2. Create credit history record
                prisma.creditHistory.create({
                    data: {
                        fanId: chargeRequest.fanId,
                        type: "CHARGE",
                        amount: totalCreditsToAdd,
                        balance: chargeRequest.fan.credits + totalCreditsToAdd,
                        description: `振込確認によるクレジット付与（${totalCreditsToAdd.toLocaleString()}円）`,
                        chargeRequestId: chargeRequest.id,
                    },
                }),
                // 3. Update charge request status (and amount if it was 0)
                prisma.chargeRequest.update({
                    where: { id },
                    data: {
                        status: "APPROVED",
                        approvedBy: admin.id,
                        approvedAt: new Date(),
                        ...(chargeRequest.amount === 0 && actualAmount > 0 ? { amount: actualAmount } : {}),
                    },
                }),
                // 4. Update claim status if exists
                ...(claim
                    ? [
                        prisma.bankTransferClaim.update({
                            where: { id: claim.id },
                            data: {
                                status: "VERIFIED",
                                processedBy: admin.id,
                                processedAt: new Date(),
                            },
                        }),
                    ]
                    : []),
            ]);

            const fanName = chargeRequest.fan.displayName || chargeRequest.fan.user?.name || "ファン";

            return NextResponse.json({
                success: true,
                message: `${fanName} に ${totalCreditsToAdd.toLocaleString()}円のクレジットを付与しました（即時付与済み: ${immediateAlreadyGranted.toLocaleString()}円）`,
                creditsAdded: totalCreditsToAdd,
                immediateAlreadyGranted,
            });
        } else {
            return NextResponse.json(
                { error: "type は 'creator' または 'fan' で指定してください" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error confirming transfer:", error);
        return NextResponse.json(
            { error: "振込確認処理に失敗しました" },
            { status: 500 }
        );
    }
}
