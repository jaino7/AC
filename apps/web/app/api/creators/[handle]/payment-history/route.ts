import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const { handle } = params;

        // Get creator by handle
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle },
            select: { id: true, userId: true },
        });

        if (!creator) {
            return NextResponse.json(
                { error: "クリエイターが見つかりません" },
                { status: 404 }
            );
        }

        // Verify ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user || user.id !== creator.userId) {
            return NextResponse.json(
                { error: "アクセス権限がありません" },
                { status: 403 }
            );
        }

        // Get payment history (last 12 months)
        const paymentHistory: Array<{ date: string; amount: number }> = [];
        const now = new Date();

        for (let i = 0; i < 12; i++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth() + 1;

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);

            // Get earnings for this month
            const [purchaseTotal, subscriptionTotal] = await Promise.all([
                prisma.purchase.aggregate({
                    where: {
                        fan: {
                            creatorId: creator.id,
                        },
                        purchasedAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    _sum: {
                        amount: true,
                    },
                }),
                prisma.transaction.aggregate({
                    where: {
                        creatorId: creator.id,
                        status: "PAID",
                        paidAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    _sum: {
                        amount: true,
                    },
                }),
            ]);

            const totalAmount = (purchaseTotal._sum.amount || 0) + (subscriptionTotal._sum.amount || 0);

            // Only include months with earnings
            if (totalAmount > 0) {
                // Format as YYYY/MM/DD (last day of month)
                const lastDay = new Date(year, month, 0).getDate();
                paymentHistory.push({
                    date: `${year}/${String(month).padStart(2, '0')}/${String(lastDay).padStart(2, '0')}`,
                    amount: totalAmount,
                });
            }
        }

        return NextResponse.json({
            paymentHistory,
        });
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return NextResponse.json(
            { error: "支払い履歴の取得に失敗しました" },
            { status: 500 }
        );
    }
}
