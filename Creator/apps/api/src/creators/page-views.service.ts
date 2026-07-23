import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface PageViewData {
    date: string;
    views: number;
}

@Injectable()
export class PageViewsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * ページビューを記録
     */
    async recordPageView(
        creatorId: string,
        path: string,
        userAgent?: string,
        referer?: string
    ) {
        return this.prisma.pageView.create({
            data: {
                creatorId,
                path,
                userAgent,
                referer
            }
        });
    }

    /**
     * 閲覧数を集計（期間指定）
     */
    async getPageViews(creatorId: string, period: number = 30): Promise<PageViewData[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const pageViews = await this.prisma.pageView.findMany({
            where: {
                creatorId,
                viewedAt: {
                    gte: startDate
                }
            },
            select: {
                viewedAt: true
            },
            orderBy: {
                viewedAt: "asc"
            }
        });

        // 日付ごとにグループ化
        const viewsByDate = new Map<string, number>();

        pageViews.forEach(pv => {
            const dateKey = pv.viewedAt.toISOString().split("T")[0];
            viewsByDate.set(dateKey, (viewsByDate.get(dateKey) || 0) + 1);
        });

        // 配列に変換
        const result: PageViewData[] = [];
        viewsByDate.forEach((views, date) => {
            result.push({ date, views });
        });

        return result;
    }

    /**
     * 総閲覧数を取得
     */
    async getTotalPageViews(creatorId: string): Promise<number> {
        return this.prisma.pageView.count({
            where: { creatorId }
        });
    }

    /**
     * 人気ページを取得
     */
    async getPopularPages(creatorId: string, limit: number = 10) {
        const result = await this.prisma.pageView.groupBy({
            by: ["path"],
            where: { creatorId },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: "desc"
                }
            },
            take: limit
        });

        return result.map(item => ({
            path: item.path,
            views: item._count.id
        }));
    }

    /**
     * 閲覧統計サマリー
     */
    async getViewsStatistics(creatorId: string) {
        const [totalViews, last30DaysViews, popularPages] = await Promise.all([
            this.getTotalPageViews(creatorId),
            this.getPageViews(creatorId, 30),
            this.getPopularPages(creatorId, 5)
        ]);

        // 今月の閲覧数
        const thisMonthViews = last30DaysViews.reduce((sum, item) => sum + item.views, 0);

        // 先月の閲覧数（比較用）
        const last60DaysData = await this.getPageViews(creatorId, 60);
        const lastMonthViews = last60DaysData
            .slice(0, 30)
            .reduce((sum, item) => sum + item.views, 0);

        const viewsGrowth = lastMonthViews > 0
            ? ((thisMonthViews - lastMonthViews) / lastMonthViews) * 100
            : 0;

        return {
            totalViews,
            thisMonthViews,
            viewsGrowth: Math.round(viewsGrowth * 10) / 10,
            viewsChart: last30DaysViews,
            popularPages
        };
    }
}
