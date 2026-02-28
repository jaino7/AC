import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankDepositDto } from './dto/bank-deposit.dto';
import { BankTransferType, BankTransferStatus } from '@prisma/client';
import { calculateNextBillingDate } from '../common/utils/date.util';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) { }

  /**
   * Make連携: 銀行入金Webhook処理
   * 口座番号から該当ユーザーを特定し、入金を反映
   */
  async processBankDeposit(depositData: BankDepositDto) {
    this.logger.log(
      `Processing bank deposit: ${depositData.accountNumber} - ${depositData.amount}円`,
    );

    // 1. バーチャル口座を検索
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { accountNumber: depositData.accountNumber },
      include: {
        creator: {
          include: {
            creatorSubscription: {
              include: {
                plan: true,
              },
            },
          },
        },
        fan: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!virtualAccount) {
      throw new NotFoundException(
        `Virtual account not found: ${depositData.accountNumber}`,
      );
    }

    // 2. 重複チェック（同じtransactionIdが既に処理済みでないか）
    if (depositData.transactionId) {
      const existing = await this.prisma.bankTransfer.findFirst({
        where: { gmoTransactionId: depositData.transactionId },
      });

      if (existing) {
        this.logger.warn(
          `Duplicate transaction detected: ${depositData.transactionId}`,
        );
        return {
          success: false,
          message: 'Transaction already processed',
          bankTransfer: existing,
        };
      }
    }

    // 3. BankTransferレコードを作成
    const bankTransfer = await this.prisma.bankTransfer.create({
      data: {
        virtualAccountId: virtualAccount.id,
        amount: depositData.amount,
        transferorName: depositData.transferorName,
        transferDate: new Date(depositData.transferDate),
        type: virtualAccount.purpose,
        status: BankTransferStatus.PENDING,
        gmoTransactionId: depositData.transactionId || null,
        webhookPayload: depositData as any,
      },
    });

    // 4. 用途に応じて処理を分岐
    try {
      let result;

      if (virtualAccount.purpose === BankTransferType.CREATOR_PLAN) {
        result = await this.processCreatorPlanPayment(
          bankTransfer,
          virtualAccount,
        );
      } else if (virtualAccount.purpose === BankTransferType.FAN_CREDIT) {
        result = await this.processFanCreditCharge(
          bankTransfer,
          virtualAccount,
        );
      }

      // 処理成功
      await this.prisma.bankTransfer.update({
        where: { id: bankTransfer.id },
        data: {
          status: BankTransferStatus.PROCESSED,
          processedAt: new Date(),
        },
      });

      this.logger.log(
        `Bank deposit processed successfully: ${bankTransfer.id}`,
      );

      return {
        success: true,
        message: 'Deposit processed successfully',
        bankTransfer,
        result,
      };
    } catch (error) {
      // 処理失敗
      await this.prisma.bankTransfer.update({
        where: { id: bankTransfer.id },
        data: {
          status: BankTransferStatus.FAILED,
          errorMessage: (error as any).message,
        },
      });

      this.logger.error(
        `Failed to process bank deposit: ${(error as any).message}`,
        (error as any).stack,
      );

      throw error;
    }
  }

  /**
   * クリエイタープラン支払いを処理
   */
  private async processCreatorPlanPayment(bankTransfer: any, virtualAccount: any) {
    this.logger.log(
      `Processing creator plan payment: ${virtualAccount.creatorId}`,
    );

    if (!virtualAccount.assignedToPaymentId) {
      throw new Error('Virtual account is not assigned to any subscription');
    }

    // CreatorSubscriptionを取得
    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { id: virtualAccount.assignedToPaymentId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error(
        `Subscription not found: ${virtualAccount.assignedToPaymentId}`,
      );
    }

    // 金額チェック
    const expectedAmount = subscription.isYearly
      ? subscription.plan.yearlyPrice
      : subscription.plan.monthlyPrice;

    if (bankTransfer.amount < expectedAmount) {
      this.logger.warn(
        `Payment amount mismatch: expected ${expectedAmount}, received ${bankTransfer.amount}`,
      );
      // 金額不足でもとりあえず処理を続ける（要件に応じて調整）
    }

    // サブスクリプションを有効化
    const now = new Date();
    const endDate = calculateNextBillingDate(now, subscription.isYearly);

    const updatedSubscription = await this.prisma.creatorSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        startDate: now,
        endDate: endDate,
        nextBillingDate: endDate,
      },
    });

    // BankTransferにサブスクリプションIDを紐付け
    await this.prisma.bankTransfer.update({
      where: { id: bankTransfer.id },
      data: {
        creatorSubscriptionId: subscription.id,
      },
    });

    this.logger.log(
      `Creator subscription activated: ${subscription.id} until ${endDate.toISOString()}`,
    );

    return {
      type: 'CREATOR_PLAN',
      subscriptionId: subscription.id,
      planType: subscription.plan.type,
      startDate: now,
      endDate: endDate,
    };
  }

  /**
   * ファンクレジットチャージを処理
   */
  private async processFanCreditCharge(bankTransfer: any, virtualAccount: any) {
    this.logger.log(`Processing fan credit charge: ${virtualAccount.fanId}`);

    if (!virtualAccount.fanId) {
      throw new Error('Virtual account is not assigned to any fan');
    }

    // ファンプロフィールを取得
    const fanProfile = await this.prisma.fanProfile.findUnique({
      where: { id: virtualAccount.fanId },
    });

    if (!fanProfile) {
      throw new Error(`Fan profile not found: ${virtualAccount.fanId}`);
    }

    // クレジット残高を更新
    const updatedFan = await this.prisma.fanProfile.update({
      where: { id: virtualAccount.fanId },
      data: {
        credits: {
          increment: bankTransfer.amount,
        },
      },
    });

    // クレジット履歴を記録
    await this.prisma.creditHistory.create({
      data: {
        fanId: virtualAccount.fanId,
        type: 'CHARGE',
        amount: bankTransfer.amount,
        balance: updatedFan.credits,
        description: `銀行振込でチャージ（${bankTransfer.transferorName}）`,
      },
    });

    // ChargeRequestが存在する場合は更新
    if (virtualAccount.assignedToPaymentId) {
      await this.prisma.chargeRequest.updateMany({
        where: { id: virtualAccount.assignedToPaymentId },
        data: {
          status: 'APPROVED',
          transferorName: bankTransfer.transferorName,
          transferDate: bankTransfer.transferDate,
          approvedAt: new Date(),
        },
      });
    }

    this.logger.log(
      `Fan credit charged: ${virtualAccount.fanId} - ${bankTransfer.amount}円 (残高: ${updatedFan.credits}円)`,
    );

    return {
      type: 'FAN_CREDIT',
      fanId: virtualAccount.fanId,
      amount: bankTransfer.amount,
      newBalance: updatedFan.credits,
    };
  }
}
