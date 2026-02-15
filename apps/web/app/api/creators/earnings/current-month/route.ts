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

        // 実際のデータベースから収益を取得
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const currentYear = now.getFullYear();
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        // 今月の開始日・終了日
        const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

        // 先月の開始日・終了日
        const lastMonthStart = new Date(lastMonthYear, lastMonth - 1, 1);
        const lastMonthEnd = new Date(lastMonthYear, lastMonth, 0, 23, 59, 59, 999);

        // 今月の収益（単体購入 + サブスク）
        const [currentMonthPurchases, currentMonthSubscriptions] = await Promise.all([
            // 単体購入の合計
            prisma.purchase.aggregate({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: currentMonthStart,
                        lte: currentMonthEnd,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
            // サブスク収益の合計（Transactionから取得）
            prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
                    status: "PAID",
                    paidAt: {
                        gte: currentMonthStart,
                        lte: currentMonthEnd,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        const currentMonthEarnings =
            (currentMonthPurchases._sum.amount || 0) +
            (currentMonthSubscriptions._sum.amount || 0);

        // 先月の収益（単体購入 + サブスク）
        const [lastMonthPurchases, lastMonthSubscriptions] = await Promise.all([
            prisma.purchase.aggregate({
                where: {
                    fan: {
                        creatorId: creatorProfile.id,
                    },
                    purchasedAt: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
            prisma.transaction.aggregate({
                where: {
                    creatorId: creatorProfile.id,
                    status: "PAID",
                    paidAt: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd,
                    },
                },
                _sum: {
                    amount: true,
                },
            }),
        ]);

        const lastMonthEarnings =
            (lastMonthPurchases._sum.amount || 0) +
            (lastMonthSubscriptions._sum.amount || 0);

        // 直近のアクティビティ（過去24時間）
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 単体購入のアクティビティ
        const recentPurchaseActivities = await prisma.purchase.findMany({
            where: {
                fan: {
                    creatorId: creatorProfile.id,
                },
                purchasedAt: {
                    gte: twentyFourHoursAgo,
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
            take: 10,
        });

        // サブスク更新のアクティビティ
        const recentTransactionActivities = await prisma.transaction.findMany({
            where: {
                creatorId: creatorProfile.id,
                status: "PAID",
                paidAt: {
                    gte: twentyFourHoursAgo,
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
            take: 10,
        });

        // アクティビティをマージしてソート
        const allActivities = [
            ...recentPurchaseActivities.map((p: any) => ({
                id: p.id,
                type: "単体購入",
                amount: p.amount,
                createdAt: p.purchasedAt,
            })),
            ...recentTransactionActivities.map((t: any) => ({
                id: t.id,
                type: "サブスク更新",
                amount: t.amount,
                createdAt: t.paidAt!,
            })),
        ]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);

        // 時間差を計算
        const getTimeAgo = (date: Date) => {
            const diffMs = Date.now() - date.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

            if (diffMins < 60) {
                return `${diffMins}分前`;
            } else if (diffHours < 24) {
                return `${diffHours}時間前`;
            } else {
                return `${Math.floor(diffHours / 24)}日前`;
            }
        };

        const recentActivities = allActivities.map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            amount: activity.amount,
            timeAgo: getTimeAgo(activity.createdAt),
            createdAt: activity.createdAt.toISOString(),
        }));

        return NextResponse.json({
            currentMonth: {
                year: currentYear,
                month: currentMonth,
                earnings: currentMonthEarnings,
            },
            lastMonth: {
                year: lastMonthYear,
                month: lastMonth,
                earnings: lastMonthEarnings,
            },
            nextPaymentDate: new Date(currentYear, currentMonth, 0), // 今月末
            recentActivities,
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        return NextResponse.json(
            { error: "収益の取得に失敗しました" },
            { status: 500 }
        );
    }
}
