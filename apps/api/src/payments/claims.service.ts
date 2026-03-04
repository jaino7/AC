import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BankTransferClaimStatus, BankTransfer, BankTransferClaim } from '@prisma/client';
import { DiscordService } from '../notifications/discord.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private discordService: DiscordService,
    private mailService: MailService,
  ) { }

  /**
   * Create a new claim for a charge request
   */
  async createClaim(fanId: string, chargeRequestId: string) {
    // Get fan profile with current tier and user info
    const fan = await this.prisma.fanProfile.findUnique({
      where: { id: fanId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            handle: true,
          },
        },
      },
    });

    if (!fan) {
      throw new NotFoundException('Fan profile not found');
    }

    // Check if fan is locked
    if (fan.isLocked) {
      throw new ForbiddenException({
        message: 'アカウントがロックされています',
        reason: fan.lockedReason,
        lockedAt: fan.lockedAt,
      });
    }

    // Get charge request with virtual account
    const chargeRequest = await this.prisma.chargeRequest.findUnique({
      where: { id: chargeRequestId },
    });

    if (!chargeRequest) {
      throw new NotFoundException('Charge request not found');
    }

    // Get assigned virtual account
    const virtualAccount = await this.prisma.virtualAccount.findFirst({
      where: {
        assignedToPaymentId: chargeRequestId,
      },
    });

    // Check if charge request belongs to this fan
    if (chargeRequest.fanId !== fanId) {
      throw new ForbiddenException('This charge request does not belong to you');
    }

    // Check if claim already exists for this charge request
    const existingClaim = await this.prisma.bankTransferClaim.findFirst({
      where: {
        chargeRequestId,
        status: { in: [BankTransferClaimStatus.PENDING, BankTransferClaimStatus.VERIFIED] },
      },
    });

    if (existingClaim) {
      throw new BadRequestException('A claim already exists for this charge request');
    }

    // Check if fan can use immediate credit (cooldown + verification check)
    const { canUse, reason } = await this.canUseImmediateCredit(fanId);

    let immediateCredit: number;
    let pendingCredit: number;

    if (!canUse) {
      // Cooldown active or previous claim unverified: all credit goes to pending
      immediateCredit = 0;
      pendingCredit = chargeRequest.amount;
      console.log(`Immediate credit blocked for fan ${fanId}: ${reason}`);
    } else {
      // Get used immediate credits to enforce limits
      const usedImmediateCredit = await this.getUsedImmediateCredit(fanId);

      // Calculate immediate vs pending credits based on tier
      ({ immediateCredit, pendingCredit } = this.calculateCreditAllocation(
        fan.tier,
        chargeRequest.amount,
        usedImmediateCredit,
      ));
    }

    // Create claim
    // Generate a unique identifier code for the claim (required by schema)
    const identifierCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const claim = await this.prisma.bankTransferClaim.create({
      data: {
        fanId,
        chargeRequestId,
        amount: chargeRequest.amount,
        immediateCredit,
        pendingCredit,
        status: BankTransferClaimStatus.PENDING,
        identifierCode,
      },
    });

    // Grant immediate credits if applicable
    if (immediateCredit > 0) {
      await this.grantImmediateCredits(fanId, immediateCredit, claim.id);
    }

    // Update charge request to mark it has a claim
    await this.prisma.chargeRequest.update({
      where: { id: chargeRequestId },
      data: { hasClaim: true },
    });

    // Send Discord notification
    try {
      await this.discordService.sendClaimNotification({
        userId: fan.user.id,
        userName: fan.user.name || 'Unknown',
        userEmail: fan.user.email || '',
        amount: chargeRequest.amount,
        tier: fan.tier,
        trustScore: fan.trustScore,
        immediateCredit,
        pendingCredit,
        creatorHandle: fan.creator?.handle,
        virtualAccount: virtualAccount ? {
          accountNumber: virtualAccount.accountNumber,
          branchCode: virtualAccount.branchCode,
          branchName: virtualAccount.branchName,
        } : undefined,
      });
    } catch (error) {
      // Log error but don't fail the claim creation
      console.error('Failed to send Discord notification:', error);
    }

    return {
      claim,
      immediateCredit,
      pendingCredit,
    };
  }

  /**
   * Send Discord notification for Tier 0 claim and create ChargeRequest for admin visibility
   */
  async notifyTier0Claim(fanId: string) {
    const fan = await this.prisma.fanProfile.findUnique({
      where: { id: fanId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        creator: { select: { handle: true } },
      },
    });

    if (!fan) {
      throw new NotFoundException('Fan profile not found');
    }

    // Get assigned virtual account
    const virtualAccount = await this.prisma.virtualAccount.findFirst({
      where: {
        fanId: fanId,
        purpose: 'FAN_CREDIT',
        isActive: true,
      },
    });

    // Create a ChargeRequest with amount=0 so the admin panel can track this claim
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const identifierCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const chargeRequest = await this.prisma.chargeRequest.create({
      data: {
        fanId,
        amount: 0,
        status: 'PENDING',
        expiresAt,
        identifierCode,
        hasClaim: true,
      },
    });

    // Link the pre-reserved VA to this ChargeRequest so admin panel shows the account number
    if (virtualAccount) {
      await this.prisma.virtualAccount.update({
        where: { id: virtualAccount.id },
        data: { assignedToPaymentId: chargeRequest.id },
      });
    }

    try {
      await this.discordService.sendClaimNotification({
        userId: fan.user.id,
        userName: fan.user.name || 'Unknown',
        userEmail: fan.user.email || '',
        amount: 0, // Tier 0 doesn't set an amount
        tier: fan.tier,
        trustScore: fan.trustScore,
        immediateCredit: 0,
        pendingCredit: 0,
        creatorHandle: fan.creator?.handle,
        virtualAccount: virtualAccount ? {
          accountNumber: virtualAccount.accountNumber,
          branchCode: virtualAccount.branchCode,
          branchName: virtualAccount.branchName,
        } : undefined,
      });
    } catch (error) {
      console.error('Failed to send Discord notification for Tier 0:', error);
    }

    return { success: true };
  }

  /**
   * Calculate credit allocation based on fan tier and used credits
   * - Tier 0: 0 immediate, all pending
   * - Tier 1: min(amount, max(3000 - used, 0)) immediate, rest pending
   * - Tier 2: min(amount, max(20000 - used, 0)) immediate, rest pending
   */
  calculateCreditAllocation(tier: number, amount: number, usedImmediateCredit: number = 0): {
    immediateCredit: number;
    pendingCredit: number;
  } {
    let immediateCredit = 0;
    let pendingCredit = amount;

    if (tier === 0) {
      // New users: no immediate credit
      immediateCredit = 0;
      pendingCredit = amount;
    } else if (tier === 1) {
      // Trusted users: up to 3000 yen immediate
      const remainingLimit = Math.max(3000 - usedImmediateCredit, 0);
      immediateCredit = Math.min(amount, remainingLimit);
      pendingCredit = Math.max(amount - immediateCredit, 0);
    } else if (tier >= 2) {
      // Premium users: up to 20000 yen immediate
      const remainingLimit = Math.max(20000 - usedImmediateCredit, 0);
      immediateCredit = Math.min(amount, remainingLimit);
      pendingCredit = Math.max(amount - immediateCredit, 0);
    }

    return { immediateCredit, pendingCredit };
  }

  /**
   * Get the total immediate credit currently pending for a fan
   */
  async getUsedImmediateCredit(fanId: string): Promise<number> {
    const claims = await this.prisma.bankTransferClaim.findMany({
      where: {
        fanId,
        status: BankTransferClaimStatus.PENDING,
        immediateCredit: { gt: 0 },
      },
      select: {
        immediateCredit: true,
      },
    });

    return claims.reduce((sum, claim) => sum + claim.immediateCredit, 0);
  }

  /**
   * Check if a fan can use immediate credit.
   * Condition: The last claim with immediateCredit > 0 must be VERIFIED.
   * If no previous immediate-credit claim exists, the fan can use immediate credit (first time).
   */
  async canUseImmediateCredit(fanId: string): Promise<{
    canUse: boolean;
    reason: string | null;
  }> {
    // Find the most recent claim that had immediate credit
    const lastImmediateClaim = await this.prisma.bankTransferClaim.findFirst({
      where: {
        fanId,
        immediateCredit: { gt: 0 },
      },
      orderBy: {
        claimedAt: 'desc',
      },
      select: {
        status: true,
      },
    });

    // No previous immediate-credit claim: first time, allow it
    if (!lastImmediateClaim) {
      return { canUse: true, reason: null };
    }

    // Previous claim must be VERIFIED
    if (lastImmediateClaim.status !== BankTransferClaimStatus.VERIFIED) {
      return {
        canUse: false,
        reason: 'pending_unverified',
      };
    }

    return { canUse: true, reason: null };
  }

  /**
   * Grant immediate credits to fan and create credit history
   */
  async grantImmediateCredits(fanId: string, amount: number, claimId: string) {
    // Update fan credits
    const fan = await this.prisma.fanProfile.update({
      where: { id: fanId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });

    // Create credit history
    await this.prisma.creditHistory.create({
      data: {
        fanId,
        type: 'CHARGE',
        amount,
        balance: fan.credits,
        description: `即時チャージ (Trust & Lock) - Claim ID: ${claimId}`,
      },
    });

    return fan;
  }

  /**
   * Verify claim against actual bank transfer
   */
  async verifyClaim(claim: BankTransferClaim, bankTransfer: BankTransfer) {
    // Check if claim is already processed
    if (claim.status !== BankTransferClaimStatus.PENDING) {
      console.log(`Claim ${claim.id} already processed with status: ${claim.status}`);
      return;
    }

    // Check if amounts match
    if (claim.amount !== bankTransfer.amount) {
      await this.handleFraudDetection(
        claim,
        bankTransfer,
        `金額不一致: 申告額=${claim.amount}円、実際の振込額=${bankTransfer.amount}円`,
      );
      return;
    }

    // Check if transfer is within 48 hours of claim
    const hoursSinceClaim = (bankTransfer.transferDate.getTime() - claim.claimedAt.getTime()) / (1000 * 60 * 60);
    if (Math.abs(hoursSinceClaim) > 48) {
      await this.handleFraudDetection(
        claim,
        bankTransfer,
        `タイムアウト: 申告から${Math.abs(hoursSinceClaim).toFixed(1)}時間経過`,
      );
      return;
    }

    // Verification successful - grant pending credits
    if (claim.pendingCredit > 0) {
      await this.grantPendingCredits(claim.fanId, claim.pendingCredit, claim.id);
    }

    // Increment trust score
    await this.incrementTrustScore(claim.fanId);

    // Update claim status
    await this.prisma.bankTransferClaim.update({
      where: { id: claim.id },
      data: {
        status: BankTransferClaimStatus.VERIFIED,
        approvedAt: new Date(),
        bankTransferId: bankTransfer.id,
      },
    });

    console.log(`Claim ${claim.id} verified successfully`);
  }

  /**
   * Grant pending credits after verification
   */
  async grantPendingCredits(fanId: string, amount: number, claimId: string) {
    const fan = await this.prisma.fanProfile.update({
      where: { id: fanId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });

    await this.prisma.creditHistory.create({
      data: {
        fanId,
        type: 'CHARGE',
        amount,
        balance: fan.credits,
        description: `保留クレジット付与 (振込確認済み) - Claim ID: ${claimId}`,
      },
    });

    return fan;
  }

  /**
   * Handle fraud detection - lock account and reverse credits
   */
  async handleFraudDetection(claim: BankTransferClaim, bankTransfer: BankTransfer, reason: string) {
    console.log(`Fraud detected for claim ${claim.id}: ${reason}`);

    // Lock fan account
    await this.prisma.fanProfile.update({
      where: { id: claim.fanId },
      data: {
        isLocked: true,
        lockedReason: `不正検知: ${reason}`,
        lockedAt: new Date(),
      },
    });

    // Reverse immediate credits if granted
    if (claim.immediateCredit > 0) {
      const fan = await this.prisma.fanProfile.update({
        where: { id: claim.fanId },
        data: {
          credits: {
            decrement: claim.immediateCredit,
          },
        },
      });

      await this.prisma.creditHistory.create({
        data: {
          fanId: claim.fanId,
          type: 'REFUND',
          amount: -claim.immediateCredit,
          balance: fan.credits,
          description: `不正検知によるクレジット取り消し - Claim ID: ${claim.id}`,
        },
      });
    }

    // Mark claim as rejected
    await this.prisma.bankTransferClaim.update({
      where: { id: claim.id },
      data: {
        status: BankTransferClaimStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason,
        bankTransferId: bankTransfer.id,
      },
    });

    // TODO: Send notification email
    console.log(`Account ${claim.fanId} locked due to fraud detection`);
  }

  /**
   * Increment trust score and upgrade tier if thresholds met
   */
  async incrementTrustScore(fanId: string) {
    const fan = await this.prisma.fanProfile.findUnique({
      where: { id: fanId },
    });

    if (!fan) {
      throw new NotFoundException('Fan profile not found');
    }

    const newTrustScore = fan.trustScore + 1;
    let newTier = fan.tier;

    // Auto-upgrade tier based on trust score
    if (newTrustScore >= 3 && fan.tier < 2) {
      newTier = 2; // Upgrade to Premium
      console.log(`Fan ${fanId} upgraded to Tier 2 (Premium)`);
      // TODO: Send tier upgrade notification email
    } else if (newTrustScore >= 1 && fan.tier < 1) {
      newTier = 1; // Upgrade to Trusted
      console.log(`Fan ${fanId} upgraded to Tier 1 (Trusted)`);
      // TODO: Send tier upgrade notification email
    }

    await this.prisma.fanProfile.update({
      where: { id: fanId },
      data: {
        trustScore: newTrustScore,
        tier: newTier,
      },
    });

    return { newTrustScore, newTier };
  }

  /**
   * Get pending claims for admin review
   */
  async getPendingClaims(limit: number = 100) {
    return this.prisma.bankTransferClaim.findMany({
      where: {
        status: BankTransferClaimStatus.PENDING,
      },
      include: {
        fan: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        chargeRequest: true,
        bankTransfer: true,
      },
      orderBy: {
        claimedAt: 'asc',
      },
      take: limit,
    });
  }

  /**
   * Manually approve a claim (admin action)
   */
  async approveClaim(claimId: string, adminId: string) {
    const claim = await this.prisma.bankTransferClaim.findUnique({
      where: { id: claimId },
      include: {
        fan: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== BankTransferClaimStatus.PENDING) {
      throw new BadRequestException('Claim is not pending');
    }

    // Grant pending credits
    if (claim.pendingCredit > 0) {
      await this.grantPendingCredits(claim.fanId, claim.pendingCredit, claim.id);
    }

    // Increment trust score
    await this.incrementTrustScore(claim.fanId);

    // Update claim
    await this.prisma.bankTransferClaim.update({
      where: { id: claimId },
      data: {
        status: BankTransferClaimStatus.VERIFIED,
        approvedAt: new Date(),
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    // Send credit notification email to fan
    const fan = claim.fan;
    const user = fan?.user;
    if (user?.email) {
      try {
        const updatedFan = await this.prisma.fanProfile.findUnique({
          where: { id: claim.fanId },
        });
        const totalGranted = claim.immediateCredit + claim.pendingCredit;

        await this.mailService.sendDepositSuccessEmail(
          user.email,
          {
            fanName: fan.displayName || user.name || 'ファン',
            amount: totalGranted,
            balance: updatedFan?.credits || 0,
            transferorName: fan.displayName || user.name || 'ファン',
            transferDate: new Date(),
          },
          user.id,
        );
      } catch (error) {
        console.error('Failed to send credit notification email:', error);
      }
    }

    return { success: true };
  }

  /**
   * Manually reject a claim and lock account (admin action)
   */
  async rejectClaim(claimId: string, adminId: string, reason: string) {
    const claim = await this.prisma.bankTransferClaim.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== BankTransferClaimStatus.PENDING) {
      throw new BadRequestException('Claim is not pending');
    }

    // Lock account
    await this.prisma.fanProfile.update({
      where: { id: claim.fanId },
      data: {
        isLocked: true,
        lockedReason: `管理者による却下: ${reason}`,
        lockedAt: new Date(),
      },
    });

    // Reverse immediate credits if granted
    if (claim.immediateCredit > 0) {
      const fan = await this.prisma.fanProfile.update({
        where: { id: claim.fanId },
        data: {
          credits: {
            decrement: claim.immediateCredit,
          },
        },
      });

      await this.prisma.creditHistory.create({
        data: {
          fanId: claim.fanId,
          type: 'REFUND',
          amount: -claim.immediateCredit,
          balance: fan.credits,
          description: `管理者による却下 - Claim ID: ${claim.id}`,
        },
      });
    }

    // Update claim
    await this.prisma.bankTransferClaim.update({
      where: { id: claimId },
      data: {
        status: BankTransferClaimStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason,
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Expire old claims (called by cron job)
   */
  async expireOldClaims() {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - 48);

    const expiredClaims = await this.prisma.bankTransferClaim.findMany({
      where: {
        status: BankTransferClaimStatus.PENDING,
        claimedAt: {
          lt: expirationDate,
        },
      },
    });

    for (const claim of expiredClaims) {
      // Reverse immediate credits if granted
      if (claim.immediateCredit > 0) {
        const fan = await this.prisma.fanProfile.update({
          where: { id: claim.fanId },
          data: {
            credits: {
              decrement: claim.immediateCredit,
            },
          },
        });

        await this.prisma.creditHistory.create({
          data: {
            fanId: claim.fanId,
            type: 'REFUND',
            amount: -claim.immediateCredit,
            balance: fan.credits,
            description: `期限切れによるクレジット取り消し - Claim ID: ${claim.id}`,
          },
        });
      }

      // Mark as expired
      await this.prisma.bankTransferClaim.update({
        where: { id: claim.id },
        data: {
          status: BankTransferClaimStatus.EXPIRED,
        },
      });

      console.log(`Claim ${claim.id} expired`);
      // TODO: Send expiration warning email
    }

    return {
      expiredCount: expiredClaims.length,
      claims: expiredClaims,
    };
  }

  /**
   * Lock a fan account (admin action)
   */
  async lockFanAccount(fanId: string, reason: string, adminId: string) {
    await this.prisma.fanProfile.update({
      where: { id: fanId },
      data: {
        isLocked: true,
        lockedReason: reason,
        lockedAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Unlock a fan account (admin action)
   */
  async unlockFanAccount(fanId: string, adminId: string) {
    await this.prisma.fanProfile.update({
      where: { id: fanId },
      data: {
        isLocked: false,
        lockedReason: null,
        lockedAt: null,
      },
    });

    return { success: true };
  }
}
