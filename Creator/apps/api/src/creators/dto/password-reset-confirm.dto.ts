import { IsString, MinLength, Matches } from 'class-validator';

export class PasswordResetConfirmDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[a-zA-Z]/, { message: 'パスワードには英字を含めてください' })
  @Matches(/\d/, { message: 'パスワードには数字を含めてください' })
  newPassword!: string;

  @IsString()
  confirmPassword!: string;
}
