import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface RevenueData {
    date: string;
    amount: number;
    count: number;
}

interface SubscriberData {
    date: string;
    count: number;
    new: number;
}

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 売上データを集計
     * @param creatorId クリエイターID
     * @param period 期間（日数）
     */
    async getRevenueData(creatorId: string, period: number = 30): Promise<RevenueData[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const transactions = await this.prisma.transaction.findMany({
            where: {
                creatorId,
                status: "PAID",
                paidAt: {
                    gte: startDate
                }
            },
            select: {
                amount: true,
                paidAt: true
            },
            orderBy: {
                paidAt: "asc"
            }
        });

        // 日付ごとにグループ化
        const revenueByDate = new Map<string, { amount: number; count: number }>();

        transactions.forEach(tx => {
            if (!tx.paidAt) return;

            const dateKey = tx.paidAt.toISOString().split("T")[0];
            const existing = revenueByDate.get(dateKey) || { amount: 0, count: 0 };

            revenueByDate.set(dateKey, {
                amount: existing.amount + tx.amount,
                count: existing.count + 1
            });
        });

        // 配列に変換
        const result: RevenueData[] = [];
        revenueByDate.forEach((value, date) => {
            result.push({
                date,
                amount: value.amount,
                count: value.count
            });
        });

        return result;
    }

    /**
     * サブスクライバー推移データを取得
     * @param creatorId クリエイターID
     * @param period 期間（日数）
     */
    async getSubscriberGrowth(creatorId: string, period: number = 30): Promise<SubscriberData[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        const endDate = new Date();

        // 期間開始時点での登録者数を取得
        const initialSubscribers = await this.prisma.subscription.count({
            where: {
                plan: {
                    creatorId
                },
                createdAt: {
                    lt: startDate
                },
                status: "ACTIVE"
            }
        });

        // 指定期間内のサブスクリプション作成データを取得
        const subscriptions = await this.prisma.subscription.findMany({
            where: {
                plan: {
                    creatorId
                },
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                createdAt: true,
                status: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        // 期間内の全日付を生成
        const dateMap = new Map<string, number>();
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split("T")[0];
            dateMap.set(dateKey, 0);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // 日付ごとの新規登録数をカウント
        subscriptions.forEach(sub => {
            const dateKey = sub.createdAt.toISOString().split("T")[0];
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
        });

        // 累積カウントを計算
        const result: SubscriberData[] = [];
        let cumulativeCount = initialSubscribers;

        // 日付順にソート
        const sortedDates = Array.from(dateMap.keys()).sort();

        sortedDates.forEach(date => {
            const newCount = dateMap.get(date) || 0;
            cumulativeCount += newCount;
            result.push({
                date,
                count: cumulativeCount,
                new: newCount
            });
        });

        return result;
    }

    /**
     * サブスクリプション統計を取得
     */
    async getSubscriptionStats(creatorId: string) {
        // アクティブなサブスクリプション数
        const activeSubscribers = await this.prisma.subscription.count({
            where: {
                plan: {
                    creatorId
                },
                status: "ACTIVE"
            }
        });

        // 総収益を計算
        const transactions = await this.prisma.transaction.aggregate({
            where: {
                creatorId,
                status: "PAID"
            },
            _sum: {
                amount: true
            }
        });

        const totalRevenue = transactions._sum.amount || 0;

        // プラン別の統計
        const plans = await this.prisma.subscriptionPlan.findMany({
            where: {
                creatorId
            },
            select: {
                id: true,
                name: true,
                price: true,
                _count: {
                    select: {
                        subscriptions: {
                            where: {
                                status: "ACTIVE"
                            }
                        }
                    }
                }
            }
        });

        return {
            activeSubscribers,
            totalRevenue,
            plans: plans.map(plan => ({
                id: plan.id,
                name: plan.name,
                price: plan.price,
                subscriberCount: plan._count.subscriptions
            }))
        };
    }

    /**
     * 最近の取引履歴を取得
     */
    async getRecentTransactions(creatorId: string, limit: number = 10) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                creatorId,
                status: "PAID"
            },
            orderBy: {
                paidAt: "desc"
            },
            take: limit
        });

        return transactions.map(tx => ({
            id: tx.id,
            date: tx.paidAt?.toISOString().split("T")[0] || "",
            type: tx.subscriptionId ? "サブスクリプション" : "購入",
            user: tx.userId || "不明",
            amount: tx.amount,
            planName: "",
            status: tx.status
        }));
    }

    /**
     * ダッシュボードサマリーを取得
     */
    async getDashboardSummary(creatorId: string) {
        const [revenueData, subscriptionStats, recentTransactions, subscriberGrowth] = await Promise.all([
            this.getRevenueData(creatorId, 30),
            this.getSubscriptionStats(creatorId),
            this.getRecentTransactions(creatorId, 10),
            this.getSubscriberGrowth(creatorId, 30)
        ]);

        // 今月の売上
        const thisMonthRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);

        // 先月の売上（比較用）
        const lastMonthData = await this.getRevenueData(creatorId, 60);
        const lastMonthRevenue = lastMonthData
            .slice(0, 30)
            .reduce((sum, item) => sum + item.amount, 0);

        const revenueGrowth = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        // その日の収益
        const today = new Date().toISOString().split("T")[0];
        const todayRevenue = revenueData.find(item => item.date === today)?.amount || 0;

        return {
            todayRevenue,
            thisMonthRevenue,
            revenueGrowth: Math.round(revenueGrowth * 10) / 10, // 小数点1桁
            activeSubscribers: subscriptionStats.activeSubscribers,
            totalRevenue: subscriptionStats.totalRevenue,
            revenueChart: revenueData,
            subscriberChart: subscriberGrowth,
            plans: subscriptionStats.plans,
            recentTransactions
        };
    }
}
