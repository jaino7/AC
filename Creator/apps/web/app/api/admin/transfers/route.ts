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

// GET - Fetch pending transfers (creator or fan)
export async function GET(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "権限がありません" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "creator"; // "creator" | "fan"

        if (type === "creator") {
            // Creator subscriptions with PENDING status
            const subscriptions = await prisma.creatorSubscription.findMany({
                where: {
                    status: { in: ["PENDING"] },
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            displayName: true,
                            handle: true,
                            user: { select: { id: true, email: true } },
                        },
                    },
                    plan: {
                        select: {
                            type: true,
                            name: true,
                            monthlyPrice: true,
                            yearlyPrice: true,
                        },
                    },
                    bankTransfers: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            amount: true,
                            transferorName: true,
                            transferDate: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            // Also get the virtual account info for each subscription
            const results = await Promise.all(
                subscriptions.map(async (sub) => {
                    const va = await prisma.virtualAccount.findFirst({
                        where: {
                            assignedToPaymentId: sub.id,
                            purpose: "CREATOR_PLAN",
                        },
                        select: { accountNumber: true, branchName: true },
                    });
                    return {
                        id: sub.id,
                        creatorName: sub.creator.displayName,
                        creatorHandle: sub.creator.handle,
                        creatorUserId: sub.creator.user?.id,
                        creatorEmail: sub.creator.user?.email,
                        planType: sub.plan.type,
                        planName: sub.plan.name,
                        isYearly: sub.isYearly,
                        amount: sub.isYearly ? sub.plan.yearlyPrice : sub.plan.monthlyPrice,
                        status: sub.status,
                        billingBalance: sub.billingBalance,
                        virtualAccountNumber: va?.accountNumber ?? null,
                        virtualAccountBranch: va?.branchName ?? null,
                        lastTransfer: sub.bankTransfers[0] ?? null,
                        createdAt: sub.createdAt,
                    };
                })
            );

            return NextResponse.json({ transfers: results, type: "creator" });
        } else {
            // Fan charge requests with PENDING/TRANSFERRED status + claims
            const chargeRequests = await prisma.chargeRequest.findMany({
                where: {
                    status: { in: ["PENDING", "TRANSFERRED"] },
                },
                include: {
                    fan: {
                        select: {
                            id: true,
                            displayName: true,
                            credits: true,
                            tier: true,
                            trustScore: true,
                            user: { select: { id: true, name: true, email: true } },
                            creator: { select: { displayName: true, handle: true } },
                        },
                    },
                    bankTransferClaims: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            immediateCredit: true,
                            pendingCredit: true,
                            claimedAt: true,
                        },
                    },
                    bankTransfers: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        select: {
                            id: true,
                            amount: true,
                            transferorName: true,
                            transferDate: true,
                            status: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });

            // Fetch virtual account info for each charge request independently
            const results = await Promise.all(
                chargeRequests.map(async (cr) => {
                    const claim = cr.bankTransferClaims[0] ?? null;
                    // First try to find VA by ChargeRequest ID (Tier 1+)
                    let va = await prisma.virtualAccount.findFirst({
                        where: {
                            assignedToPaymentId: cr.id,
                            purpose: "FAN_CREDIT",
                        },
                        select: { accountNumber: true, branchName: true },
                    });
                    // Fallback: Tier 0 fans have VA assigned by fanId, not by ChargeRequest
                    if (!va) {
                        va = await prisma.virtualAccount.findFirst({
                            where: {
                                fanId: cr.fan.id,
                                purpose: "FAN_CREDIT",
                                isActive: true,
                            },
                            select: { accountNumber: true, branchName: true },
                        });
                    }

                    return {
                        id: cr.id,
                        fanName: cr.fan.displayName || cr.fan.user?.name || "名無し",
                        fanUserId: cr.fan.user?.id,
                        fanEmail: cr.fan.user?.email,
                        creatorName: cr.fan.creator?.displayName ?? "N/A",
                        creatorHandle: cr.fan.creator?.handle ?? "",
                        amount: cr.amount,
                        status: cr.status,
                        virtualAccountNumber: va?.accountNumber ?? null,
                        virtualAccountBranch: va?.branchName ?? null,
                        tier: cr.fan.tier,
                        trustScore: cr.fan.trustScore,
                        currentCredits: cr.fan.credits,
                        hasClaim: cr.hasClaim,
                        claim: claim
                            ? {
                                id: claim.id,
                                amount: claim.amount,
                                status: claim.status,
                                immediateCredit: claim.immediateCredit,
                                pendingCredit: claim.pendingCredit,
                                claimedAt: claim.claimedAt,
                            }
                            : null,
                        lastTransfer: cr.bankTransfers[0] ?? null,
                        expiresAt: cr.expiresAt,
                        createdAt: cr.createdAt,
                    };
                })
            );

            return NextResponse.json({ transfers: results, type: "fan" });
        }
    } catch (error) {
        console.error("Error fetching admin transfers:", error);
        return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
    }
}
