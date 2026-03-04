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

// GET - Look up creator by virtual account number
export async function GET(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "権限がありません" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const accountNumber = searchParams.get("accountNumber");

        if (!accountNumber || accountNumber.trim() === "") {
            return NextResponse.json({ error: "口座番号を入力してください" }, { status: 400 });
        }

        // Find virtual account by account number
        const virtualAccount = await prisma.virtualAccount.findUnique({
            where: { accountNumber: accountNumber.trim() },
            select: {
                id: true,
                accountNumber: true,
                branchName: true,
                purpose: true,
                creatorId: true,
                assignedToPaymentId: true,
                isActive: true,
            },
        });

        if (!virtualAccount) {
            return NextResponse.json({ error: "該当する口座番号が見つかりません", found: false }, { status: 404 });
        }

        // Find the creator subscription linked to this virtual account
        // First try assignedToPaymentId (linked to CreatorSubscription.id)
        let subscription = null;
        if (virtualAccount.assignedToPaymentId) {
            subscription = await prisma.creatorSubscription.findUnique({
                where: { id: virtualAccount.assignedToPaymentId },
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
                },
            });
        }

        // Fallback: try creatorId on the virtual account
        if (!subscription && virtualAccount.creatorId) {
            subscription = await prisma.creatorSubscription.findFirst({
                where: { creatorId: virtualAccount.creatorId },
                orderBy: { createdAt: "desc" },
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
                },
            });
        }

        if (!subscription) {
            return NextResponse.json({
                error: "この口座番号に紐づくクリエイターのサブスクリプションが見つかりません",
                found: false,
            }, { status: 404 });
        }

        return NextResponse.json({
            found: true,
            creator: {
                name: subscription.creator.displayName,
                handle: subscription.creator.handle,
                email: subscription.creator.user?.email ?? null,
                userId: subscription.creator.user?.id ?? null,
            },
            subscription: {
                id: subscription.id,
                planName: subscription.plan.name,
                planType: subscription.plan.type,
                isYearly: subscription.isYearly,
                amount: subscription.isYearly ? subscription.plan.yearlyPrice : subscription.plan.monthlyPrice,
                status: subscription.status,
                billingBalance: subscription.billingBalance,
            },
            virtualAccount: {
                accountNumber: virtualAccount.accountNumber,
                branchName: virtualAccount.branchName,
            },
        });
    } catch (error) {
        console.error("Error looking up creator:", error);
        return NextResponse.json({ error: "検索に失敗しました" }, { status: 500 });
    }
}
