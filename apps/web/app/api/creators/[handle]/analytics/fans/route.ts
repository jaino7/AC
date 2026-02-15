import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const { handle } = params;

        // Get creator by handle
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle },
            select: { id: true }
        });

        if (!creator) {
            return NextResponse.json(
                { error: "Creator not found" },
                { status: 404 }
            );
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get plan analytics
        const activeSubscriptions = await prisma.subscription.findMany({
            where: {
                plan: {
                    creatorId: creator.id
                },
                status: "ACTIVE"
            },
            include: {
                plan: true,
                transactions: {
                    where: {
                        status: "PAID",
                        paidAt: {
                            gte: thirtyDaysAgo
                        }
                    }
                }
            }
        });

        const newSubscriptions30d = await prisma.subscription.count({
            where: {
                plan: {
                    creatorId: creator.id
                },
                createdAt: {
                    gte: thirtyDaysAgo
                }
            }
        });

        const cancellations30d = await prisma.subscription.count({
            where: {
                plan: {
                    creatorId: creator.id
                },
                status: "CANCELLED",
                updatedAt: {
                    gte: thirtyDaysAgo
                }
            }
        });

        const planRevenue30d = activeSubscriptions.reduce((sum: number, sub: any) => {
            const txSum = sub.transactions.reduce((s: number, tx: any) => s + tx.amount, 0);
            return sum + txSum;
        }, 0);

        // Get purchase analytics
        const purchases30d = await prisma.purchase.findMany({
            where: {
                post: {
                    creatorId: creator.id
                },
                purchasedAt: {
                    gte: thirtyDaysAgo
                }
            },
            include: {
                fan: true
            }
        });

        const purchaseRevenue30d = purchases30d.reduce((sum: number, p: any) => sum + p.amount, 0);
        const uniquePurchasers = new Set(purchases30d.map(p => p.fanId)).size;
        const averagePrice = purchases30d.length > 0
            ? Math.round(purchaseRevenue30d / purchases30d.length)
            : 0;

        // Generate chart data for last 30 days
        const chartData = {
            planA: [] as Array<{ date: string; count: number }>,
            planB: [] as Array<{ date: string; count: number }>,
            purchases: [] as Array<{ date: string; count: number }>
        };

        // Get plans
        const plans = await prisma.subscriptionPlan.findMany({
            where: { creatorId: creator.id },
            select: { id: true, name: true }
        });

        const planMap = new Map(plans.map(p => [p.id, p.name]));

        // Generate daily data for the past 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dateStr = date.toISOString().split('T')[0];

            // Count subscriptions by plan on this day
            const daySubs = await prisma.subscription.findMany({
                where: {
                    plan: {
                        creatorId: creator.id
                    },
                    startDate: {
                        gte: date,
                        lt: nextDate
                    }
                },
                include: {
                    plan: true
                }
            });

            const planACount = daySubs.filter(s => s.plan.name === "プランA").length;
            const planBCount = daySubs.filter(s => s.plan.name === "プランB").length;

            chartData.planA.push({ date: dateStr, count: planACount });
            chartData.planB.push({ date: dateStr, count: planBCount });

            // Count purchases on this day
            const dayPurchases = await prisma.purchase.count({
                where: {
                    post: {
                        creatorId: creator.id
                    },
                    purchasedAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            chartData.purchases.push({ date: dateStr, count: dayPurchases });
        }

        return NextResponse.json({
            plans: {
                revenue30d: planRevenue30d,
                planMembers: activeSubscriptions.length,
                acquiredMembers30d: newSubscriptions30d,
                cancellations30d: cancellations30d
            },
            purchases: {
                revenue30d: purchaseRevenue30d,
                purchaseCount30d: purchases30d.length,
                purchaserCount30d: uniquePurchasers,
                averagePrice: averagePrice
            },
            charts: chartData
        });

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
