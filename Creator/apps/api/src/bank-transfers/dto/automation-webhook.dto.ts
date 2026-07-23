import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class AutomationWebhookDto {
  @IsString()
  accountNumber!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  transferorName!: string;

  @IsDateString()
  transferDate!: string;

  @IsString()
  @IsOptional()
  branchCode?: string;

  @IsString()
  @IsOptional()
  memo?: string;
}
