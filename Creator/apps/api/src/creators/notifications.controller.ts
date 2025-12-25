import {
    Controller,
    Get,
    Put,
    Query,
    Param,
    BadRequestException
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("creators/notifications")
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    /**
     * 通知一覧を取得
     * GET /creators/notifications?creatorId=xxx&limit=10
     */
    @Get()
    async getNotifications(
        @Query("creatorId") creatorId?: string,
        @Query("limit") limit?: string
    ) {
        // TODO: セッションからcreatorIdを取得
        if (!creatorId) {
            throw new BadRequestException("creatorIdは必須です");
        }

        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.notificationsService.getNotifications(creatorId, limitNum);
    }

    /**
     * 未読通知数を取得
     * GET /creators/notifications/unread-count?creatorId=xxx
     */
    @Get("unread-count")
    async getUnreadCount(@Query("creatorId") creatorId: string) {
        if (!creatorId) {
            throw new BadRequestException("creatorIdは必須です");
        }

        const count = await this.notificationsService.getUnreadCount(creatorId);
        return { count };
    }

    /**
     * 通知を既読にする
     * PUT /creators/notifications/:id/read
     */
    @Put(":id/read")
    async markAsRead(@Param("id") id: string) {
        return this.notificationsService.markAsRead(id);
    }

    /**
     * すべての通知を既読にする
     * PUT /creators/notifications/mark-all-read?creatorId=xxx
     */
    @Put("mark-all-read")
    async markAllAsRead(@Query("creatorId") creatorId: string) {
        if (!creatorId) {
            throw new BadRequestException("creatorIdは必須です");
        }

        return this.notificationsService.markAllAsRead(creatorId);
    }
}
