import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_LIMITS, formatBytes } from '../constants/storage';
import { CreatorPlanType } from '@prisma/client';

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) {}

  /**
   * クリエイターのストレージ上限を取得
   */
  async getStorageLimit(creatorId: string): Promise<bigint> {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: {
        creatorSubscription: {
          include: { plan: true },
        },
      },
    });

    if (!creator) {
      throw new BadRequestException('Creator not found');
    }

    // カスタム上限が設定されている場合はそれを使用
    if (creator.storageLimitBytes !== null) {
      return creator.storageLimitBytes;
    }

    // プランに基づいた上限を返す
    const planType =
      creator.creatorSubscription?.plan?.type || CreatorPlanType.FREE;
    return STORAGE_LIMITS[planType];
  }

  /**
   * ストレージ使用状況を取得
   */
  async getStorageUsage(creatorId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      select: {
        storageUsedBytes: true,
        storageLimitBytes: true,
      },
    });

    if (!creator) {
      throw new BadRequestException('Creator not found');
    }

    const limitBytes = await this.getStorageLimit(creatorId);
    const usedBytes = creator.storageUsedBytes;
    const availableBytes = limitBytes - usedBytes;
    const usagePercent =
      limitBytes > BigInt(0)
        ? Number((usedBytes * BigInt(100)) / limitBytes)
        : 0;

    return {
      usedBytes: usedBytes.toString(),
      limitBytes: limitBytes.toString(),
      availableBytes: availableBytes.toString(),
      usagePercent: Math.round(usagePercent * 100) / 100,
      usedFormatted: formatBytes(usedBytes),
      limitFormatted: formatBytes(limitBytes),
      availableFormatted: formatBytes(availableBytes),
    };
  }

  /**
   * アップロード前にストレージ容量をチェック
   */
  async checkStorageAvailability(
    creatorId: string,
    fileSizeBytes: bigint,
  ): Promise<void> {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      select: { storageUsedBytes: true },
    });

    if (!creator) {
      throw new BadRequestException('Creator not found');
    }

    const limitBytes = await this.getStorageLimit(creatorId);
    const newUsage = creator.storageUsedBytes + fileSizeBytes;

    if (newUsage > limitBytes) {
      const available = limitBytes - creator.storageUsedBytes;
      throw new BadRequestException(
        `ストレージ容量が不足しています。利用可能容量: ${formatBytes(available)}, 必要容量: ${formatBytes(fileSizeBytes)}`,
      );
    }
  }

  /**
   * ファイルアップロード後にストレージ使用量を増加
   */
  async incrementStorageUsage(
    creatorId: string,
    fileSizeBytes: bigint,
  ): Promise<void> {
    await this.prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        storageUsedBytes: {
          increment: fileSizeBytes,
        },
      },
    });
  }

  /**
   * ファイル削除後にストレージ使用量を減少
   */
  async decrementStorageUsage(
    creatorId: string,
    fileSizeBytes: bigint,
  ): Promise<void> {
    await this.prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        storageUsedBytes: {
          decrement: fileSizeBytes,
        },
      },
    });
  }

  /**
   * クリエイターのストレージ使用量を再計算
   * （Media テーブルの fileSize を合計）
   */
  async recalculateStorageUsage(creatorId: string): Promise<bigint> {
    // クリエイターの全メディアを取得
    const media = await this.prisma.media.findMany({
      where: {
        post: {
          creatorId: creatorId,
        },
      },
      select: {
        fileSize: true,
      },
    });

    // 合計を計算
    const totalBytes = media.reduce((sum, m) => {
      return sum + (m.fileSize || BigInt(0));
    }, BigInt(0));

    // CreatorProfile を更新
    await this.prisma.creatorProfile.update({
      where: { id: creatorId },
      data: {
        storageUsedBytes: totalBytes,
      },
    });

    return totalBytes;
  }

  /**
   * 全クリエイターのストレージ使用量を再計算
   * （メンテナンス用）
   */
  async recalculateAllStorageUsage(): Promise<void> {
    const creators = await this.prisma.creatorProfile.findMany({
      select: { id: true },
    });

    for (const creator of creators) {
      await this.recalculateStorageUsage(creator.id);
    }
  }
}
