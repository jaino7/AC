import { Injectable, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { GmoWebhookDto } from './dto/gmo-webhook.dto';
import { AutomationWebhookDto } from './dto/automation-webhook.dto';
import { GmoApiService } from './gmo-api.service';
import { ClaimsService } from '../payments/claims.service';
import {
  BankTransferType,
  BankTransferStatus,
  CreatorSubscriptionStatus,
  ChargeRequestStatus,
  BankTransferClaimStatus,
} from '@prisma/client';
import { calculateNextBillingDate } from '../common/utils/date.util';

@Injectable()
export class BankTransfersService {
  private readonly logger = new Logger(BankTransfersService.name);

  constructor(
    private prisma: PrismaService,
    private gmoApi: GmoApiService,
    private mailService: MailService,
    @Inject(forwardRef(() => ClaimsService))
    private claimsService: ClaimsService,
  ) { }

  /**
   * GMO Webhookを処理
   */
  async processGmoWebhook(payload: GmoWebhookDto) {
    this.logger.log(`Processing GMO webhook: ${payload.transactionId}`);

    // 1. バーチャル口座を特定
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { accountNumber: payload.accountNumber },
      include: {
        creator: true,
        fan: true,
      },
    });

    if (!virtualAccount) {
      throw new BadRequestException(
        `Virtual account not found: ${payload.accountNumber}`,
      );
    }

    if (!virtualAccount.isActive) {
      throw new BadRequestException(
        `Virtual account is inactive: ${payload.accountNumber}`,
      );
    }

    // 決済IDが割り当てられているか確認
    if (!virtualAccount.assignedToPaymentId) {
      this.logger.warn(
        `Virtual account ${payload.accountNumber} has no assigned payment ID`,
      );
      throw new BadRequestException(
        `Virtual account is not assigned to any payment`,
      );
    }

    // 2. 重複チェック（同じtransactionIdが既に処理済みでないか）
    const existing = await this.prisma.bankTransfer.findUnique({
      where: { gmoTransactionId: payload.transactionId },
    });

    if (existing) {
      this.logger.warn(
        `Duplicate transaction detected: ${payload.transactionId}`,
      );
      return existing;
    }

    // 3. BankTransferレコードを作成
    const bankTransfer = await this.prisma.bankTransfer.create({
      data: {
        virtualAccountId: virtualAccount.id,
        amount: payload.amount,
        transferorName: payload.transferorName,
        transferDate: new Date(payload.transferDate),
        type: virtualAccount.purpose,
        status: BankTransferStatus.PENDING,
        gmoTransactionId: payload.transactionId,
        webhookPayload: payload as any,
      },
    });

    // 4. 用途に応じて処理を分岐
    try {
      if (virtualAccount.purpose === BankTransferType.CREATOR_PLAN) {
        await this.processCreatorPlanPayment(bankTransfer, virtualAccount);
      } else if (virtualAccount.purpose === BankTransferType.FAN_CREDIT) {
        await this.processFanCreditCharge(bankTransfer, virtualAccount);
      }

      // 処理成功
      await this.prisma.bankTransfer.update({
        where: { id: bankTransfer.id },
        data: {
          status: BankTransferStatus.PROCESSED,
          processedAt: new Date(),
        },
      });

      // バーチャル口座を在庫に戻す
      await this.releaseVirtualAccount(virtualAccount.assignedToPaymentId);

      this.logger.log(
        `Successfully processed bank transfer: ${bankTransfer.id}`,
      );
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
        `Failed to process bank transfer: ${bankTransfer.id}`,
        (error as any).stack,
      );
      throw error;
    }

    return bankTransfer;
  }

  /**
   * クリエイタープラン支払いを処理
   */
  private async processCreatorPlanPayment(bankTransfer: any, virtualAccount: any) {
    this.logger.log(
      `Processing creator plan payment for payment ID: ${virtualAccount.assignedToPaymentId}`,
    );

    // assignedToPaymentId からサブスクリプションを取得
    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { id: virtualAccount.assignedToPaymentId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new BadRequestException(
        `Creator subscription not found: ${virtualAccount.assignedToPaymentId}`,
      );
    }

    // 1. billingBalanceに入金額を加算
    const newBalance = subscription.billingBalance + bankTransfer.amount;

    await this.prisma.creatorSubscription.update({
      where: { id: subscription.id },
      data: { billingBalance: newBalance },
    });

    this.logger.log(
      `Updated billing balance: ${subscription.billingBalance} -> ${newBalance}`,
    );

    // 2. 必要な金額を計算
    const requiredAmount = subscription.isYearly
      ? subscription.plan.yearlyPrice
      : subscription.plan.monthlyPrice;

    // 3. 残高が十分な場合、サブスクリプションをアクティブ化
    if (newBalance >= requiredAmount) {
      const now = new Date();
      let endDate: Date = calculateNextBillingDate(now, subscription.isYearly);
      let nextBillingDate: Date = new Date(endDate);

      // サブスクリプションを更新
      await this.prisma.creatorSubscription.update({
        where: { id: subscription.id },
        data: {
          status: CreatorSubscriptionStatus.ACTIVE,
          startDate: now,
          endDate,
          nextBillingDate,
          billingBalance: newBalance - requiredAmount, // 残高から差し引き
        },
      });

      this.logger.log(
        `Subscription activated: ${subscription.id}, expires: ${endDate.toISOString()}, new balance: ${newBalance - requiredAmount}`,
      );
    } else {
      this.logger.log(
        `Insufficient balance: ${newBalance} < ${requiredAmount}. Waiting for additional payment.`,
      );
    }

    // BankTransferとの紐付け
    await this.prisma.bankTransfer.update({
      where: { id: bankTransfer.id },
      data: { creatorSubscriptionId: subscription.id },
    });

    this.logger.log(`Creator plan payment processed for subscription: ${subscription.id}`);
  }

  /**
   * ファンクレジットチャージを処理
   */
  private async processFanCreditCharge(bankTransfer: any, virtualAccount: any) {
    this.logger.log(
      `Processing fan credit charge for payment ID: ${virtualAccount.assignedToPaymentId}`,
    );

    // assignedToPaymentId から ChargeRequest を取得（userを含める）
    const chargeRequest = await this.prisma.chargeRequest.findUnique({
      where: { id: virtualAccount.assignedToPaymentId },
      include: { fan: { include: { user: true, creator: { include: { user: true } } } } },
    });

    if (!chargeRequest) {
      throw new BadRequestException(
        `Charge request not found: ${virtualAccount.assignedToPaymentId}`,
      );
    }

    const fanProfile = chargeRequest.fan;

    // Check if there's a pending claim for this charge request
    const claim = await this.prisma.bankTransferClaim.findFirst({
      where: {
        chargeRequestId: chargeRequest.id,
        status: BankTransferClaimStatus.PENDING,
      },
    });

    if (claim) {
      // Trust & Lock System: Verify claim against actual transfer
      this.logger.log(`Found pending claim ${claim.id} for charge request ${chargeRequest.id}`);
      await this.claimsService.verifyClaim(claim, bankTransfer);

      // Update charge request status
      await this.prisma.chargeRequest.update({
        where: { id: chargeRequest.id },
        data: {
          status: ChargeRequestStatus.APPROVED,
          transferorName: bankTransfer.transferorName,
          transferDate: bankTransfer.transferDate,
          approvedAt: new Date(),
        },
      });

      // BankTransferとの紐付け
      await this.prisma.bankTransfer.update({
        where: { id: bankTransfer.id },
        data: { chargeRequestId: chargeRequest.id },
      });

      this.logger.log(`Claim verified and processed for fan: ${fanProfile.id}`);
    } else {
      // No claim - process normally (Tier 0 users or old flow)
      this.logger.log(`No claim found for charge request ${chargeRequest.id}, processing normally`);
      await this.processNormalCredit(chargeRequest, bankTransfer);
    }

    // Send deposit success email
    const user = fanProfile.user;
    if (user?.email) {
      try {
        // Get updated fan profile to get current balance
        const updatedFan = await this.prisma.fanProfile.findUnique({
          where: { id: fanProfile.id },
        });

        await this.mailService.sendDepositSuccessEmail(
          user.email,
          {
            fanName: fanProfile.displayName || user.name || 'ファン',
            amount: bankTransfer.amount,
            balance: updatedFan?.credits || fanProfile.credits,
            transferorName: bankTransfer.transferorName,
            transferDate: bankTransfer.transferDate,
          },
          user.id,
        );
        this.logger.log(`Deposit success email sent to: ${user.email}`);
      } catch (error) {
        this.logger.error(
          `Failed to send deposit success email to: ${user.email}`,
          (error as any).stack,
        );
        // Don't throw error - email failure shouldn't block the payment processing
      }
    }
  }

  /**
   * Process normal credit without claim (Tier 0 or old flow)
   */
  private async processNormalCredit(chargeRequest: any, bankTransfer: any) {
    const fanProfile = chargeRequest.fan;

    // 支払額の妥当性チェック
    if (bankTransfer.amount !== chargeRequest.amount) {
      this.logger.warn(
        `Payment amount mismatch. Expected: ${chargeRequest.amount}, Received: ${bankTransfer.amount}`,
      );
      // 金額が異なる場合はエラーにする
      throw new BadRequestException(
        `Payment amount mismatch. Expected: ${chargeRequest.amount}, Received: ${bankTransfer.amount}`,
      );
    }

    // トランザクションで残高加算・履歴記録・ステータス更新をアトミックに実行
    const updatedFan = await this.prisma.$transaction(async (tx) => {
      // increment演算子で競合状態を防止
      const updated = await tx.fanProfile.update({
        where: { id: fanProfile.id },
        data: { credits: { increment: bankTransfer.amount } },
      });

      // クレジット履歴を記録
      await tx.creditHistory.create({
        data: {
          fanId: fanProfile.id,
          type: 'CHARGE',
          amount: bankTransfer.amount,
          balance: updated.credits,
          description: `銀行振込によるチャージ: ${bankTransfer.transferorName}`,
          chargeRequestId: chargeRequest.id,
        },
      });

      // ChargeRequest を承認
      await tx.chargeRequest.update({
        where: { id: chargeRequest.id },
        data: {
          status: ChargeRequestStatus.APPROVED,
          transferorName: bankTransfer.transferorName,
          transferDate: bankTransfer.transferDate,
          approvedAt: new Date(),
        },
      });

      // BankTransferとの紐付け
      await tx.bankTransfer.update({
        where: { id: bankTransfer.id },
        data: { chargeRequestId: chargeRequest.id },
      });

      return updated;
    });

    this.logger.log(
      `Fan credit charged. Fan: ${fanProfile.id}, New balance: ${updatedFan.credits}`,
    );

    // Increment trust score for Tier 0 users to help them graduate
    if (fanProfile.tier === 0) {
      await this.claimsService.incrementTrustScore(fanProfile.id);
    }
  }

  /**
   * バーチャル口座を決済に割り当て
   * @param paymentId CreatorSubscription.id または ChargeRequest.id
   * @param purpose CREATOR_PLAN または FAN_CREDIT
   * @param creatorId クリエイターID（CREATOR_PLANの場合、固定口座として割り当てるため必要）
   * @param fanProfileId ファンプロフィールID（FAN_CREDITの場合、事前予約口座を優先利用するため）
   */
  async assignVirtualAccount(
    paymentId: string,
    purpose: BankTransferType,
    creatorId?: string,
    fanProfileId?: string,
  ) {
    this.logger.log(
      `Assigning virtual account for payment: ${paymentId}, purpose: ${purpose}, creatorId: ${creatorId || 'N/A'}`,
    );

    const assignedAccount = await this.prisma.$transaction(async (tx) => {
      let availableAccount;

      if (purpose === BankTransferType.CREATOR_PLAN && creatorId) {
        // クリエイタープランの場合: 固定口座として割り当て
        // 1. 既に割り当て済みの固定口座があるかチェック
        const existingAccount = await tx.virtualAccount.findFirst({
          where: {
            creatorId,
            purpose: BankTransferType.CREATOR_PLAN,
            isActive: true,
          },
        });

        if (existingAccount) {
          availableAccount = existingAccount;
          this.logger.log(
            `Reusing existing fixed account for creator: ${creatorId}`,
          );
        } else {
          // 2. 新しい固定口座を割り当て
          // 優先順位: releasedAt が null または 30日以上前のもの
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          availableAccount = await tx.virtualAccount.findFirst({
            where: {
              isUsed: false,
              isActive: true,
              purpose: BankTransferType.CREATOR_PLAN,
              creatorId: null,
              OR: [
                { releasedAt: null },
                { releasedAt: { lt: thirtyDaysAgo } },
              ],
            },
            orderBy: [
              { releasedAt: 'asc' }, // 古いものから優先
              { createdAt: 'asc' },
            ],
          });

          if (!availableAccount) {
            // 冷却期間中のものしかない場合は、それも使用
            availableAccount = await tx.virtualAccount.findFirst({
              where: {
                isUsed: false,
                isActive: true,
                purpose: BankTransferType.CREATOR_PLAN,
                creatorId: null,
              },
              orderBy: {
                releasedAt: 'desc', // 最近解放されたものから
              },
            });
          }

          if (availableAccount) {
            // creatorIdに固定割り当て
            await tx.virtualAccount.update({
              where: { id: availableAccount.id },
              data: {
                creatorId,
                releasedAt: null, // 固定割り当てなので冷却期間をクリア
              },
            });
            this.logger.log(
              `Assigned new fixed account to creator: ${creatorId}`,
            );
          }
        }
      } else {
        // ファンクレジットの場合: 使い捨て方式
        if (fanProfileId) {
          // 1. ファンが事前予約した口座を優先利用（modal表示時に確保済みのもの）
          availableAccount = await tx.virtualAccount.findFirst({
            where: {
              fanId: fanProfileId,
              isUsed: true,
              assignedToPaymentId: null,
              isActive: true,
              purpose,
            },
          });
        }

        if (!availableAccount) {
          // 2. プールから未割り当て口座を取得（フォールバック）
          availableAccount = await tx.virtualAccount.findFirst({
            where: {
              fanId: null,
              isUsed: false,
              isActive: true,
              purpose,
            },
            orderBy: {
              createdAt: 'asc',
            },
          });

          if (availableAccount && fanProfileId) {
            // プール口座をファンに事前予約として設定
            await tx.virtualAccount.update({
              where: { id: availableAccount.id },
              data: { fanId: fanProfileId, isUsed: true },
            });
          }
        }
      }

      if (!availableAccount) {
        this.logger.error(
          `CRITICAL: Virtual account inventory depleted for purpose: ${purpose}`,
          { paymentId, purpose, timestamp: new Date().toISOString() },
        );
        throw new BadRequestException(
          `Virtual account inventory is currently unavailable. Please contact support.`,
        );
      }

      // 決済に紐付けて isUsed=true に更新
      const assignedAccount = await tx.virtualAccount.update({
        where: { id: availableAccount.id },
        data: {
          isUsed: true,
          assignedToPaymentId: paymentId,
          assignedAt: new Date(),
        },
      });

      this.logger.log(
        `Virtual account assigned: ${assignedAccount.accountNumber} -> Payment: ${paymentId}`,
      );

      return assignedAccount;
    });

    return assignedAccount;
  }

  /**
   * バーチャル口座を在庫に戻す（決済完了・期限切れ時）
   * @param paymentId CreatorSubscription.id または ChargeRequest.id
   */
  async releaseVirtualAccount(paymentId: string) {
    this.logger.log(`Releasing virtual account for payment: ${paymentId}`);

    return await this.prisma.$transaction(async (tx) => {
      // 該当する口座を検索
      const virtualAccount = await tx.virtualAccount.findFirst({
        where: {
          assignedToPaymentId: paymentId,
          isUsed: true,
        },
      });

      if (!virtualAccount) {
        this.logger.warn(
          `No virtual account found for payment: ${paymentId} (may already be released)`,
        );
        return null;
      }

      // 固定口座（creatorIdが設定されている）の場合は、creatorIdを保持したまま解放
      const isFixedAccount = virtualAccount.creatorId !== null;

      // 在庫に戻す（ファン口座は fanId もクリアして完全解放）
      const releasedAccount = await tx.virtualAccount.update({
        where: { id: virtualAccount.id },
        data: {
          isUsed: false,
          assignedToPaymentId: null,
          assignedAt: null,
          fanId: isFixedAccount ? undefined : null, // ファン口座は完全解放
          releasedAt: isFixedAccount ? null : new Date(), // 固定口座の場合は冷却期間不要
        },
      });

      this.logger.log(
        `Virtual account released: ${releasedAccount.accountNumber} (Payment: ${paymentId}, Fixed: ${isFixedAccount})`,
      );

      return releasedAccount;
    });
  }

  /**
   * 決済IDに紐付くバーチャル口座を取得
   * @param paymentId CreatorSubscription.id または ChargeRequest.id
   */
  async getVirtualAccountByPaymentId(paymentId: string) {
    this.logger.log(`Getting virtual account for payment: ${paymentId}`);

    return await this.prisma.virtualAccount.findFirst({
      where: {
        assignedToPaymentId: paymentId,
        isUsed: true,
      },
    });
  }

  /**
   * 期限切れの ChargeRequest に紐付く口座を解放
   * @returns 解放された口座の数
   */
  async releaseExpiredChargeRequests() {
    this.logger.log('Releasing virtual accounts for expired charge requests');

    const now = new Date();

    // 期限切れの ChargeRequest を取得
    const expiredRequests = await this.prisma.chargeRequest.findMany({
      where: {
        status: ChargeRequestStatus.PENDING,
        expiresAt: {
          lt: now,
        },
      },
    });

    let releasedCount = 0;

    for (const request of expiredRequests) {
      try {
        // ChargeRequest のステータスを EXPIRED に更新
        await this.prisma.chargeRequest.update({
          where: { id: request.id },
          data: { status: ChargeRequestStatus.EXPIRED },
        });

        // 紐付いている口座を解放
        const released = await this.releaseVirtualAccount(request.id);
        if (released) {
          releasedCount++;
        }
      } catch (error) {
        this.logger.error(
          `Failed to release expired charge request: ${request.id}`,
          (error as any).stack,
        );
      }
    }

    this.logger.log(
      `Released ${releasedCount} virtual accounts from ${expiredRequests.length} expired charge requests`,
    );

    return releasedCount;
  }

  /**
   * 在庫状況を取得（管理者用）
   */
  async getInventoryStatus() {
    const [creatorPlanTotal, creatorPlanUsed, fanCreditTotal, fanCreditUsed] =
      await Promise.all([
        this.prisma.virtualAccount.count({
          where: { purpose: BankTransferType.CREATOR_PLAN },
        }),
        this.prisma.virtualAccount.count({
          where: { purpose: BankTransferType.CREATOR_PLAN, isUsed: true },
        }),
        this.prisma.virtualAccount.count({
          where: { purpose: BankTransferType.FAN_CREDIT },
        }),
        this.prisma.virtualAccount.count({
          where: { purpose: BankTransferType.FAN_CREDIT, isUsed: true },
        }),
      ]);

    return {
      creatorPlan: {
        total: creatorPlanTotal,
        used: creatorPlanUsed,
        available: creatorPlanTotal - creatorPlanUsed,
      },
      fanCredit: {
        total: fanCreditTotal,
        used: fanCreditUsed,
        available: fanCreditTotal - fanCreditUsed,
      },
    };
  }

  /**
   * Automation Webhookを処理（Make/Zapier経由）
   */
  async processAutomationWebhook(payload: AutomationWebhookDto) {
    this.logger.log(`Processing automation webhook for account: ${payload.accountNumber}`);

    // 1. バーチャル口座を特定
    const virtualAccount = await this.prisma.virtualAccount.findUnique({
      where: { accountNumber: payload.accountNumber },
      include: {
        creator: true,
        fan: true,
      },
    });

    if (!virtualAccount) {
      throw new BadRequestException(
        `Virtual account not found: ${payload.accountNumber}`,
      );
    }

    if (!virtualAccount.isActive) {
      throw new BadRequestException(
        `Virtual account is inactive: ${payload.accountNumber}`,
      );
    }

    // 決済IDが割り当てられているか確認
    if (!virtualAccount.assignedToPaymentId) {
      this.logger.warn(
        `Virtual account ${payload.accountNumber} has no assigned payment ID`,
      );
      throw new BadRequestException(
        `Virtual account is not assigned to any payment`,
      );
    }

    // 2. 重複チェック（同じ口座番号・金額・振込日時の組み合わせ）
    const transferDate = new Date(payload.transferDate);
    const existing = await this.prisma.bankTransfer.findFirst({
      where: {
        virtualAccountId: virtualAccount.id,
        amount: payload.amount,
        transferDate,
        transferorName: payload.transferorName,
      },
    });

    if (existing) {
      this.logger.warn(
        `Duplicate automation webhook detected: ${payload.accountNumber} - ${payload.amount}`,
      );
      return existing;
    }

    // 3. BankTransferレコードを作成
    const bankTransfer = await this.prisma.bankTransfer.create({
      data: {
        virtualAccountId: virtualAccount.id,
        amount: payload.amount,
        transferorName: payload.transferorName,
        transferDate,
        type: virtualAccount.purpose,
        status: BankTransferStatus.PENDING,
        gmoTransactionId: null, // Automation Webhookの場合はnull
        webhookPayload: payload as any,
      },
    });

    // 4. 用途に応じて処理を分岐（既存のロジックを再利用）
    try {
      if (virtualAccount.purpose === BankTransferType.CREATOR_PLAN) {
        await this.processCreatorPlanPayment(bankTransfer, virtualAccount);
      } else if (virtualAccount.purpose === BankTransferType.FAN_CREDIT) {
        await this.processFanCreditCharge(bankTransfer, virtualAccount);
      }

      // 処理成功
      await this.prisma.bankTransfer.update({
        where: { id: bankTransfer.id },
        data: {
          status: BankTransferStatus.PROCESSED,
          processedAt: new Date(),
        },
      });

      // バーチャル口座を在庫に戻す
      await this.releaseVirtualAccount(virtualAccount.assignedToPaymentId);

      this.logger.log(
        `Successfully processed automation webhook: ${bankTransfer.id}`,
      );
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
        `Failed to process automation webhook: ${bankTransfer.id}`,
        (error as any).stack,
      );
      throw error;
    }

    return bankTransfer;
  }
}
