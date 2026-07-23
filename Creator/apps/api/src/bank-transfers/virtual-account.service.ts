import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GmoApiService } from './gmo-api.service';
import { BankTransferType } from '@prisma/client';

/**
 * バーチャル口座管理サービス
 */
@Injectable()
export class VirtualAccountService {
  private readonly logger = new Logger(VirtualAccountService.name);

  constructor(
    private prisma: PrismaService,
    private gmoApi: GmoApiService,
  ) {}

  /**
   * クリエイター向けバーチャル口座を作成
   *
   * @param creatorId - クリエイターID
   */
  async createCreatorVirtualAccount(creatorId: string) {
    this.logger.log(`Creating virtual account for creator: ${creatorId}`);

    // 既存のバーチャル口座をチェック
    const existing = await this.prisma.virtualAccount.findFirst({
      where: {
        creatorId,
        purpose: BankTransferType.CREATOR_PLAN,
        isActive: true,
      },
    });

    if (existing) {
      this.logger.warn(
        `Virtual account already exists for creator: ${creatorId}`,
      );
      return existing;
    }

    // クリエイター情報を取得
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: { user: true },
    });

    if (!creator) {
      throw new BadRequestException(`Creator not found: ${creatorId}`);
    }

    // GMO APIでバーチャル口座を作成
    const accountName = `${creator.displayName}_PLAN`; // 口座名義
    const gmoAccount = await this.gmoApi.createVirtualAccount(
      accountName,
      BankTransferType.CREATOR_PLAN,
    );

    // DBに保存
    const virtualAccount = await this.prisma.virtualAccount.create({
      data: {
        creatorId,
        accountNumber: gmoAccount.accountNumber,
        accountName: gmoAccount.accountName,
        branchCode: gmoAccount.branchCode,
        purpose: BankTransferType.CREATOR_PLAN,
        gmoAccountId: gmoAccount.accountId,
        isActive: true,
      },
    });

    this.logger.log(
      `Virtual account created for creator: ${creatorId} - ${virtualAccount.accountNumber}`,
    );

    return virtualAccount;
  }

  /**
   * ファン向けバーチャル口座を作成
   *
   * @param fanId - ファンID
   */
  async createFanVirtualAccount(fanId: string) {
    this.logger.log(`Creating virtual account for fan: ${fanId}`);

    // 既存のバーチャル口座をチェック
    const existing = await this.prisma.virtualAccount.findFirst({
      where: {
        fanId,
        purpose: BankTransferType.FAN_CREDIT,
        isActive: true,
      },
    });

    if (existing) {
      this.logger.warn(`Virtual account already exists for fan: ${fanId}`);
      return existing;
    }

    // ファン情報を取得
    const fan = await this.prisma.fanProfile.findUnique({
      where: { id: fanId },
      include: { user: true },
    });

    if (!fan) {
      throw new BadRequestException(`Fan not found: ${fanId}`);
    }

    // GMO APIでバーチャル口座を作成
    const accountName = `${fan.user.name || 'Fan'}_CREDIT`; // 口座名義
    const gmoAccount = await this.gmoApi.createVirtualAccount(
      accountName,
      BankTransferType.FAN_CREDIT,
    );

    // DBに保存
    const virtualAccount = await this.prisma.virtualAccount.create({
      data: {
        fanId,
        accountNumber: gmoAccount.accountNumber,
        accountName: gmoAccount.accountName,
        branchCode: gmoAccount.branchCode,
        purpose: BankTransferType.FAN_CREDIT,
        gmoAccountId: gmoAccount.accountId,
        isActive: true,
      },
    });

    this.logger.log(
      `Virtual account created for fan: ${fanId} - ${virtualAccount.accountNumber}`,
    );

    return virtualAccount;
  }

  /**
   * バーチャル口座を取得
   *
   * @param accountNumber - バーチャル口座番号
   */
  async getVirtualAccount(accountNumber: string) {
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { accountNumber },
      include: {
        creator: true,
        fan: {
          include: { user: true },
        },
      },
    });

    if (!virtualAccount) {
      throw new BadRequestException(
        `Virtual account not found: ${accountNumber}`,
      );
    }

    return virtualAccount;
  }

  /**
   * クリエイターのバーチャル口座を取得
   */
  async getCreatorVirtualAccount(creatorId: string) {
    return this.prisma.virtualAccount.findFirst({
      where: {
        creatorId,
        purpose: BankTransferType.CREATOR_PLAN,
        isActive: true,
      },
    });
  }

  /**
   * ファンのバーチャル口座を取得
   */
  async getFanVirtualAccount(fanId: string) {
    return this.prisma.virtualAccount.findFirst({
      where: {
        fanId,
        purpose: BankTransferType.FAN_CREDIT,
        isActive: true,
      },
    });
  }

  /**
   * バーチャル口座を無効化
   */
  async deactivateVirtualAccount(accountNumber: string) {
    this.logger.log(`Deactivating virtual account: ${accountNumber}`);

    // GMO APIで無効化
    await this.gmoApi.deactivateVirtualAccount(accountNumber);

    // DBで無効化
    await this.prisma.virtualAccount.update({
      where: { accountNumber },
      data: { isActive: false },
    });

    this.logger.log(`Virtual account deactivated: ${accountNumber}`);
  }

  /**
   * バーチャル口座の取引履歴を取得
   */
  async getTransactionHistory(
    accountNumber: string,
    fromDate: Date,
    toDate: Date,
  ) {
    // DBから取得
    const transfers = await this.prisma.bankTransfer.findMany({
      where: {
        virtualAccount: { accountNumber },
        transferDate: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { transferDate: 'desc' },
      include: {
        creatorSubscription: true,
        chargeRequest: true,
      },
    });

    return transfers;
  }

  /**
   * バーチャル口座の振込案内情報を生成
   *
   * @param accountNumber - バーチャル口座番号
   */
  async getTransferInstructions(accountNumber: string) {
    const virtualAccount = await this.getVirtualAccount(accountNumber);

    // GMO APIから最新情報を取得
    const gmoAccount = await this.gmoApi.getVirtualAccount(accountNumber);

    return {
      bankName: gmoAccount.bankName,
      bankCode: gmoAccount.bankCode,
      branchName: '本店', // 実際のGMO APIレスポンスに基づいて調整
      branchCode: gmoAccount.branchCode,
      accountType: '普通',
      accountNumber: gmoAccount.accountNumber,
      accountName: gmoAccount.accountName,
      purpose: virtualAccount.purpose,
      notes: [
        '振込手数料はお客様負担となります',
        '振込名義人は登録されたお名前と一致する必要があります',
        '入金確認後、自動的に処理されます',
      ],
    };
  }

  /**
   * 全てのバーチャル口座を一覧取得（管理者用）
   */
  async listVirtualAccounts(filters?: {
    purpose?: BankTransferType;
    isActive?: boolean;
  }) {
    return this.prisma.virtualAccount.findMany({
      where: filters,
      include: {
        creator: {
          select: {
            id: true,
            handle: true,
            displayName: true,
          },
        },
        fan: {
          select: {
            id: true,
            displayName: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            bankTransfers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 未使用のバーチャル口座をクリエイターに自動割り当て
   * インポートされた口座プールから割り当てる
   *
   * @param creatorId - クリエイターID
   * @param subscriptionId - サブスクリプションID（割り当て先の決済ID）
   */
  async assignVirtualAccountToCreator(
    creatorId: string,
    subscriptionId: string,
  ) {
    this.logger.log(
      `Assigning virtual account to creator: ${creatorId} for subscription: ${subscriptionId}`,
    );

    // 既に割り当てられているか確認
    const existing = await this.prisma.virtualAccount.findFirst({
      where: {
        assignedToPaymentId: subscriptionId,
        purpose: BankTransferType.CREATOR_PLAN,
      },
    });

    if (existing) {
      this.logger.warn(
        `Virtual account already assigned to subscription: ${subscriptionId}`,
      );
      return existing;
    }

    // 未使用の口座を検索
    const availableAccount = await this.prisma.virtualAccount.findFirst({
      where: {
        purpose: BankTransferType.CREATOR_PLAN,
        isUsed: false,
        isActive: true,
        creatorId: null,
        fanId: null,
      },
      orderBy: { createdAt: 'asc' }, // 古い順に使用
    });

    if (!availableAccount) {
      throw new BadRequestException(
        'No available virtual accounts for creator plan payment',
      );
    }

    // 口座を割り当て
    const assignedAccount = await this.prisma.virtualAccount.update({
      where: { id: availableAccount.id },
      data: {
        creatorId,
        isUsed: true,
        assignedToPaymentId: subscriptionId,
        assignedAt: new Date(),
      },
    });

    this.logger.log(
      `Virtual account ${assignedAccount.accountNumber} assigned to creator ${creatorId}`,
    );

    return assignedAccount;
  }

  /**
   * 未使用のバーチャル口座をファンに自動割り当て
   * インポートされた口座プールから割り当てる
   *
   * @param fanId - ファンID
   * @param chargeRequestId - チャージリクエストID（割り当て先の決済ID）
   */
  async assignVirtualAccountToFan(fanId: string, chargeRequestId: string) {
    this.logger.log(
      `Assigning virtual account to fan: ${fanId} for charge request: ${chargeRequestId}`,
    );

    // 既に割り当てられているか確認
    const existing = await this.prisma.virtualAccount.findFirst({
      where: {
        assignedToPaymentId: chargeRequestId,
        purpose: BankTransferType.FAN_CREDIT,
      },
    });

    if (existing) {
      this.logger.warn(
        `Virtual account already assigned to charge request: ${chargeRequestId}`,
      );
      return existing;
    }

    // 未使用の口座を検索
    const availableAccount = await this.prisma.virtualAccount.findFirst({
      where: {
        purpose: BankTransferType.FAN_CREDIT,
        isUsed: false,
        isActive: true,
        creatorId: null,
        fanId: null,
      },
      orderBy: { createdAt: 'asc' }, // 古い順に使用
    });

    if (!availableAccount) {
      throw new BadRequestException(
        'No available virtual accounts for fan credit charge',
      );
    }

    // 口座を割り当て
    const assignedAccount = await this.prisma.virtualAccount.update({
      where: { id: availableAccount.id },
      data: {
        fanId,
        isUsed: true,
        assignedToPaymentId: chargeRequestId,
        assignedAt: new Date(),
      },
    });

    this.logger.log(
      `Virtual account ${assignedAccount.accountNumber} assigned to fan ${fanId}`,
    );

    return assignedAccount;
  }

  /**
   * バーチャル口座を解放して再利用可能にする
   * 入金処理が完了した後に呼び出す
   *
   * @param accountNumber - バーチャル口座番号
   */
  async releaseVirtualAccount(accountNumber: string) {
    this.logger.log(`Releasing virtual account: ${accountNumber}`);

    await this.prisma.virtualAccount.update({
      where: { accountNumber },
      data: {
        isUsed: false,
        assignedToPaymentId: null,
        assignedAt: null,
        creatorId: null,
        fanId: null,
      },
    });

    this.logger.log(`Virtual account ${accountNumber} released for reuse`);
  }

  /**
   * 未使用の口座数を取得
   */
  async getAvailableAccountCount(purpose: BankTransferType) {
    return this.prisma.virtualAccount.count({
      where: {
        purpose,
        isUsed: false,
        isActive: true,
      },
    });
  }
}
