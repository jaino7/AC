/**
 * ストレージ管理定数
 */

import { CreatorPlanType } from '@prisma/client';

// プラン別ストレージ上限（バイト単位）
export const STORAGE_LIMITS: Record<CreatorPlanType, bigint> = {
  FREE: BigInt(15 * 1024 * 1024 * 1024), // 15GB
  LITE: BigInt(200 * 1024 * 1024 * 1024), // 200GB
  BUSINESS: BigInt(1024 * 1024 * 1024 * 1024), // 1TB (1024GB)
};

// 表示用のストレージ上限（文字列）
export const STORAGE_LIMITS_DISPLAY: Record<CreatorPlanType, string> = {
  FREE: '15GB',
  LITE: '200GB',
  BUSINESS: '1TB',
};

/**
 * バイトを人間が読みやすい形式に変換
 */
export function formatBytes(bytes: bigint | number): string {
  const b = typeof bytes === 'bigint' ? Number(bytes) : bytes;

  if (b === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));

  return `${(b / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * ストレージ使用率を計算（パーセント）
 */
export function calculateStorageUsage(
  usedBytes: bigint,
  limitBytes: bigint,
): number {
  if (limitBytes === BigInt(0)) return 0;
  return Number((usedBytes * BigInt(100)) / limitBytes);
}
