import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type EarningType = 'SUBSCRIPTION' | 'PURCHASE';

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * クリエイターの現在の手数料率を取得
   * サブスクリプションがない場合はFreeプラン(8%)を返す
   */
  async getCreatorFeeRate(creatorId: string): Promise<number> {
    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { creatorId },
      include: { plan: true },
    });

    // ACTIVEなサブスクリプションがある場合はそのプランの手数料率を使用
    // それ以外(PENDING/EXPIRED/CANCELLED/未契約)はFreeプランのデフォルト(8%)を使用
    if (subscription?.status === 'ACTIVE' && subscription.plan) {
      // feeRate は DB に 8.0, 5.0, 2.8 で格納 → 0.08, 0.05, 0.028 に変換
      return subscription.plan.feeRate / 100;
    }

    // Freeプランのデフォルト
    const freePlan = await this.prisma.creatorPlan.findUnique({
      where: { type: 'FREE' },
    });
    return freePlan ? freePlan.feeRate / 100 : 0.08;
  }

  /**
   * 手数料計算
   * @returns platformFee: プラットフォーム手数料（切り捨て）、netAmount: クリエイター受取額
   */
  calculateFee(grossAmount: number, feeRate: number): {
    platformFee: number;
    netAmount: number;
  } {
    const platformFee = Math.floor(grossAmount * feeRate);
    const netAmount = grossAmount - platformFee;
    return { platformFee, netAmount };
  }

  /**
   * 収益レコードを作成（購入・サブスクリプション発生時に呼ぶ）
   * 購入発生時点のプランの手数料を自動適用する
   */
  async recordEarning(params: {
    creatorId: string;
    grossAmount: number;
    earningType: EarningType;
    referenceId?: string;
  }): Promise<void> {
    const { creatorId, grossAmount, earningType, referenceId } = params;

    const feeRate = await this.getCreatorFeeRate(creatorId);
    const { platformFee, netAmount } = this.calculateFee(grossAmount, feeRate);

    // 今月の締め月文字列（YYYY-MM）
    const now = new Date();
    const settlementMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await (this.prisma as any).creatorEarning.create({
      data: {
        creatorId,
        grossAmount,
        platformFee,
        netAmount,
        feeRate,
        earningType,
        referenceId: referenceId ?? null,
        settlementMonth,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Earning recorded: creator=${creatorId}, gross=${grossAmount}, fee=${platformFee}(${(feeRate * 100).toFixed(0)}%), net=${netAmount}, type=${earningType}`,
    );
  }

  /**
   * クリエイターの未精算（PENDING）収益合計を取得
   */
  async getPendingBalance(creatorId: string): Promise<number> {
    const result = await (this.prisma as any).creatorEarning.aggregate({
      where: { creatorId, status: 'PENDING' },
      _sum: { netAmount: true },
    });
    return result._sum.netAmount ?? 0;
  }

  /**
   * クリエイターの収益サマリーを取得（管理画面・設定ページ用）
   */
  async getEarningsSummary(creatorId: string) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [pendingBalance, currentMonthEarnings, recentPayouts] = await Promise.all([
      this.getPendingBalance(creatorId),
      // 今月の収益合計
      (this.prisma as any).creatorEarning.aggregate({
        where: { creatorId, settlementMonth: currentMonth },
        _sum: { netAmount: true, grossAmount: true, platformFee: true },
        _count: true,
      }),
      // 直近5件の支払い
      (this.prisma as any).creatorPayout.findMany({
        where: { creatorId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      pendingBalance,
      currentMonth: {
        month: currentMonth,
        netTotal: currentMonthEarnings._sum.netAmount ?? 0,
        grossTotal: currentMonthEarnings._sum.grossAmount ?? 0,
        feesTotal: currentMonthEarnings._sum.platformFee ?? 0,
        count: currentMonthEarnings._count,
      },
      recentPayouts,
    };
  }
}
