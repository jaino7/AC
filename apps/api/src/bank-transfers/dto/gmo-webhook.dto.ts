import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

/**
 * GMOあおぞらネット銀行 Webhook ペイロード
 *
 * 注: 実際のGMO APIドキュメントに基づいて調整が必要
 * 以下は一般的な銀行振込通知の形式を想定したサンプル
 */
export class GmoWebhookDto {
  @IsString()
  transactionId!: string; // GMOの取引ID

  @IsString()
  accountNumber!: string; // バーチャル口座番号

  @IsNumber()
  amount!: number; // 振込金額（円）

  @IsString()
  transferorName!: string; // 振込人名義

  @IsDateString()
  transferDate!: string; // 振込日時（ISO 8601形式）

  @IsString()
  @IsOptional()
  branchCode?: string; // 支店コード

  @IsString()
  @IsOptional()
  transactionType?: string; // 取引種別

  @IsString()
  @IsOptional()
  memo?: string; // 備考
}

/**
 * Webhook検証用のヘッダー
 */
export class GmoWebhookHeadersDto {
  @IsString()
  signature!: string; // GMOの署名（HMAC等）

  @IsString()
  @IsOptional()
  timestamp?: string; // タイムスタンプ
}
