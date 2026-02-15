import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentMatchingService {
    private readonly logger = new Logger(PaymentMatchingService.name);

    constructor(private prisma: PrismaService) { }

    async matchAndProcess(
        transferData: {
            amount: number;
            transferorName: string;
            identifierCode: string;
            transferDate: Date;
        },
        emailMeta: {
            emailUid: string;
            subject: string;
            from: string;
            receivedAt: Date;
        },
    ) {
        // 識別コードと金額でPENDINGのTransactionを検索
        const transaction = await this.prisma.transaction.findFirst({
            where: {
                identifierCode: transferData.identifierCode,
                amount: transferData.amount,
                status: 'PENDING',
            },
            include: {
                creator: {
                    include: {
                        plans: true,
                    },
                },
            },
        });

        if (!transaction) {
            this.logger.warn(
                `No matching transaction found for code: ${transferData.identifierCode}, amount: ${transferData.amount}`,
            );

            // 処理済みメールとして記録（マッチなし）
            await this.prisma.processedEmail.create({
                data: {
                    emailUid: emailMeta.emailUid,
                    subject: emailMeta.subject,
                    from: emailMeta.from,
                    receivedAt: emailMeta.receivedAt,
                },
            });

            return;
        }

        this.logger.log(`Matched transaction: ${transaction.id}`);

        // Prisma Interactive Transaction で原子性を保証
        await this.prisma.$transaction(async (tx) => {
            // 1. Transactionを PAID に更新
            await tx.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    transferorName: transferData.transferorName,
                    transferDate: transferData.transferDate,
                },
            });

            // 2. Subscriptionを作成または延長
            if (transaction.subscriptionId) {
                // 既存のSubscriptionを延長
                const subscription = await tx.subscription.findUnique({
                    where: { id: transaction.subscriptionId },
                });

                if (!subscription) return;
                const currentEndDate = subscription.endDate || new Date();
                const newEndDate = new Date(currentEndDate);
                newEndDate.setMonth(newEndDate.getMonth() + 1); // 1ヶ月延長

                await tx.subscription.update({
                    where: { id: transaction.subscriptionId },
                    data: {
                        endDate: newEndDate,
                        status: 'ACTIVE',
                    },
                });

                this.logger.log(
                    `Extended subscription ${transaction.subscriptionId} until ${newEndDate}`,
                );
            } else {
                // 新規Subscriptionを作成
                const plan = await tx.subscriptionPlan.findFirst({
                    where: {
                        creatorId: transaction.creatorId,
                        price: transaction.amount,
                    },
                });

                if (plan && transaction.userId) {
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + 1); // 1ヶ月後

                    const fanProfile = await tx.fanProfile.findFirst({
                        where: {
                            userId: transaction.userId,
                            creatorId: transaction.creatorId,
                        },
                    });

                    if (!fanProfile) return;

                    const newSubscription = await tx.subscription.create({
                        data: {
                            fanId: fanProfile.id,
                            planId: plan.id,
                            status: 'ACTIVE',
                            endDate,
                        },
                    });

                    // TransactionにSubscriptionを紐付け
                    await tx.transaction.update({
                        where: { id: transaction.id },
                        data: {
                            subscriptionId: newSubscription.id,
                        },
                    });

                    this.logger.log(`Created new subscription: ${newSubscription.id}`);
                }
            }

            // 3. 処理済みメールを記録
            await tx.processedEmail.create({
                data: {
                    emailUid: emailMeta.emailUid,
                    subject: emailMeta.subject,
                    from: emailMeta.from,
                    receivedAt: emailMeta.receivedAt,
                    transactionId: transaction.id,
                },
            });
        });

        this.logger.log(
            `Successfully processed payment for transaction ${transaction.id}`,
        );
    }
}
