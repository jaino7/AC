import { IsInt, IsString, Min } from 'class-validator';

export class CreateChargeDto {
  @IsInt()
  @Min(1)
  amount!: number; // 金額（円）

  @IsString()
  creatorId!: string; // 応援先のクリエイターID
}
