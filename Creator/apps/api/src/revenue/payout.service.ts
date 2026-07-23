import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

const PAYOUT_MINIMUM = 5000; // 最低支払い額（円）

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 月末精算処理（月末 23:00 実行）
   * 全クリエイターのPENDING収益を集計し、5,000円以上なら支払いレコードを作成する。
   * 5,000円未満の場合は翌月繰越（収益は PENDING のまま維持）。
   *
   * スケジュール: 毎月最終日 23:00
   * Note: "0 23 28-31 * *" は28〜31日の23:00に実行 → 翌日が月初かどうかを確認して月末のみ処理
   */
  @Cron('0 23 28-31 * *')
  async processMonthlySettlement() {
    // 翌日が1日（= 今日が月末）かどうか確認
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDate() !== 1) {
      return; // 月末でなければスキップ
    }

    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.logger.log(`Starting monthly settlement for period: ${periodMonth}`);

    const startTime = Date.now();
    let settledCount = 0;
    let skippedCount = 0;
    let totalAmount = 0;

    try {
      // PENDING収益を持つクリエイター一覧を取得（銀行口座あり）
      const creatorsWithEarnings = await (this.prisma as any).creatorEarning.groupBy({
        by: ['creatorId'],
        where: { status: 'PENDING' },
        _sum: { netAmount: true },
      });

      for (const group of creatorsWithEarnings) {
        const pendingTotal = group._sum.netAmount ?? 0;

        if (pendingTotal < PAYOUT_MINIMUM) {
          this.logger.log(
            `Skipping creator ${group.creatorId}: balance ¥${pendingTotal} < ¥${PAYOUT_MINIMUM} (carry over)`,
          );
          skippedCount++;
          continue;
        }

        // 銀行口座確認
        const bankAccount = await this.prisma.bankAccount.findUnique({
          where: { creatorId: group.creatorId },
        });

        if (!bankAccount) {
          this.logger.warn(
            `Creator ${group.creatorId} has ¥${pendingTotal} but no bank account registered. Skipping.`,
          );
          skippedCount++;
          continue;
        }

        // 支払いレコード作成 & 収益をSETTLEDに更新（トランザクション）
        await this.prisma.$transaction(async (tx) => {
          // CreatorPayout を作成
          const payout = await (tx as any).creatorPayout.create({
            data: {
              creatorId: group.creatorId,
              amount: pendingTotal,
              status: 'PENDING',
              periodMonth,
              bankAccountId: bankAccount.id,
            },
          });

          // 対象のPENDING収益全てをSETTLEDに更新し、payoutIdを紐付け
          await (tx as any).creatorEarning.updateMany({
            where: {
              creatorId: group.creatorId,
              status: 'PENDING',
            },
            data: {
              status: 'SETTLED',
              payoutId: payout.id,
            },
          });

          this.logger.log(
            `Payout created: creator=${group.creatorId}, amount=¥${pendingTotal}, period=${periodMonth}`,
          );
        });

        settledCount++;
        totalAmount += pendingTotal;
      }

      const durationMs = Date.now() - startTime;
      this.logger.log(
        `Monthly settlement completed: settled=${settledCount}, skipped=${skippedCount}, totalAmount=¥${totalAmount}, duration=${durationMs}ms`,
      );

      // CronLogに記録
      await this.logCronExecution({
        taskName: 'monthly_payout_settlement',
        status: 'SUCCESS',
        recordsProcessed: settledCount,
        message: `Settled ${settledCount} creators (¥${totalAmount} total), skipped ${skippedCount} (insufficient balance or no bank account)`,
        durationMs,
      });
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error(
        `Monthly settlement failed: ${(error as any).message}`,
        (error as any).stack,
      );

      await this.logCronExecution({
        taskName: 'monthly_payout_settlement',
        status: 'FAILED',
        recordsProcessed: settledCount,
        message: (error as any).message,
        durationMs,
      });
    }
  }

  /**
   * 手動トリガー用（管理者が任意のタイミングで実行可能）
   */
  async triggerSettlementManually(periodMonth?: string): Promise<{
    settled: number;
    skipped: number;
    totalAmount: number;
  }> {
    const now = new Date();
    const month = periodMonth ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let settledCount = 0;
    let skippedCount = 0;
    let totalAmount = 0;

    const creatorsWithEarnings = await (this.prisma as any).creatorEarning.groupBy({
      by: ['creatorId'],
      where: { status: 'PENDING' },
      _sum: { netAmount: true },
    });

    for (const group of creatorsWithEarnings) {
      const pendingTotal = group._sum.netAmount ?? 0;

      if (pendingTotal < PAYOUT_MINIMUM) {
        skippedCount++;
        continue;
      }

      const bankAccount = await this.prisma.bankAccount.findUnique({
        where: { creatorId: group.creatorId },
      });

      if (!bankAccount) {
        skippedCount++;
        continue;
      }

      await this.prisma.$transaction(async (tx) => {
        const payout = await (tx as any).creatorPayout.create({
          data: {
            creatorId: group.creatorId,
            amount: pendingTotal,
            status: 'PENDING',
            periodMonth: month,
            bankAccountId: bankAccount.id,
          },
        });

        await (tx as any).creatorEarning.updateMany({
          where: { creatorId: group.creatorId, status: 'PENDING' },
          data: { status: 'SETTLED', payoutId: payout.id },
        });
      });

      settledCount++;
      totalAmount += pendingTotal;
    }

    return { settled: settledCount, skipped: skippedCount, totalAmount };
  }

  /**
   * 支払い完了マーク（管理者が銀行振込後に呼ぶ）
   */
  async markPayoutCompleted(payoutId: string): Promise<void> {
    await (this.prisma as any).creatorPayout.update({
      where: { id: payoutId },
      data: { status: 'COMPLETED', processedAt: new Date() },
    });
    this.logger.log(`Payout ${payoutId} marked as COMPLETED`);
  }

  /**
   * 支払い失敗マーク
   */
  async markPayoutFailed(payoutId: string, reason: string): Promise<void> {
    await (this.prisma as any).creatorPayout.update({
      where: { id: payoutId },
      data: { status: 'FAILED', note: reason },
    });

    // 収益をPENDINGに戻す（翌月の精算に含める）
    await (this.prisma as any).creatorEarning.updateMany({
      where: { payoutId },
      data: { status: 'PENDING', payoutId: null },
    });

    this.logger.log(`Payout ${payoutId} marked as FAILED, earnings reverted to PENDING`);
  }

  private async logCronExecution(data: {
    taskName: string;
    status: 'SUCCESS' | 'FAILED';
    recordsProcessed: number;
    message: string;
    durationMs: number;
  }) {
    try {
      await this.prisma.cronLog.create({
        data: {
          taskName: data.taskName,
          status: data.status,
          recordsProcessed: data.recordsProcessed,
          message: data.message,
          durationMs: data.durationMs,
          executedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log cron execution: ${(error as any).message}`);
    }
  }
}
