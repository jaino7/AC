import { IsString, IsEnum, IsOptional } from 'class-validator';
import { BankTransferType } from '@prisma/client';

/**
 * バーチャル口座作成リクエスト
 */
export class CreateVirtualAccountDto {
  @IsString()
  userId!: string; // クリエイターIDまたはファンID

  @IsEnum(BankTransferType)
  purpose!: BankTransferType; // CREATOR_PLAN or FAN_CREDIT

  @IsString()
  accountName!: string; // 口座名義

  @IsString()
  @IsOptional()
  memo?: string; // メモ（管理用）
}

/**
 * GMO API バーチャル口座作成レスポンス
 */
export interface GmoVirtualAccountResponse {
  accountId: string; // GMOのアカウントID
  accountNumber: string; // バーチャル口座番号
  branchCode: string; // 支店コード
  accountName: string; // 口座名義
  bankName: string; // 銀行名
  bankCode: string; // 銀行コード
}

/**
 * バーチャル口座照会レスポンス
 */
export interface VirtualAccountBalanceResponse {
  accountNumber: string;
  balance: number;
  lastTransactionDate?: Date;
}
