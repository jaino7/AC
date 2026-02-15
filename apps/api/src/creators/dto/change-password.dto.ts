"use strict";

import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: "ユーザーIDが必要です" })
    userId!: string;

    @IsString()
    @IsNotEmpty({ message: "現在のパスワードを入力してください" })
    currentPassword!: string;

    @IsString()
    @MinLength(8, { message: "パスワードは8文字以上で入力してください" })
    newPassword!: string;

    @IsString()
    @IsNotEmpty({ message: "パスワード確認を入力してください" })
    confirmPassword!: string;
}
