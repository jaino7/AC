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

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
        const lastMonthKey = `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}`;

        // 今月・先月の収益集計（CreatorEarning から手数料控除後の金額）
        const [currentMonthAgg, lastMonthAgg, pendingBalance, recentEarnings, recentPayouts] =
            await Promise.all([
                prisma.creatorEarning.aggregate({
                    where: {
                        creatorId: creatorProfile.id,
                        settlementMonth: currentMonthKey,
                    },
                    _sum: { netAmount: true, grossAmount: true, platformFee: true },
                    _count: true,
                }),
                prisma.creatorEarning.aggregate({
                    where: {
                        creatorId: creatorProfile.id,
                        settlementMonth: lastMonthKey,
                    },
                    _sum: { netAmount: true },
                }),
                // 未精算の合計残高（PENDING のもの全て）
                prisma.creatorEarning.aggregate({
                    where: {
                        creatorId: creatorProfile.id,
                        status: "PENDING",
                    },
                    _sum: { netAmount: true },
                }),
                // 直近の収益一覧（過去24時間）
                prisma.creatorEarning.findMany({
                    where: {
                        creatorId: creatorProfile.id,
                        createdAt: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                }),
                // 直近の支払い履歴
                prisma.creatorPayout.findMany({
                    where: { creatorId: creatorProfile.id },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                }),
            ]);

        // 時間差を計算
        const getTimeAgo = (date: Date) => {
            const diffMs = Date.now() - date.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffMins < 60) return `${diffMins}分前`;
            if (diffHours < 24) return `${diffHours}時間前`;
            return `${Math.floor(diffHours / 24)}日前`;
        };

        const recentActivities = recentEarnings.map((e) => ({
            id: e.id,
            type: e.earningType === "SUBSCRIPTION" ? "サブスクリプション" : "単体購入",
            grossAmount: e.grossAmount,
            platformFee: e.platformFee,
            amount: e.netAmount,
            feeRate: `${(e.feeRate * 100).toFixed(0)}%`,
            timeAgo: getTimeAgo(e.createdAt),
            createdAt: e.createdAt.toISOString(),
        }));

        return NextResponse.json({
            currentMonth: {
                year: currentYear,
                month: currentMonth,
                earnings: currentMonthAgg._sum.netAmount ?? 0,          // 手数料控除後
                grossEarnings: currentMonthAgg._sum.grossAmount ?? 0,   // 控除前
                feesDeducted: currentMonthAgg._sum.platformFee ?? 0,    // 手数料合計
                count: currentMonthAgg._count,
            },
            lastMonth: {
                year: lastMonthYear,
                month: lastMonth,
                earnings: lastMonthAgg._sum.netAmount ?? 0,
            },
            pendingBalance: pendingBalance._sum.netAmount ?? 0,          // 未精算残高
            nextPayoutMinimum: 5000,                                     // 最低振込額
            nextPaymentDate: new Date(currentYear, currentMonth, 0),    // 今月末
            recentActivities,
            recentPayouts: recentPayouts.map((p) => ({
                id: p.id,
                amount: p.amount,
                status: p.status,
                periodMonth: p.periodMonth,
                processedAt: p.processedAt?.toISOString() ?? null,
                createdAt: p.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        return NextResponse.json(
            { error: "収益の取得に失敗しました" },
            { status: 500 }
        );
    }
}
