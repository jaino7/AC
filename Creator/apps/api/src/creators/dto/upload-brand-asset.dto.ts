import { IsNotEmpty, IsString } from "class-validator";

export class UploadBrandAssetDto {
    @IsNotEmpty({ message: "アセットタイプは必須です" })
    @IsString()
    type!: "logo" | "favicon";

    @IsNotEmpty({ message: "クリエイターIDは必須です" })
    @IsString()
    creatorId!: string;
}
