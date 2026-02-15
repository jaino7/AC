import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BankTransfersService } from './bank-transfers.service';
import { ClaimsService } from '../payments/claims.service';
import { MailService } from '../mail/mail.service';
import { ChargeRequestStatus, CreatorSubscriptionStatus } from '@prisma/client';

/**
 * Cron Job Service
 * Handles scheduled tasks for bank transfers and subscriptions
 */
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private bankTransfersService: BankTransfersService,
    private mailService: MailService,
    @Inject(forwardRef(() => ClaimsService))
    private claimsService: ClaimsService,
  ) {}

  /**
   * Release expired charge requests and virtual accounts
   * Runs every hour
   *
   * Logic:
   * 1. Find ChargeRequests created more than 24 hours ago with PENDING status
   * 2. Update status to EXPIRED
   * 3. Release associated VirtualAccount back to pool
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredChargeRequests() {
    const startTime = Date.now();
    this.logger.log('Starting expired charge requests cleanup...');

    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      // Find expired charge requests (24h+ old and still PENDING)
      const expiredRequests = await this.prisma.chargeRequest.findMany({
        where: {
          status: ChargeRequestStatus.PENDING,
          createdAt: {
            lt: cutoffTime,
          },
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          fanId: true,
        },
      });

      if (expiredRequests.length === 0) {
        this.logger.log('No expired charge requests found');
        return;
      }

      this.logger.log(`Found ${expiredRequests.length} expired charge requests`);

      let expiredCount = 0;
      let releasedCount = 0;

      for (const request of expiredRequests) {
        try {
          // Update ChargeRequest status to EXPIRED
          await this.prisma.chargeRequest.update({
            where: { id: request.id },
            data: { status: ChargeRequestStatus.EXPIRED },
          });
          expiredCount++;

          // Release associated virtual account
          const released = await this.bankTransfersService.releaseVirtualAccount(
            request.id,
          );

          if (released) {
            releasedCount++;
            this.logger.log(
              `Released virtual account for expired ChargeRequest: ${request.id} (Amount: ¥${request.amount})`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Failed to process expired ChargeRequest: ${request.id}`,
            (error as any).stack,
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Expired charge requests cleanup completed: ${expiredCount} expired, ${releasedCount} virtual accounts released (${duration}ms)`,
      );

      // Log to database for admin dashboard
      await this.logCronExecution({
        taskName: 'expire_charge_requests',
        status: 'SUCCESS',
        recordsProcessed: expiredCount,
        message: `Expired ${expiredCount} charge requests, released ${releasedCount} virtual accounts`,
        durationMs: duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Expired charge requests cleanup failed: ${(error as any).message}`,
        (error as any).stack,
      );

      // Log error to database
      await this.logCronExecution({
        taskName: 'expire_charge_requests',
        status: 'FAILED',
        recordsProcessed: 0,
        message: (error as any).message,
        durationMs: duration,
      });
    }
  }

  /**
   * Monitor and expire CreatorSubscriptions
   * Runs every hour
   *
   * Logic:
   * 1. Find CreatorSubscriptions with endDate in the past
   * 2. Update status to EXPIRED
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredSubscriptions() {
    const startTime = Date.now();
    this.logger.log('Starting expired subscriptions monitoring...');

    try {
      const now = new Date();

      // Find expired subscriptions (endDate has passed and status is ACTIVE)
      const expiredSubscriptions = await this.prisma.creatorSubscription.findMany({
        where: {
          status: CreatorSubscriptionStatus.ACTIVE,
          endDate: {
            lt: now,
          },
        },
        include: {
          creator: {
            select: {
              handle: true,
              displayName: true,
            },
          },
          plan: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

      if (expiredSubscriptions.length === 0) {
        this.logger.log('No expired subscriptions found');
        return;
      }

      this.logger.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

      let expiredCount = 0;

      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status to EXPIRED
          await this.prisma.creatorSubscription.update({
            where: { id: subscription.id },
            data: {
              status: CreatorSubscriptionStatus.EXPIRED,
            },
          });

          expiredCount++;

          this.logger.log(
            `Expired subscription: ${subscription.id} (Creator: ${subscription.creator.handle}, Plan: ${subscription.plan.name}, EndDate: ${subscription.endDate?.toISOString()})`,
          );

          // TODO: Send email notification to creator about subscription expiration
        } catch (error) {
          this.logger.error(
            `Failed to expire subscription: ${subscription.id}`,
            (error as any).stack,
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Expired subscriptions monitoring completed: ${expiredCount} subscriptions expired (${duration}ms)`,
      );

      // Log to database for admin dashboard
      await this.logCronExecution({
        taskName: 'expire_subscriptions',
        status: 'SUCCESS',
        recordsProcessed: expiredCount,
        message: `Expired ${expiredCount} creator subscriptions`,
        durationMs: duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Expired subscriptions monitoring failed: ${(error as any).message}`,
        (error as any).stack,
      );

      // Log error to database
      await this.logCronExecution({
        taskName: 'expire_subscriptions',
        status: 'FAILED',
        recordsProcessed: 0,
        message: (error as any).message,
        durationMs: duration,
      });
    }
  }

  /**
   * Reclaim virtual accounts from creators on free/inactive plan for 6+ months
   * Runs daily at 3 AM
   *
   * Logic:
   * 1. Find creators with a CREATOR_PLAN virtual account assigned
   * 2. If their subscription is FREE, EXPIRED, or null for 180+ days → reclaim
   * 3. Send warning email 7 days before (173 days)
   * 4. Send notification email on reclaim
   */
  @Cron('0 3 * * *') // Daily at 3 AM
  async handleVirtualAccountReclamation() {
    const startTime = Date.now();
    this.logger.log('Starting virtual account reclamation (6-month rule)...');

    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
      const warningThreshold = new Date(now);
      warningThreshold.setDate(warningThreshold.getDate() - 173);

      // Find creators with assigned CREATOR_PLAN virtual accounts
      const eligibleCreators = await this.prisma.creatorProfile.findMany({
        where: {
          virtualAccounts: {
            some: {
              purpose: 'CREATOR_PLAN',
              isActive: true,
              creatorId: { not: null },
            },
          },
        },
        include: {
          user: { select: { id: true, email: true } },
          virtualAccounts: {
            where: { purpose: 'CREATOR_PLAN', isActive: true },
          },
          creatorSubscription: {
            include: { plan: true },
          },
        },
      });

      let reclaimedCount = 0;
      let warnedCount = 0;

      for (const creator of eligibleCreators) {
        const subscription = creator.creatorSubscription;

        // Determine if creator is effectively on "free" (no active paid plan)
        const isFreeTier =
          !subscription ||
          subscription.plan.type === 'FREE' ||
          subscription.status === CreatorSubscriptionStatus.EXPIRED ||
          subscription.status === CreatorSubscriptionStatus.CANCELLED;

        if (!isFreeTier) continue;

        // Determine since when they've been on free tier
        const freeSince =
          subscription?.endDate ?? subscription?.updatedAt ?? creator.createdAt;
        const daysFree = Math.floor(
          (now.getTime() - freeSince.getTime()) / (1000 * 60 * 60 * 24),
        );

        const creatorEmail = creator.user?.email;
        const creatorName = creator.displayName || creator.handle;

        // Send warning email at 173 days (7 days before reclaim)
        if (daysFree >= 173 && daysFree < 180) {
          const reclaimDate = new Date(freeSince);
          reclaimDate.setDate(reclaimDate.getDate() + 180);

          if (creatorEmail) {
            try {
              for (const account of creator.virtualAccounts) {
                await this.mailService.sendVirtualAccountReclaimWarningEmail(
                  creatorEmail,
                  {
                    creatorName,
                    accountNumber: account.accountNumber,
                    reclaimDate,
                  },
                  creator.user.id,
                );
              }
              warnedCount++;
              this.logger.log(
                `Sent reclaim warning to creator: ${creator.id} (${daysFree} days free)`,
              );
            } catch (error) {
              this.logger.error(
                `Failed to send warning email to creator: ${creator.id}`,
                (error as any).stack,
              );
            }
          }
        }

        // Reclaim accounts after 180 days (6 months)
        if (daysFree >= 180) {
          for (const account of creator.virtualAccounts) {
            try {
              await this.prisma.virtualAccount.update({
                where: { id: account.id },
                data: {
                  isUsed: false,
                  creatorId: null,
                  assignedToPaymentId: null,
                  assignedAt: null,
                  releasedAt: new Date(),
                },
              });

              reclaimedCount++;
              this.logger.log(
                `Reclaimed virtual account: ${account.accountNumber} from creator: ${creator.id} (${daysFree} days free)`,
              );

              // Send reclaim notification email
              if (creatorEmail) {
                await this.mailService.sendVirtualAccountReclaimedEmail(
                  creatorEmail,
                  { creatorName, accountNumber: account.accountNumber },
                  creator.user.id,
                ).catch((e) =>
                  this.logger.error(`Failed to send reclaim email: ${(e as any).message}`),
                );
              }
            } catch (error) {
              this.logger.error(
                `Failed to reclaim account ${account.id} from creator ${creator.id}`,
                (error as any).stack,
              );
            }
          }
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Virtual account reclamation completed: ${reclaimedCount} reclaimed, ${warnedCount} warned (${duration}ms)`,
      );

      await this.logCronExecution({
        taskName: 'reclaim_virtual_accounts',
        status: 'SUCCESS',
        recordsProcessed: reclaimedCount,
        message: `Reclaimed ${reclaimedCount} accounts, sent ${warnedCount} warning emails`,
        durationMs: duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Virtual account reclamation failed: ${(error as any).message}`,
        (error as any).stack,
      );

      await this.logCronExecution({
        taskName: 'reclaim_virtual_accounts',
        status: 'FAILED',
        recordsProcessed: 0,
        message: (error as any).message,
        durationMs: duration,
      });
    }
  }

  /**
   * Expire unverified bank transfer claims older than 48 hours
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleExpireClaims() {
    const startTime = Date.now();
    this.logger.log('Starting expire claims cron job');

    try {
      const result = await this.claimsService.expireOldClaims();

      const durationMs = Date.now() - startTime;

      // Log to CronLog table
      await this.logCronExecution({
        taskName: 'expire_claims',
        status: 'SUCCESS',
        recordsProcessed: result.expiredCount,
        message: `Expired ${result.expiredCount} old claims`,
        durationMs,
      });

      this.logger.log(
        `Expire claims cron job completed. Expired: ${result.expiredCount}, Duration: ${durationMs}ms`,
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;

      // Log error to CronLog table
      await this.logCronExecution({
        taskName: 'expire_claims',
        status: 'FAILED',
        recordsProcessed: 0,
        message: `Error: ${(error as any).message}`,
        durationMs,
      });

      this.logger.error('Expire claims cron job failed', (error as any).stack);
      throw error;
    }
  }

  /**
   * Log cron job execution to database
   * This allows admin dashboard to track cron job history
   */
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
      // Don't throw error if logging fails - just log to console
      this.logger.error(`Failed to log cron execution: ${(error as any).message}`);
    }
  }
}
