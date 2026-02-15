import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ClaimsService } from '../payments/claims.service';
import { PrismaService } from '../prisma/prisma.service';
import { BankTransferClaimStatus } from '@prisma/client';

// TODO: Add admin authentication guard
// @UseGuards(AdminGuard)
@Controller('admin/claims')
export class ClaimsAdminController {
  constructor(
    private readonly claimsService: ClaimsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get pending claims for review
   * GET /admin/claims/pending
   */
  @Get('pending')
  async getPendingClaims(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.claimsService.getPendingClaims(limitNum);
  }

  /**
   * Get unmatched bank transfers
   * GET /admin/claims/bank-transfers
   */
  @Get('bank-transfers')
  async getUnmatchedBankTransfers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;

    return this.prisma.bankTransfer.findMany({
      where: {
        claim: null, // No claim linked
        type: 'FAN_CREDIT',
      },
      include: {
        virtualAccount: true,
        chargeRequest: {
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
          },
        },
      },
      orderBy: {
        transferDate: 'desc',
      },
      take: limitNum,
    });
  }

  /**
   * Get reconciliation view (claims + transfers + suggestions)
   * GET /admin/claims/reconciliation
   */
  @Get('reconciliation')
  async getReconciliationView() {
    const [pendingClaims, unmatchedTransfers] = await Promise.all([
      this.claimsService.getPendingClaims(50),
      this.prisma.bankTransfer.findMany({
        where: {
          claim: null,
          type: 'FAN_CREDIT',
        },
        include: {
          virtualAccount: true,
          chargeRequest: {
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
            },
          },
        },
        orderBy: {
          transferDate: 'desc',
        },
        take: 50,
      }),
    ]);

    // Find potential matches
    const suggestions = [];
    for (const claim of pendingClaims) {
      for (const transfer of unmatchedTransfers) {
        if (
          claim.amount === transfer.amount &&
          claim.chargeRequest.id === transfer.chargeRequestId
        ) {
          suggestions.push({
            claim,
            transfer,
            matchScore: 100, // Exact match
          });
        }
      }
    }

    return {
      pendingClaims,
      unmatchedTransfers,
      suggestions,
    };
  }

  /**
   * Manually approve a claim
   * POST /admin/claims/:claimId/approve
   */
  @Post(':claimId/approve')
  async approveClaim(
    @Param('claimId') claimId: string,
    @Body() body: { adminId: string },
  ) {
    return this.claimsService.approveClaim(claimId, body.adminId);
  }

  /**
   * Reject a claim and lock account
   * POST /admin/claims/:claimId/reject
   */
  @Post(':claimId/reject')
  async rejectClaim(
    @Param('claimId') claimId: string,
    @Body() body: { adminId: string; reason: string },
  ) {
    return this.claimsService.rejectClaim(claimId, body.adminId, body.reason);
  }

  /**
   * Lock a fan account
   * POST /admin/claims/fans/:fanId/lock
   */
  @Post('fans/:fanId/lock')
  async lockFanAccount(
    @Param('fanId') fanId: string,
    @Body() body: { adminId: string; reason: string },
  ) {
    return this.claimsService.lockFanAccount(fanId, body.reason, body.adminId);
  }

  /**
   * Unlock a fan account
   * POST /admin/claims/fans/:fanId/unlock
   */
  @Post('fans/:fanId/unlock')
  async unlockFanAccount(
    @Param('fanId') fanId: string,
    @Body() body: { adminId: string },
  ) {
    return this.claimsService.unlockFanAccount(fanId, body.adminId);
  }

  /**
   * Batch approve claims
   * POST /admin/claims/batch-approve
   */
  @Post('batch-approve')
  async batchApproveClaims(
    @Body() body: { claimIds: string[]; adminId: string },
  ) {
    const results = [];

    for (const claimId of body.claimIds) {
      try {
        const result = await this.claimsService.approveClaim(claimId, body.adminId);
        results.push({ claimId, success: true, result });
      } catch (error) {
        results.push({ claimId, success: false, error: (error as any).message });
      }
    }

    return {
      total: body.claimIds.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Get locked accounts
   * GET /admin/claims/locked-accounts
   */
  @Get('locked-accounts')
  async getLockedAccounts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;

    return this.prisma.fanProfile.findMany({
      where: {
        isLocked: true,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        creator: {
          select: {
            handle: true,
            displayName: true,
          },
        },
        bankTransferClaims: {
          where: {
            status: BankTransferClaimStatus.REJECTED,
          },
          orderBy: {
            rejectedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        lockedAt: 'desc',
      },
      take: limitNum,
    });
  }

  /**
   * Get claim statistics
   * GET /admin/claims/stats
   */
  @Get('stats')
  async getClaimStats() {
    const [
      totalClaims,
      pendingClaims,
      verifiedClaims,
      rejectedClaims,
      expiredClaims,
      lockedAccounts,
      tier0Users,
      tier1Users,
      tier2Users,
    ] = await Promise.all([
      this.prisma.bankTransferClaim.count(),
      this.prisma.bankTransferClaim.count({
        where: { status: BankTransferClaimStatus.PENDING },
      }),
      this.prisma.bankTransferClaim.count({
        where: { status: BankTransferClaimStatus.VERIFIED },
      }),
      this.prisma.bankTransferClaim.count({
        where: { status: BankTransferClaimStatus.REJECTED },
      }),
      this.prisma.bankTransferClaim.count({
        where: { status: BankTransferClaimStatus.EXPIRED },
      }),
      this.prisma.fanProfile.count({
        where: { isLocked: true },
      }),
      this.prisma.fanProfile.count({
        where: { tier: 0 },
      }),
      this.prisma.fanProfile.count({
        where: { tier: 1 },
      }),
      this.prisma.fanProfile.count({
        where: { tier: { gte: 2 } },
      }),
    ]);

    const fraudRate = totalClaims > 0 ? (rejectedClaims / totalClaims) * 100 : 0;

    return {
      claims: {
        total: totalClaims,
        pending: pendingClaims,
        verified: verifiedClaims,
        rejected: rejectedClaims,
        expired: expiredClaims,
        fraudRate: fraudRate.toFixed(2) + '%',
      },
      accounts: {
        locked: lockedAccounts,
      },
      tiers: {
        tier0: tier0Users,
        tier1: tier1Users,
        tier2: tier2Users,
      },
    };
  }
}
