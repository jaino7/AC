import {
    BadRequestException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as fs from "fs/promises";
import * as path from "path";
import { randomBytes } from "crypto";

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

@Injectable()
export class BrandAssetsService {
    private readonly uploadDir = path.join(process.cwd(), "uploads", "brand-assets");

    constructor(private readonly prisma: PrismaService) {
        this.ensureUploadDir();
    }

    /**
     * アップロードディレクトリを作成
     */
    private async ensureUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
        } catch (error) {
            console.error("Failed to create upload directory:", error);
        }
    }

    /**
     * ブランドアセットをアップロード
     */
    async uploadAsset(
        creatorId: string,
        type: "logo" | "favicon",
        file: MulterFile
    ) {
        // クリエイタープロフィールの存在確認
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { id: creatorId }
        });

        if (!creator) {
            throw new NotFoundException("クリエイターが見つかりません");
        }

        // ファイル拡張子の検証
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico"];
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            throw new BadRequestException(
                "サポートされていないファイル形式です。JPG、PNG、GIF、SVG、ICOのみアップロード可能です。"
            );
        }

        // ファイルサイズの検証（5MB以下）
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new BadRequestException("ファイルサイズは5MB以下にしてください");
        }

        // ユニークなファイル名を生成
        const filename = `${creatorId}-${type}-${randomBytes(8).toString("hex")}${ext}`;
        const filepath = path.join(this.uploadDir, filename);

        // ファイルを保存
        await fs.writeFile(filepath, file.buffer);

        // 古いファイルを削除
        const oldUrl = type === "logo" ? creator.logoUrl : creator.faviconUrl;
        if (oldUrl) {
            await this.deleteOldFile(oldUrl);
        }

        // データベースを更新
        const assetUrl = `/uploads/brand-assets/${filename}`;
        const updateData = type === "logo"
            ? { logoUrl: assetUrl }
            : { faviconUrl: assetUrl };

        const updated = await this.prisma.creatorProfile.update({
            where: { id: creatorId },
            data: updateData,
            select: {
                id: true,
                logoUrl: true,
                faviconUrl: true
            }
        });

        return {
            type,
            url: assetUrl,
            message: `${type === "logo" ? "ロゴ" : "ファビコン"}をアップロードしました`,
            assets: updated
        };
    }

    /**
     * ブランドアセットを削除
     */
    async deleteAsset(creatorId: string, type: "logo" | "favicon") {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { id: creatorId }
        });

        if (!creator) {
            throw new NotFoundException("クリエイターが見つかりません");
        }

        const assetUrl = type === "logo" ? creator.logoUrl : creator.faviconUrl;

        if (!assetUrl) {
            throw new BadRequestException(`${type === "logo" ? "ロゴ" : "ファビコン"}が設定されていません`);
        }

        // ファイルを削除
        await this.deleteOldFile(assetUrl);

        // データベースを更新
        const updateData = type === "logo"
            ? { logoUrl: null }
            : { faviconUrl: null };

        await this.prisma.creatorProfile.update({
            where: { id: creatorId },
            data: updateData
        });

        return {
            message: `${type === "logo" ? "ロゴ" : "ファビコン"}を削除しました`
        };
    }

    /**
     * クリエイターのブランドアセットを取得
     */
    async getAssets(creatorId: string) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { id: creatorId },
            select: {
                logoUrl: true,
                faviconUrl: true
            }
        });

        if (!creator) {
            throw new NotFoundException("クリエイターが見つかりません");
        }

        return creator;
    }

    /**
     * 古いファイルを削除
     */
    private async deleteOldFile(url: string) {
        try {
            const filename = path.basename(url);
            const filepath = path.join(this.uploadDir, filename);
            await fs.unlink(filepath);
        } catch (error) {
            console.error("Failed to delete old file:", error);
            // エラーが発生してもスキップ（ファイルが既に存在しない場合など）
        }
    }
}
