import {
    Controller,
    Delete,
    Get,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
    BadRequestException
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { BrandAssetsService } from "./brand-assets.service";

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

@Controller("creators/brand-assets")
export class BrandAssetsController {
    constructor(private readonly brandAssetsService: BrandAssetsService) { }

    /**
     * ブランドアセットをアップロード
     * POST /creators/brand-assets/upload?creatorId=xxx&type=logo
     */
    @Post("upload")
    @UseInterceptors(FileInterceptor("file"))
    async uploadAsset(
        @UploadedFile() file: MulterFile,
        @Query("creatorId") creatorId: string,
        @Query("type") type: "logo" | "favicon"
    ) {
        if (!file) {
            throw new BadRequestException("ファイルが選択されていません");
        }

        if (!creatorId || !type) {
            throw new BadRequestException("クリエイターIDとタイプは必須です");
        }

        if (type !== "logo" && type !== "favicon") {
            throw new BadRequestException("タイプはlogoまたはfaviconである必要があります");
        }

        return this.brandAssetsService.uploadAsset(creatorId, type, file);
    }

    /**
     * ブランドアセットを取得
     * GET /creators/brand-assets?creatorId=xxx
     */
    @Get()
    async getAssets(@Query("creatorId") creatorId: string) {
        if (!creatorId) {
            throw new BadRequestException("クリエイターIDは必須です");
        }

        return this.brandAssetsService.getAssets(creatorId);
    }

    /**
     * ブランドアセットを削除
     * DELETE /creators/brand-assets?creatorId=xxx&type=logo
     */
    @Delete()
    async deleteAsset(
        @Query("creatorId") creatorId: string,
        @Query("type") type: "logo" | "favicon"
    ) {
        if (!creatorId || !type) {
            throw new BadRequestException("クリエイターIDとタイプは必須です");
        }

        if (type !== "logo" && type !== "favicon") {
            throw new BadRequestException("タイプはlogoまたはfaviconである必要があります");
        }

        return this.brandAssetsService.deleteAsset(creatorId, type);
    }
}
