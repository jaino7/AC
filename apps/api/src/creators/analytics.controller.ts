import {
    Controller,
    Get,
    Query,
    BadRequestException
} from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";

@Controller("creators/analytics")
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * 売上データを取得
     * GET /creators/analytics/revenue?creatorId=xxx&period=30
     */
    @Get("revenue")
    async getRevenue(
        @Query("creatorId") creatorId: string,
        @Query("period") period?: string
    ) {
        if (!creatorId) {
            throw new BadRequestException("クリエイターIDは必須です");
        }

        const periodDays = period ? parseInt(period, 10) : 30;

        if (isNaN(periodDays) || periodDays < 1 || periodDays > 365) {
            throw new BadRequestException("期間は1〜365日の範囲で指定してください");
        }

        return this.analyticsService.getRevenueData(creatorId, periodDays);
    }

    /**
     * サブスクリプション統計を取得
     * GET /creators/analytics/subscribers?creatorId=xxx
     */
    @Get("subscribers")
    async getSubscribers(@Query("creatorId") creatorId: string) {
        if (!creatorId) {
            throw new BadRequestException("クリエイターIDは必須です");
        }

        return this.analyticsService.getSubscriptionStats(creatorId);
    }

    /**
     * ダッシュボードサマリーを取得
     * GET /creators/analytics/dashboard?creatorId=xxx&period=28
     */
    @Get("dashboard")
    async getDashboard(
        @Query("creatorId") creatorId: string,
        @Query("period") period?: string
    ) {
        if (!creatorId) {
            throw new BadRequestException("クリエイターIDは必須です");
        }

        const periodDays = period ? parseInt(period, 10) : 30;

        // 指定期間のデータを取得
        const [dashboardData, periodRevenue, periodSubscribers] = await Promise.all([
            this.analyticsService.getDashboardSummary(creatorId),
            this.analyticsService.getRevenueData(creatorId, periodDays),
            this.analyticsService.getSubscriberGrowth(creatorId, periodDays)
        ]);

        return {
            ...dashboardData,
            revenueChart: periodRevenue,
            subscriberChart: periodSubscribers
        };
    }
}
