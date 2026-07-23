import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ClaimsService } from './claims.service';

@Controller('payments/claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) { }

  /**
   * Create a new bank transfer claim
   * POST /payments/claims
   */
  @Post()
  async createClaim(
    @Headers('x-user-id') userId: string,
    @Body() body: { chargeRequestId: string; creatorId: string },
  ) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get fan profile
    const fanProfile = await this.claimsService['prisma'].fanProfile.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId: body.creatorId,
        },
      },
    });

    if (!fanProfile) {
      throw new Error('Fan profile not found');
    }

    const result = await this.claimsService.createClaim(fanProfile.id, body.chargeRequestId);

    return {
      success: true,
      claim: result.claim,
      immediateCredit: result.immediateCredit,
      pendingCredit: result.pendingCredit,
      message: result.immediateCredit > 0
        ? `${result.immediateCredit}円が即時付与されました。残り${result.pendingCredit}円は振込確認後に付与されます。`
        : '振込確認後にクレジットが付与されます。',
    };
  }

  /**
   * Notify Discord for Tier 0 claim (No ChargeRequest required)
   * POST /payments/claims/notify-tier0
   */
  @Post('notify-tier0')
  async notifyTier0(
    @Headers('x-user-id') userId: string,
    @Body() body: { creatorId: string },
  ) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const fanProfile = await this.claimsService['prisma'].fanProfile.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId: body.creatorId,
        },
      },
    });

    if (!fanProfile) {
      throw new Error('Fan profile not found');
    }

    if (fanProfile.tier !== 0) {
      throw new Error('This endpoint is only for Tier 0 fans');
    }

    await this.claimsService.notifyTier0Claim(fanProfile.id);

    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }
}
