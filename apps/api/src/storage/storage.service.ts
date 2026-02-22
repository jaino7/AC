import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_LIMITS, formatBytes } from '../constants/storage';
import { CreatorPlanType } from '@prisma/client';

@Injectable()
export class StorageService {
  constructor(private prisma: PrismaService) { }

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
    });

    if (!creator) {
      throw new BadRequestException('Creator not found');
    }

    const limitBytes = await this.getStorageLimit(creatorId);
    const usedBytes = await this.recalculateStorageUsage(creatorId);
    const availableBytes = limitBytes - usedBytes > BigInt(0) ? limitBytes - usedBytes : BigInt(0);
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
    const limitBytes = await this.getStorageLimit(creatorId);
    const usedBytes = await this.recalculateStorageUsage(creatorId);
    const newUsage = usedBytes + fileSizeBytes;

    if (newUsage > limitBytes) {
      const available = limitBytes - usedBytes > BigInt(0) ? limitBytes - usedBytes : BigInt(0);
      throw new BadRequestException(
        `ストレージ容量が不足しています。利用可能容量: ${formatBytes(available)}, 必要容量: ${formatBytes(fileSizeBytes)}`,
      );
    }
  }

  /**
   * ファイルアップロード後にストレージ使用量を増加
   * (動的計算に変更されたため何もしない)
   */
  async incrementStorageUsage(
    creatorId: string,
    fileSizeBytes: bigint,
  ): Promise<void> {
    // dynamically calculated
  }

  /**
   * ファイル削除後にストレージ使用量を減少
   * (動的計算に変更されたため何もしない)
   */
  async decrementStorageUsage(
    creatorId: string,
    fileSizeBytes: bigint,
  ): Promise<void> {
    // dynamically calculated
  }

  /**
   * クリエイターのストレージ使用量を再計算
   */
  async recalculateStorageUsage(creatorId: string): Promise<bigint> {
    const result = await this.prisma.media.aggregate({
      where: {
        post: {
          creatorId: creatorId,
        },
      },
      _sum: {
        size: true,
      },
    });

    return BigInt(result._sum.size || 0);
  }

  /**
   * 全クリエイターのストレージ使用量を再計算
   * （メンテナンス用・動的計算に変更されたため何もしない）
   */
  async recalculateAllStorageUsage(): Promise<void> {
    // dynamically calculated
  }
}

