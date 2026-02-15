import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common';
import { VirtualAccountService } from './virtual-account.service';
import { CreateVirtualAccountDto } from './dto/virtual-account.dto';
import { BankTransferType } from '@prisma/client';

/**
 * バーチャル口座管理API
 */
@Controller('virtual-accounts')
export class VirtualAccountController {
  private readonly logger = new Logger(VirtualAccountController.name);

  constructor(
    private readonly virtualAccountService: VirtualAccountService,
  ) {}

  /**
   * クリエイター向けバーチャル口座を作成
   *
   * POST /virtual-accounts/creator/:creatorId
   */
  @Post('creator/:creatorId')
  async createCreatorVirtualAccount(@Param('creatorId') creatorId: string) {
    this.logger.log(`Creating virtual account for creator: ${creatorId}`);
    return this.virtualAccountService.createCreatorVirtualAccount(creatorId);
  }

  /**
   * ファン向けバーチャル口座を作成
   *
   * POST /virtual-accounts/fan/:fanId
   */
  @Post('fan/:fanId')
  async createFanVirtualAccount(@Param('fanId') fanId: string) {
    this.logger.log(`Creating virtual account for fan: ${fanId}`);
    return this.virtualAccountService.createFanVirtualAccount(fanId);
  }

  /**
   * バーチャル口座情報を取得
   *
   * GET /virtual-accounts/:accountNumber
   */
  @Get(':accountNumber')
  async getVirtualAccount(@Param('accountNumber') accountNumber: string) {
    return this.virtualAccountService.getVirtualAccount(accountNumber);
  }

  /**
   * クリエイターのバーチャル口座を取得
   *
   * GET /virtual-accounts/creator/:creatorId/account
   */
  @Get('creator/:creatorId/account')
  async getCreatorVirtualAccount(@Param('creatorId') creatorId: string) {
    return this.virtualAccountService.getCreatorVirtualAccount(creatorId);
  }

  /**
   * ファンのバーチャル口座を取得
   *
   * GET /virtual-accounts/fan/:fanId/account
   */
  @Get('fan/:fanId/account')
  async getFanVirtualAccount(@Param('fanId') fanId: string) {
    return this.virtualAccountService.getFanVirtualAccount(fanId);
  }

  /**
   * 振込案内情報を取得
   *
   * GET /virtual-accounts/:accountNumber/transfer-instructions
   */
  @Get(':accountNumber/transfer-instructions')
  async getTransferInstructions(@Param('accountNumber') accountNumber: string) {
    return this.virtualAccountService.getTransferInstructions(accountNumber);
  }

  /**
   * バーチャル口座の取引履歴を取得
   *
   * GET /virtual-accounts/:accountNumber/transactions?from=2026-01-01&to=2026-12-31
   */
  @Get(':accountNumber/transactions')
  async getTransactionHistory(
    @Param('accountNumber') accountNumber: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    return this.virtualAccountService.getTransactionHistory(
      accountNumber,
      fromDate,
      toDate,
    );
  }

  /**
   * バーチャル口座を無効化
   *
   * POST /virtual-accounts/:accountNumber/deactivate
   */
  @Post(':accountNumber/deactivate')
  async deactivateVirtualAccount(@Param('accountNumber') accountNumber: string) {
    await this.virtualAccountService.deactivateVirtualAccount(accountNumber);
    return { success: true, message: 'Virtual account deactivated' };
  }

  /**
   * 全てのバーチャル口座を一覧取得（管理者用）
   *
   * GET /virtual-accounts?purpose=CREATOR_PLAN&isActive=true
   */
  @Get()
  async listVirtualAccounts(
    @Query('purpose') purpose?: BankTransferType,
    @Query('isActive') isActive?: string,
  ) {
    return this.virtualAccountService.listVirtualAccounts({
      purpose,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }
}
