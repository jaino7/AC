import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // クエリパラメータから期間とタブを取得
        const { searchParams } = new URL(request.url);
        const tab = searchParams.get("tab") || "plans"; // "plans" or "purchases"
        const days = parseInt(searchParams.get("days") || "30", 10);

        // 期間の計算
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const endDate = now;

        // 前期間（比較用）
        const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
        const prevEndDate = startDate;

        // 全体の収益データ（タブに関係なく取得）
        const [totalPurchaseRevenue, totalSubscriptionRevenue, prevTotalPurchaseRevenue, prevTotalSubscriptionRevenue] = await Promise.all([
            // 現在期間の単体購入収益
            prisma.purchase.aggregate({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
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
            // 現在期間のサブスク収益
            prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
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
            // 前期間の単体購入収益
            prisma.purchase.aggregate({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: prevStartDate,
                        lt: prevEndDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
            // 前期間のサブスク収益
            prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
                    status: "PAID",
                    paidAt: {
                        gte: prevStartDate,
                        lt: prevEndDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        const currentPurchaseRevenue = totalPurchaseRevenue._sum.amount || 0;
        const currentSubscriptionRevenue = totalSubscriptionRevenue._sum.amount || 0;
        const currentTotalRevenue = currentPurchaseRevenue + currentSubscriptionRevenue;

        const prevPurchaseRevenue = prevTotalPurchaseRevenue._sum.amount || 0;
        const prevSubscriptionRevenue = prevTotalSubscriptionRevenue._sum.amount || 0;
        const prevTotalRevenue = prevPurchaseRevenue + prevSubscriptionRevenue;

        const totalRevenueChange = prevTotalRevenue > 0
            ? Math.round(((currentTotalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100)
            : currentTotalRevenue > 0 ? 999 : 0;

        const overallRevenue = {
            totalRevenue: currentTotalRevenue,
            purchaseRevenue: currentPurchaseRevenue,
            subscriptionRevenue: currentSubscriptionRevenue,
            revenueChange: totalRevenueChange,
        };

        if (tab === "plans") {
            // プラン購入者のアナリティクス
            // 現在のアクティブなサブスク数
            const activePlanMembers = await prisma.subscription.count({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    status: "ACTIVE",
                },
            });

            // 期間内の新規獲得
            const newMembers = await prisma.subscription.count({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    startDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            // 期間内の解約
            const cancellations = await prisma.subscription.count({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    status: {
                        in: ["CANCELLED", "EXPIRED"],
                    },
                    endDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            // 期間内の収益
            const currentRevenue = await prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
                    status: "PAID",
                    paidAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            });

            // 前期間の収益（比較用）
            const prevRevenue = await prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
                    status: "PAID",
                    paidAt: {
                        gte: prevStartDate,
                        lt: prevEndDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            });

            const revenue30d = currentRevenue._sum.amount || 0;
            const prevRevenueValue = prevRevenue._sum.amount || 0;
            const revenueChange = prevRevenueValue > 0
                ? Math.round(((revenue30d - prevRevenueValue) / prevRevenueValue) * 100)
                : revenue30d > 0 ? 999 : 0;

            // チャートデータ（日別）
            const dailyData = await prisma.$queryRaw<Array<{ date: Date; count: number; planId: string }>>`
                SELECT
                    DATE("startDate") as date,
                    COUNT(*)::int as count,
                    "planId"
                FROM "Subscription"
                WHERE "fanId" IN (
                    SELECT id FROM "FanProfile" WHERE "creatorId" = ${creatorProfile.id}
                )
                AND "startDate" >= ${startDate}
                AND "startDate" <= ${endDate}
                GROUP BY DATE("startDate"), "planId"
                ORDER BY date
            `;

            // プラン情報を取得
            const plans = await prisma.subscriptionPlan.findMany({
                where: {
                    creatorId: creatorProfile.id,
                },
                select: {
                    id: true,
                    name: true,
                },
            });

            // プランごとにチャートデータを整理
            const chartData: { [planId: string]: Array<{ date: string; count: number }> } = {};
            plans.forEach((plan) => {
                chartData[plan.id] = [];
            });

            // 日付ごとにデータを集計
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split("T")[0];

                plans.forEach((plan) => {
                    const dayData = dailyData.filter(
                        (d) => d.planId === plan.id && d.date.toISOString().split("T")[0] === dateStr
                    );
                    const count = dayData.reduce((sum, d) => sum + d.count, 0);
                    chartData[plan.id].push({ date: dateStr, count });
                });
            }

            return NextResponse.json({
                overall: overallRevenue,
                plans: {
                    revenue30d,
                    planMembers: activePlanMembers,
                    acquiredMembers30d: newMembers,
                    cancellations30d: cancellations,
                    revenueChange,
                },
                charts: chartData,
            });
        } else {
            // 単体購入のアナリティクス
            // 期間内の購入本数
            const purchaseCount = await prisma.purchase.count({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            // 期間内のユニークな購入者数
            const purchaserCount = await prisma.purchase.groupBy({
                by: ["fanId"],
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            // 期間内の収益
            const currentRevenue = await prisma.purchase.aggregate({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            });

            // 前期間の収益
            const prevRevenue = await prisma.purchase.aggregate({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: prevStartDate,
                        lt: prevEndDate,
                    },
                },
                _sum: {
                    amount: true,
                },
            });

            const revenue30d = currentRevenue._sum.amount || 0;
            const prevRevenueValue = prevRevenue._sum.amount || 0;
            const revenueChange = prevRevenueValue > 0
                ? Math.round(((revenue30d - prevRevenueValue) / prevRevenueValue) * 100)
                : revenue30d > 0 ? 999 : 0;

            const averagePrice = purchaseCount > 0 ? Math.round(revenue30d / purchaseCount) : 0;

            // 前期間の購入本数
            const prevPurchaseCount = await prisma.purchase.count({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: prevStartDate,
                        lt: prevEndDate,
                    },
                },
            });

            const purchaseCountChange = prevPurchaseCount > 0
                ? Math.round(((purchaseCount - prevPurchaseCount) / prevPurchaseCount) * 100)
                : purchaseCount > 0 ? 999 : 0;

            // チャートデータ（日別購入本数）
            const dailyPurchases = await prisma.$queryRaw<Array<{ date: Date; count: number }>>`
                SELECT
                    DATE("purchasedAt") as date,
                    COUNT(*)::int as count
                FROM "Purchase"
                WHERE "fanId" IN (
                    SELECT id FROM "FanProfile" WHERE "creatorId" = ${creatorProfile.id}
                )
                AND "purchasedAt" >= ${startDate}
                AND "purchasedAt" <= ${endDate}
                GROUP BY DATE("purchasedAt")
                ORDER BY date
            `;

            // 日付ごとのデータを整形
            const chartData: Array<{ date: string; count: number }> = [];
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split("T")[0];

                const dayData = dailyPurchases.find(
                    (d) => d.date.toISOString().split("T")[0] === dateStr
                );
                chartData.push({
                    date: dateStr,
                    count: dayData?.count || 0,
                });
            }

            return NextResponse.json({
                overall: overallRevenue,
                purchases: {
                    revenue30d,
                    purchaseCount30d: purchaseCount,
                    purchaserCount30d: purchaserCount.length,
                    averagePrice,
                    revenueChange,
                    purchaseCountChange,
                },
                charts: {
                    purchases: chartData,
                },
            });
        }
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "アナリティクスの取得に失敗しました" },
            { status: 500 }
        );
    }
}
