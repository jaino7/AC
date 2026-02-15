import { Controller, Post, Body, UseGuards, Request, Headers, UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { CreatorPlanType } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/payments/charge
   * ChargeRequestを作成し、バーチャル口座を割り当て
   */
  @Post('charge')
  async createChargeRequest(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateChargeDto,
  ) {
    // X-User-Id ヘッダーからユーザーIDを取得
    if (!userId) {
      throw new UnauthorizedException('User ID is required in X-User-Id header');
    }

    return this.paymentsService.createChargeRequest(userId, dto);
  }

  /**
   * POST /api/payments/creator-plan
   * クリエイタープラン購入リクエストを作成し、バーチャル口座を割り当て
   */
  @Post('creator-plan')
  async createCreatorPlanPurchase(
    @Headers('x-creator-id') creatorId: string,
    @Body() dto: { planType: CreatorPlanType; isYearly: boolean },
  ) {
    // X-Creator-Id ヘッダーからクリエイターIDを取得
    if (!creatorId) {
      throw new UnauthorizedException('Creator ID is required in X-Creator-Id header');
    }

    return this.paymentsService.createCreatorPlanPurchase(
      creatorId,
      dto.planType,
      dto.isYearly,
    );
  }
}
