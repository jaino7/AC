import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

interface CreateNotificationDto {
    creatorId: string;
    type: "PURCHASE" | "ANNOUNCEMENT" | "PAYMENT_REMINDER" | "SUBSCRIBER" | "COMMENT";
    title: string;
    message: string;
    metadata?: any;
}

@Injectable()
export class NotificationsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 通知を作成
     */
    async createNotification(dto: CreateNotificationDto) {
        const notification = await this.prisma.notification.create({
            data: {
                creatorId: dto.creatorId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                metadata: dto.metadata || null
            }
        });

        // メール送信が有効な場合、メールを送信
        await this.sendEmailNotification(notification.id);

        return notification;
    }

    /**
     * 通知一覧を取得
     */
    async getNotifications(creatorId: string, limit: number = 10) {
        return this.prisma.notification.findMany({
            where: { creatorId },
            orderBy: { createdAt: "desc" },
            take: limit
        });
    }

    /**
     * 未読通知数を取得
     */
    async getUnreadCount(creatorId: string): Promise<number> {
        return this.prisma.notification.count({
            where: {
                creatorId,
                isRead: false
            }
        });
    }

    /**
     * 通知を既読にする
     */
    async markAsRead(notificationId: string) {
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
    }

    /**
     * すべての通知を既読にする
     */
    async markAllAsRead(creatorId: string) {
        return this.prisma.notification.updateMany({
            where: {
                creatorId,
                isRead: false
            },
            data: { isRead: true }
        });
    }

    /**
     * プラン購入通知を作成
     */
    async createPurchaseNotification(
        creatorId: string,
        userName: string,
        planName: string,
        amount: number
    ) {
        return this.createNotification({
            creatorId,
            type: "PURCHASE",
            title: "新しい購入",
            message: `${userName}が${planName}を購入しました`,
            metadata: {
                userName,
                planName,
                amount
            }
        });
    }

    /**
     * お知らせ通知を作成
     */
    async createAnnouncementNotification(creatorId: string, title: string, message: string) {
        return this.createNotification({
            creatorId,
            type: "ANNOUNCEMENT",
            title,
            message
        });
    }

    /**
     * お支払日のご案内通知を作成
     */
    async createPaymentReminderNotification(creatorId: string, dueDate: Date, amount: number) {
        return this.createNotification({
            creatorId,
            type: "PAYMENT_REMINDER",
            title: "お支払日のご案内",
            message: `${dueDate.toLocaleDateString()}までに¥${amount.toLocaleString()}のお支払いをお願いします`,
            metadata: {
                dueDate: dueDate.toISOString(),
                amount
            }
        });
    }

    /**
     * メール通知を送信
     */
    private async sendEmailNotification(notificationId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
            include: { creator: { include: { user: true } } }
        });

        if (!notification) return;

        // クリエイターの通知設定を確認
        const emailEnabled = notification.creator.user.email; // TODO: 通知設定を確認

        if (!emailEnabled) return;

        // TODO: 実際のメール送信処理
        // メール送信サービスを使用（SendGrid、AWS SESなど）
        console.log(`Sending email to ${notification.creator.user.email}:`, {
            title: notification.title,
            message: notification.message
        });

        // メール送信済みフラグを更新
        await this.prisma.notification.update({
            where: { id: notificationId },
            data: { emailSent: true }
        });
    }
}
