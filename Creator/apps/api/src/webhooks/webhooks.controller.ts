import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { BankDepositDto } from './dto/bank-deposit.dto';
import { ConfigService } from '@nestjs/config';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>(
      'AUTOMATION_WEBHOOK_SECRET',
      'default-secret-change-in-production',
    );
  }

  /**
   * Make連携: 銀行入金Webhook
   * POST /api/webhooks/bank-deposit
   *
   * @param headers - リクエストヘッダー（認証用）
   * @param depositData - 入金データ
   */
  @Post('bank-deposit')
  async handleBankDeposit(
    @Headers('x-webhook-secret') secret: string,
    @Body() depositData: BankDepositDto,
  ) {
    this.logger.log(
      `Received bank deposit webhook: ${depositData.accountNumber}`,
    );

    // Webhook認証
    if (secret !== this.webhookSecret) {
      this.logger.warn('Unauthorized webhook request: Invalid secret');
      throw new UnauthorizedException('Invalid webhook secret');
    }

    // 入金処理
    const result = await this.webhooksService.processBankDeposit(depositData);

    return {
      success: true,
      message: 'Bank deposit processed successfully',
      data: result,
    };
  }
}
