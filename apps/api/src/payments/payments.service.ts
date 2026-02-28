import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankTransfersService } from '../bank-transfers/bank-transfers.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { BankTransferType, ChargeRequestStatus, CreatorSubscriptionStatus, CreatorPlanType } from '@prisma/client';
import { calculateNextBillingDate } from '../common/utils/date.util';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private bankTransfersService: BankTransfersService,
  ) { }

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

    // 3. 有効期限の設定（7日後）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. ChargeRequestを作成
    const chargeRequest = await this.prisma.chargeRequest.create({
      data: {
        fanId: fanProfile.id,
        amount: dto.amount,
        status: ChargeRequestStatus.PENDING,
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

    const newAmount = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    let amount = newAmount; // 最終的な請求額

    const now = new Date();

    // 3. 既存プランからの変更（日割り計算と即時決済のチェック）
    if (subscription) {
      const isReactivatingSamePlan =
        subscription.planId === plan.id &&
        subscription.isYearly === isYearly &&
        subscription.status === CreatorSubscriptionStatus.CANCELLED;

      if (subscription.planId === plan.id && subscription.isYearly === isYearly && !isReactivatingSamePlan) {
        throw new BadRequestException('すでに同じプランを選択しています');
      }

      const hasRemainingPeriod = subscription.endDate && subscription.endDate > now;

      // ACTIVE状態、またはキャンセル済みだが期間が残っている場合、日割り計算を行う
      if (
        (subscription.status === CreatorSubscriptionStatus.ACTIVE || subscription.status === CreatorSubscriptionStatus.CANCELLED) &&
        hasRemainingPeriod
      ) {
        if (isReactivatingSamePlan) {
          amount = 0; // 同じプランの再開は請求なし
          this.logger.log(`Reactivating same plan with remaining period. amount=0`);
        } else {
          const msPerDay = 1000 * 60 * 60 * 24;
          const remainingDays = Math.ceil(
            (subscription.endDate!.getTime() - now.getTime()) / msPerDay,
          );

          const currentPlanAmount = subscription.isYearly
            ? subscription.plan.yearlyPrice
            : subscription.plan.monthlyPrice;

          let totalDays = subscription.isYearly ? 365 : 30;
          if (subscription.startDate && subscription.endDate) {
            const actualDays = Math.ceil(
              (subscription.endDate.getTime() - subscription.startDate.getTime()) / msPerDay,
            );
            if (actualDays > 0) totalDays = actualDays;
          }

          const dailyRate = currentPlanAmount / totalDays;
          const unusedAmount = Math.floor(dailyRate * remainingDays);

          amount = Math.max(0, newAmount - unusedAmount);
          this.logger.log(`Proration calculated: unused=${unusedAmount}, newAmount=${newAmount}, billedAmount=${amount}`);
        }
      }

      // 残高の確認 (既存サブスクが存在する場合は不足分をUIでチャージさせるため例外をスロー)
      if (subscription.billingBalance < amount) {
        throw new BadRequestException(
          `INSUFFICIENT_BALANCE:${amount}:${subscription.billingBalance}`
        );
      }

      // サブスクリプション更新データの構築
      let updateData: any = {
        planId: plan.id,
        isYearly,
      };

      if (isReactivatingSamePlan && hasRemainingPeriod) {
        // 再開: 期間はそのままにし、更新日だけを再設定する。請求は0円（すでに払っているため）。
        updateData = {
          ...updateData,
          status: CreatorSubscriptionStatus.ACTIVE,
          nextBillingDate: subscription.endDate,
        };
        this.logger.log(`Subscription reactivated immediately with remaining period.`);
      } else {
        // 全額/差額を残高から引き落として即時ACTIVEで決済期間を新しくスタートする
        const endDate = calculateNextBillingDate(now, isYearly);

        updateData = {
          ...updateData,
          status: CreatorSubscriptionStatus.ACTIVE,
          billingBalance: subscription.billingBalance - amount,
          startDate: now,
          endDate: endDate,
          nextBillingDate: new Date(endDate),
        };
        this.logger.log(`Subscription activated immediately. billed=${amount}, newBalance=${subscription.billingBalance - amount}`);
      }

      // 既存のサブスクリプションを更新
      subscription = await this.prisma.creatorSubscription.update({
        where: { id: subscription.id },
        data: updateData,
        include: { plan: true },
      });
      this.logger.log(`Updated existing subscription: ${subscription.id}`);

    } else {
      // サブスクリプションが存在しない場合は新規作成
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
    }

    // 5. 有効期限の設定（入金待ちの場合の期限として7日後を設定）
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
      let endDate: Date = calculateNextBillingDate(now, subscription.isYearly);
      let nextBillingDate: Date = new Date(endDate);

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
