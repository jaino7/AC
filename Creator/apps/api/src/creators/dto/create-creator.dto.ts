import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength
} from "class-validator";

export class CreateCreatorDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/[a-zA-Z]/, { message: "パスワードには英字を含めてください" })
  @Matches(/\d/, { message: "パスワードには数字を含めてください" })
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;

  @IsBoolean()
  acceptTerms!: boolean;

  @IsBoolean()
  confirmAdult!: boolean;
}
