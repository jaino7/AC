"use strict";

import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateProfileDto {
    @IsString()
    @IsNotEmpty({ message: "ユーザーIDが必要です" })
    userId!: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsOptional()
    name?: string;
}
