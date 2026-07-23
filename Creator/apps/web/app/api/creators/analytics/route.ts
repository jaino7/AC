import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

type DailyPlanCount = {
    date: Date;
    count: number;
    planId: string;
};

type DailyRevenue = {
    date: Date;
    total: number;
};

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!creatorProfile) {
            return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30", 10);

        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const endDate = now;
        const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);
        const prevEndDate = startDate;

        const [
            activePlanMembers,
            newMembers,
            cancellations,
            currentRevenue,
            prevRevenue,
            dailyData,
            plans,
            dailySubRevenue,
        ] = await Promise.all([
            prisma.subscription.count({
                where: {
                    fan: { creatorId: creatorProfile.id },
                    status: "ACTIVE",
                },
            }),
            prisma.subscription.count({
                where: {
                    fan: { creatorId: creatorProfile.id },
                    startDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            }),
            prisma.subscription.count({
                where: {
                    fan: { creatorId: creatorProfile.id },
                    status: { in: ["CANCELLED", "EXPIRED"] },
                    endDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            }),
            prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
                    status: "PAID",
                    paidAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
                    status: "PAID",
                    paidAt: {
                        gte: prevStartDate,
                        lt: prevEndDate,
                    },
                },
                _sum: { amount: true },
            }),
            prisma.$queryRaw<DailyPlanCount[]>`
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
            `,
            prisma.subscriptionPlan.findMany({
                where: { creatorId: creatorProfile.id },
                select: {
                    id: true,
                    name: true,
                },
            }),
            prisma.$queryRaw<DailyRevenue[]>`
                SELECT
                    DATE("paidAt") as date,
                    COALESCE(SUM("amount"), 0)::int as total
                FROM "Transaction"
                WHERE "creatorId" = ${creatorProfile.id}
                AND "status" = 'PAID'
                AND "paidAt" >= ${startDate}
                AND "paidAt" <= ${endDate}
                GROUP BY DATE("paidAt")
                ORDER BY date
            `,
        ]);

        const revenue30d = currentRevenue._sum.amount || 0;
        const prevRevenueValue = prevRevenue._sum.amount || 0;
        const revenueChange = prevRevenueValue > 0
            ? Math.round(((revenue30d - prevRevenueValue) / prevRevenueValue) * 100)
            : revenue30d > 0 ? 999 : 0;

        const charts: Record<string, Array<{ date: string; count: number }>> = {};
        plans.forEach((plan) => {
            charts[plan.id] = [];
        });

        const revenueChart: Array<{ date: string; amount: number }> = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split("T")[0];

            plans.forEach((plan) => {
                const count = dailyData
                    .filter((d) => d.planId === plan.id && d.date.toISOString().split("T")[0] === dateStr)
                    .reduce((sum, d) => sum + d.count, 0);
                charts[plan.id].push({ date: dateStr, count });
            });

            const dayRevenue = dailySubRevenue.find(
                (d) => d.date.toISOString().split("T")[0] === dateStr
            );
            revenueChart.push({ date: dateStr, amount: dayRevenue?.total || 0 });
        }

        return NextResponse.json({
            plans: {
                revenue30d,
                planMembers: activePlanMembers,
                acquiredMembers30d: newMembers,
                cancellations30d: cancellations,
                revenueChange,
            },
            charts,
            revenueChart,
            planNames: Object.fromEntries(plans.map((plan) => [plan.id, plan.name])),
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
