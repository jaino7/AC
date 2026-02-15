import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Param,
  UnauthorizedException,
  NotFoundException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { BankTransfersService } from './bank-transfers.service';
import { GmoApiService } from './gmo-api.service';
import { GmoWebhookDto } from './dto/gmo-webhook.dto';
import { AutomationWebhookDto } from './dto/automation-webhook.dto';
import { ConfigService } from '@nestjs/config';
import { BankTransferType } from '@prisma/client';

@Controller('webhooks')
export class BankTransfersController {
  private readonly logger = new Logger(BankTransfersController.name);

  constructor(
    private readonly bankTransfersService: BankTransfersService,
    private readonly gmoApiService: GmoApiService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * GMOあおぞらネット銀行からのWebhookを受信
   *
   * Endpoint: POST /webhooks/gmo/bank-transfer
   *
   * セキュリティ:
   * - 署名検証（X-GMO-Signatureヘッダー）
   * - IPアドレス制限（オプション）
   */
  @Post('gmo/bank-transfer')
  @HttpCode(200)
  async handleBankTransferWebhook(
    @Body() payload: GmoWebhookDto,
    @Headers('x-gmo-signature') signature: string,
  ) {
    this.logger.log('Received GMO webhook');

    // 1. 署名検証
    const webhookSecret = this.configService.get<string>('GMO_WEBHOOK_SECRET') || '';

    if (!signature) {
      throw new UnauthorizedException('Missing signature header');
    }

    const isValid = this.gmoApiService.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
      webhookSecret,
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new UnauthorizedException('Invalid signature');
    }

    // 2. Webhookを処理
    try {
      const result = await this.bankTransfersService.processGmoWebhook(payload);

      return {
        success: true,
        transactionId: result.id,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to process webhook', (error as any).stack);

      // GMOには200を返して再送を防ぐ（エラーは内部で記録）
      return {
        success: false,
        error: (error as any).message,
      };
    }
  }

  /**
   * Webhook接続テスト用エンドポイント（開発環境のみ）
   */
  @Post('gmo/test')
  @HttpCode(200)
  async testWebhook(@Body() payload: GmoWebhookDto) {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new UnauthorizedException('Test endpoint not available in production');
    }

    this.logger.log('Test webhook received');

    const result = await this.bankTransfersService.processGmoWebhook(payload);

    return {
      success: true,
      result,
    };
  }

  /**
   * Make/Zapier からのWebhookを受信
   *
   * Endpoint: POST /webhooks/automation/bank-transfer
   */
  @Post('automation/bank-transfer')
  @HttpCode(200)
  async handleAutomationWebhook(
    @Body() payload: AutomationWebhookDto,
    @Headers('x-webhook-secret') secret: string,
  ) {
    this.logger.log('Received automation webhook');

    // シークレット認証
    const expectedSecret = this.configService.get<string>('AUTOMATION_WEBHOOK_SECRET');

    if (!secret || !expectedSecret) {
      this.logger.warn('Missing webhook secret configuration');
      throw new UnauthorizedException('Webhook secret not configured');
    }

    if (secret !== expectedSecret) {
      this.logger.warn('Invalid webhook secret');
      throw new UnauthorizedException('Invalid webhook secret');
    }

    // Webhookを処理
    try {
      const result = await this.bankTransfersService.processAutomationWebhook(payload);

      return {
        success: true,
        transactionId: result.id,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to process automation webhook', (error as any).stack);

      // 常にHTTP 200を返す（再送を防ぐ）
      return {
        success: false,
        error: (error as any).message,
      };
    }
  }

  /**
   * 決済IDに紐付くバーチャル口座情報を取得
   *
   * Endpoint: GET /api/payments/:paymentId/virtual-account
   *
   * 用途: フロントエンドで口座番号を表示するため
   */
  @Get('payments/:paymentId/virtual-account')
  async getVirtualAccountForPayment(@Param('paymentId') paymentId: string) {
    const virtualAccount = await this.bankTransfersService.getVirtualAccountByPaymentId(
      paymentId,
    );

    if (!virtualAccount) {
      throw new NotFoundException(
        `No virtual account found for payment: ${paymentId}`,
      );
    }

    return {
      accountNumber: virtualAccount.accountNumber,
      accountName: virtualAccount.accountName,
      branchCode: virtualAccount.branchCode,
      purpose: virtualAccount.purpose,
      assignedAt: virtualAccount.assignedAt,
    };
  }

  /**
   * バーチャル口座の在庫状況を取得（管理者用）
   *
   * Endpoint: GET /api/virtual-accounts/inventory
   */
  @Get('virtual-accounts/inventory')
  async getInventoryStatus() {
    return this.bankTransfersService.getInventoryStatus();
  }

  /**
   * 期限切れのChargeRequestに紐付く口座を解放（管理者/Cron用）
   *
   * Endpoint: POST /api/virtual-accounts/release-expired
   */
  @Post('virtual-accounts/release-expired')
  @HttpCode(200)
  async releaseExpiredAccounts() {
    const releasedCount = await this.bankTransfersService.releaseExpiredChargeRequests();

    return {
      success: true,
      releasedCount,
      message: `Released ${releasedCount} virtual accounts`,
    };
  }
}
