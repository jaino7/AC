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
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString(), 10);
        const month = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : null;

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

        // If month is specified, get monthly earnings
        if (month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);

            // Get earnings breakdown
            const [purchaseEarnings, subscriptionEarnings, transactions] = await Promise.all([
                // Purchase earnings
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
                    _count: true,
                }),
                // Subscription earnings
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
                    _count: true,
                }),
                // Get transaction details
                prisma.transaction.findMany({
                    where: {
                        creatorId: creator.id,
                        status: "PAID",
                        paidAt: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                    select: {
                        id: true,
                        amount: true,
                        paidAt: true,
                        subscription: {
                            select: {
                                plan: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        paidAt: "desc",
                    },
                }),
            ]);

            // Get purchase details
            const purchases = await prisma.purchase.findMany({
                where: {
                    fan: {
                        creatorId: creator.id,
                    },
                    purchasedAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    id: true,
                    amount: true,
                    purchasedAt: true,
                    post: {
                        select: {
                            title: true,
                        },
                    },
                },
                orderBy: {
                    purchasedAt: "desc",
                },
            });

            const totalEarnings = (purchaseEarnings._sum.amount || 0) + (subscriptionEarnings._sum.amount || 0);

            return NextResponse.json({
                year,
                month,
                totalEarnings,
                purchaseEarnings: purchaseEarnings._sum.amount || 0,
                subscriptionEarnings: subscriptionEarnings._sum.amount || 0,
                purchaseCount: purchaseEarnings._count,
                subscriptionCount: subscriptionEarnings._count,
                transactions: transactions.map((t) => ({
                    id: t.id,
                    type: "サブスク更新",
                    amount: t.amount,
                    date: t.paidAt,
                    description: t.subscription?.plan?.name || "サブスクリプション",
                })),
                purchases: purchases.map((p) => ({
                    id: p.id,
                    type: "単体購入",
                    amount: p.amount,
                    date: p.purchasedAt,
                    description: p.post.title,
                })),
            });
        }

        // Get yearly earnings (all months)
        const monthlyEarnings = [];

        for (let m = 1; m <= 12; m++) {
            const startDate = new Date(year, m - 1, 1);
            const endDate = new Date(year, m, 0, 23, 59, 59, 999);

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

            const total = (purchaseTotal._sum.amount || 0) + (subscriptionTotal._sum.amount || 0);

            monthlyEarnings.push({
                month: m,
                purchaseEarnings: purchaseTotal._sum.amount || 0,
                subscriptionEarnings: subscriptionTotal._sum.amount || 0,
                totalEarnings: total,
            });
        }

        // Calculate yearly total
        const yearlyTotal = monthlyEarnings.reduce((sum, month) => sum + month.totalEarnings, 0);

        return NextResponse.json({
            year,
            yearlyTotal,
            monthlyEarnings,
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        return NextResponse.json(
            { error: "収益の取得に失敗しました" },
            { status: 500 }
        );
    }
}
