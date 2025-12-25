import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    BadRequestException
} from "@nestjs/common";
import { PageViewsService } from "./page-views.service";

interface RecordPageViewDto {
    creatorId: string;
    path: string;
    userAgent?: string;
    referer?: string;
}

@Controller("creators/page-views")
export class PageViewsController {
    constructor(private readonly pageViewsService: PageViewsService) { }

    /**
     * ページビューを記録
     * POST /creators/page-views
     */
    @Post()
    async recordPageView(@Body() dto: RecordPageViewDto) {
        const { creatorId, path, userAgent, referer } = dto;

        if (!creatorId || !path) {
            throw new BadRequestException("creatorIdとpathは必須です");
        }

        return this.pageViewsService.recordPageView(
            creatorId,
            path,
            userAgent,
            referer
        );
    }

    /**
     * 閲覧数データを取得
     * GET /creators/page-views/data?creatorId=xxx&period=30
     */
    @Get("data")
    async getPageViews(
        @Query("creatorId") creatorId: string,
        @Query("period") period?: string
    ) {
        if (!creatorId) {
            throw new BadRequestException("creatorIdは必須です");
        }

        const periodDays = period ? parseInt(period, 10) : 30;

        if (isNaN(periodDays) || periodDays < 1 || periodDays > 365) {
            throw new BadRequestException("期間は1〜365日の範囲で指定してください");
        }

        return this.pageViewsService.getPageViews(creatorId, periodDays);
    }

    /**
     * 閲覧統計サマリーを取得
     * GET /creators/page-views/statistics?creatorId=xxx
     */
    @Get("statistics")
    async getStatistics(@Query("creatorId") creatorId: string) {
        if (!creatorId) {
            throw new BadRequestException("creatorIdは必須です");
        }

        return this.pageViewsService.getViewsStatistics(creatorId);
    }

    /**
     * 人気ページを取得
     * GET /creators/page-views/popular?creatorId=xxx&limit=10
     */
    @Get("popular")
    async getPopularPages(
        @Query("creatorId") creatorId: string,
        @Query("limit") limit?: string
    ) {
        if (!creatorId) {
            throw new BadRequestException("creatorIdは必須です");
        }

        const limitNum = limit ? parseInt(limit, 10) : 10;

        return this.pageViewsService.getPopularPages(creatorId, limitNum);
    }
}
