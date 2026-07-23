import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class BankDepositDto {
  @IsString()
  @IsNotEmpty()
  accountNumber!: string; // 口座番号

  @IsNumber()
  @Min(1)
  amount!: number; // 入金額

  @IsString()
  @IsNotEmpty()
  transferorName!: string; // 振込人名義

  @IsString()
  transferDate!: string; // 入金日時 (ISO 8601形式)

  @IsString()
  transactionId?: string; // 取引ID（オプション）
}
