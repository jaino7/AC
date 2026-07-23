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

// POST - Add to billingBalance (+ auto-activate if PENDING and balance sufficient)
export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        if (!admin) {
            return NextResponse.json({ error: "権限がありません" }, { status: 403 });
        }

        const body = await request.json();
        const { subscriptionId, amount } = body;

        if (!subscriptionId || typeof subscriptionId !== "string") {
            return NextResponse.json({ error: "サブスクリプションIDが必要です" }, { status: 400 });
        }

        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "有効な金額を入力してください" }, { status: 400 });
        }

        // Find the subscription with plan info
        const subscription = await prisma.creatorSubscription.findUnique({
            where: { id: subscriptionId },
            include: {
                creator: {
                    select: { displayName: true, handle: true },
                },
                plan: {
                    select: { monthlyPrice: true, yearlyPrice: true, name: true },
                },
            },
        });

        if (!subscription) {
            return NextResponse.json({ error: "サブスクリプションが見つかりません" }, { status: 404 });
        }

        const previousBalance = subscription.billingBalance;
        const newBalance = previousBalance + amount;
        const requiredAmount = subscription.isYearly
            ? subscription.plan.yearlyPrice
            : subscription.plan.monthlyPrice;

        let activated = false;
        let finalBalance = newBalance;

        if (subscription.status === "PENDING" && newBalance >= requiredAmount) {
            // Auto-activate: deduct plan amount, set dates, change status
            const now = new Date();
            const endDate = new Date(now);
            if (subscription.isYearly) {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            finalBalance = newBalance - requiredAmount;

            await prisma.creatorSubscription.update({
                where: { id: subscriptionId },
                data: {
                    billingBalance: finalBalance,
                    status: "ACTIVE",
                    startDate: now,
                    endDate: endDate,
                    nextBillingDate: endDate,
                },
            });

            // Release the virtual account back to inventory
            await prisma.virtualAccount.updateMany({
                where: {
                    assignedToPaymentId: subscriptionId,
                    purpose: "CREATOR_PLAN",
                },
                data: {
                    isUsed: false,
                    assignedToPaymentId: null,
                    assignedAt: null,
                },
            });

            activated = true;

            console.log(
                `[Admin] Auto-activated plan for ${subscription.creator.displayName} (@${subscription.creator.handle}): ` +
                `balance ${previousBalance} + ${amount} = ${newBalance} → deducted ${requiredAmount} → final ${finalBalance}`
            );
        } else {
            // Just update the balance
            await prisma.creatorSubscription.update({
                where: { id: subscriptionId },
                data: { billingBalance: newBalance },
            });

            console.log(
                `[Admin] billingBalance updated for ${subscription.creator.displayName} (@${subscription.creator.handle}): ` +
                `${previousBalance} → ${newBalance} (+${amount})`
            );
        }

        const activationMessage = activated
            ? ` → ${subscription.plan.name}プランを自動有効化しました（¥${requiredAmount.toLocaleString()}引き落とし）`
            : "";

        return NextResponse.json({
            message: `${subscription.creator.displayName}のプリペイド残高を更新しました${activationMessage}`,
            previousBalance,
            newBalance: finalBalance,
            addedAmount: amount,
            activated,
            deductedAmount: activated ? requiredAmount : 0,
        });
    } catch (error) {
        console.error("Error updating billing balance:", error);
        return NextResponse.json({ error: "残高の更新に失敗しました" }, { status: 500 });
    }
}
