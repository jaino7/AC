import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankTransfersService } from '../bank-transfers/bank-transfers.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { BankTransferType, ChargeRequestStatus, CreatorSubscriptionStatus, CreatorPlanType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private bankTransfersService: BankTransfersService,
  ) {}

  /**
   * ChargeRequestを作成し、バーチャル口座を割り当て
   * @param userId 現在のユーザーID
   * @param dto 決済情報
   */
  async createChargeRequest(userId: string, dto: CreateChargeDto) {
    this.logger.log(`Creating charge request for user: ${userId}, creator: ${dto.creatorId}, amount: ${dto.amount}`);

    // 1. クリエイターの存在確認
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: dto.creatorId },
    });

    if (!creator) {
      throw new NotFoundException(`Creator not found: ${dto.creatorId}`);
    }

    // 2. FanProfileの存在確認（または作成）
    let fanProfile = await this.prisma.fanProfile.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId: dto.creatorId,
        },
      },
    });

    if (!fanProfile) {
      // FanProfileが存在しない場合は作成
      fanProfile = await this.prisma.fanProfile.create({
        data: {
          userId,
          creatorId: dto.creatorId,
        },
      });
      this.logger.log(`Created new FanProfile: ${fanProfile.id}`);
    }

    // 3. 識別コードの生成（6桁のランダムな数字）
    const identifierCode = this.generateIdentifierCode();

    // 4. 有効期限の設定（7日後）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 5. ChargeRequestを作成
    const chargeRequest = await this.prisma.chargeRequest.create({
      data: {
        fanId: fanProfile.id,
        amount: dto.amount,
        status: ChargeRequestStatus.PENDING,
        identifierCode,
        expiresAt,
      },
    });

    this.logger.log(`ChargeRequest created: ${chargeRequest.id}`);

    // 6. バーチャル口座を割り当て
    try {
      const virtualAccount = await this.bankTransfersService.assignVirtualAccount(
        chargeRequest.id,
        BankTransferType.FAN_CREDIT,
      );

      this.logger.log(
        `Virtual account assigned: ${virtualAccount.accountNumber} -> ChargeRequest: ${chargeRequest.id}`,
      );

      // 7. レスポンスを返す
      return {
        chargeRequestId: chargeRequest.id,
        amount: chargeRequest.amount,
        identifierCode: chargeRequest.identifierCode,
        expiresAt: chargeRequest.expiresAt,
        virtualAccount: {
          accountNumber: virtualAccount.accountNumber,
          accountName: virtualAccount.accountName,
          branchCode: virtualAccount.branchCode,
        },
      };
    } catch (error) {
      // バーチャル口座の割り当てに失敗した場合、ChargeRequestを削除
      await this.prisma.chargeRequest.delete({
        where: { id: chargeRequest.id },
      });

      this.logger.error(
        `Failed to assign virtual account for ChargeRequest: ${chargeRequest.id}`,
        (error as any).stack,
      );

      throw error;
    }
  }

  /**
   * 振込識別コードを生成（6桁の数字）
   */
  private generateIdentifierCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  /**
   * クリエイタープラン購入リクエストを作成
   * @param creatorId クリエイターID
   * @param planType プランタイプ（LITE, BUSINESS）
   * @param isYearly 年払いかどうか
   */
  async createCreatorPlanPurchase(
    creatorId: string,
    planType: CreatorPlanType,
    isYearly: boolean,
  ) {
    this.logger.log(
      `Creating creator plan purchase: creator=${creatorId}, plan=${planType}, isYearly=${isYearly}`,
    );

    // 1. プラン情報を取得
    const plan = await this.prisma.creatorPlan.findUnique({
      where: { type: planType },
    });

    if (!plan) {
      throw new NotFoundException(`Plan not found: ${planType}`);
    }

    // 2. 既存のサブスクリプションを確認
    let subscription = await this.prisma.creatorSubscription.findUnique({
      where: { creatorId },
      include: { plan: true },
    });

    // 3. サブスクリプションが存在しない場合は作成
    if (!subscription) {
      subscription = await this.prisma.creatorSubscription.create({
        data: {
          creatorId,
          planId: plan.id,
          isYearly,
          status: CreatorSubscriptionStatus.PENDING,
        },
        include: { plan: true },
      });
      this.logger.log(`Created new subscription: ${subscription.id}`);
    } else {
      // 既存のサブスクリプションを更新（プラン変更や支払い周期変更）
      subscription = await this.prisma.creatorSubscription.update({
        where: { id: subscription.id },
        data: {
          planId: plan.id,
          isYearly,
        },
        include: { plan: true },
      });
      this.logger.log(`Updated existing subscription: ${subscription.id}`);
    }

    // 4. 必要な金額を計算
    const amount = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

    // 5. 識別コードの生成（6桁のランダムな数字）
    const identifierCode = this.generateIdentifierCode();

    // 6. 有効期限の設定（7日後）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 7. バーチャル口座を割り当て（固定口座）
    try {
      const virtualAccount = await this.bankTransfersService.assignVirtualAccount(
        subscription.id,
        BankTransferType.CREATOR_PLAN,
        creatorId, // クリエイターIDを渡して固定口座として割り当て
      );

      this.logger.log(
        `Virtual account assigned: ${virtualAccount.accountNumber} -> Subscription: ${subscription.id}`,
      );

      // 8. レスポンスを返す
      return {
        subscriptionId: subscription.id,
        planName: plan.name,
        amount,
        isYearly,
        identifierCode,
        expiresAt,
        virtualAccount: {
          accountNumber: virtualAccount.accountNumber,
          accountName: virtualAccount.accountName,
          branchCode: virtualAccount.branchCode,
          branchName: virtualAccount.branchName,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to assign virtual account for Subscription: ${subscription.id}`,
        (error as any).stack,
      );

      throw error;
    }
  }

  /**
   * クリエイタープランの入金処理と自動更新
   * @param subscriptionId サブスクリプションID
   * @param amount 入金額
   */
  async processCreatorPlanPayment(subscriptionId: string, amount: number) {
    this.logger.log(
      `Processing creator plan payment: subscription=${subscriptionId}, amount=${amount}`,
    );

    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${subscriptionId}`);
    }

    // 1. billingBalanceに入金額を加算
    const newBalance = subscription.billingBalance + amount;

    await this.prisma.creatorSubscription.update({
      where: { id: subscriptionId },
      data: { billingBalance: newBalance },
    });

    this.logger.log(
      `Updated billing balance: ${subscription.billingBalance} -> ${newBalance}`,
    );

    // 2. 残高が十分か確認し、サブスクリプションをアクティブ化
    await this.activateSubscriptionIfPossible(subscriptionId);
  }

  /**
   * 残高が十分な場合、サブスクリプションをアクティブ化
   * @param subscriptionId サブスクリプションID
   */
  async activateSubscriptionIfPossible(subscriptionId: string) {
    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found: ${subscriptionId}`);
    }

    const requiredAmount = subscription.isYearly
      ? subscription.plan.yearlyPrice
      : subscription.plan.monthlyPrice;

    // 残高が必要額以上の場合のみアクティブ化
    if (subscription.billingBalance >= requiredAmount) {
      const now = new Date();
      let endDate: Date;
      let nextBillingDate: Date;

      if (subscription.isYearly) {
        // 年払い: 1年後
        endDate = new Date(now);
        endDate.setFullYear(endDate.getFullYear() + 1);
        nextBillingDate = new Date(endDate);
      } else {
        // 月払い: 1ヶ月後
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        nextBillingDate = new Date(endDate);
      }

      // サブスクリプションを更新
      await this.prisma.creatorSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: CreatorSubscriptionStatus.ACTIVE,
          startDate: now,
          endDate,
          nextBillingDate,
          billingBalance: subscription.billingBalance - requiredAmount, // 残高から差し引き
        },
      });

      this.logger.log(
        `Subscription activated: ${subscriptionId}, expires: ${endDate.toISOString()}`,
      );

      return true;
    }

    this.logger.log(
      `Insufficient balance: ${subscription.billingBalance} < ${requiredAmount}`,
    );

    return false;
  }
}
