import { IsNotEmpty, IsString, Matches } from "class-validator";

export class AddDomainDto {
    @IsNotEmpty({ message: "ドメイン名は必須です" })
    @IsString()
    @Matches(
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
        { message: "有効なドメイン名を入力してください" }
    )
    domain!: string;

    @IsNotEmpty({ message: "クリエイターIDは必須です" })
    @IsString()
    creatorId!: string;
}
