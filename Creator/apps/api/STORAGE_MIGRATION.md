# ストレージ管理機能 マイグレーションガイド

## 概要
クリエイターごとのストレージ使用量を追跡し、プラン別の上限を設定する機能を追加しました。

## ストレージ上限
- **Free**: 15GB
- **Lite**: 200GB
- **Business**: 1TB

## マイグレーション手順

### 1. Prisma スキーマの同期
```bash
cd apps/api
npx prisma migrate dev --name add_storage_management
```

### 2. Prisma Client の再生成
```bash
npx prisma generate
```

### 3. Seed データの更新（プランにストレージ上限を追加）
```bash
npx prisma db seed
```

### 4. 既存メディアのストレージ使用量を計算（オプション）
既存のクリエイターのストレージ使用量を再計算する場合、以下のスクリプトを実行:

```typescript
// apps/api/recalculate-storage.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creatorProfile.findMany({
    select: { id: true, displayName: true },
  });

  console.log(`🔄 ${creators.length} 人のクリエイターのストレージを再計算します...`);

  for (const creator of creators) {
    const media = await prisma.media.findMany({
      where: {
        post: {
          creatorId: creator.id,
        },
      },
      select: {
        fileSize: true,
      },
    });

    const totalBytes = media.reduce((sum, m) => {
      return sum + (m.fileSize || BigInt(0));
    }, BigInt(0));

    await prisma.creatorProfile.update({
      where: { id: creator.id },
      data: {
        storageUsedBytes: totalBytes,
      },
    });

    console.log(`✅ ${creator.displayName}: ${Number(totalBytes) / (1024 * 1024 * 1024)} GB`);
  }

  console.log('✅ 完了しました！');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

実行:
```bash
npx ts-node recalculate-storage.ts
```

## API 使用例

### ストレージ使用状況の取得
```typescript
import { StorageService } from './storage/storage.service';

// コンストラクタで注入
constructor(private storageService: StorageService) {}

// 使用状況を取得
const usage = await this.storageService.getStorageUsage(creatorId);
console.log(usage);
// {
//   usedBytes: "5368709120",
//   limitBytes: "16106127360",
//   availableBytes: "10737418240",
//   usagePercent: 33.33,
//   usedFormatted: "5.00 GB",
//   limitFormatted: "15.00 GB",
//   availableFormatted: "10.00 GB"
// }
```

### アップロード前の容量チェック
```typescript
const fileSize = BigInt(1024 * 1024 * 100); // 100MB

try {
  await this.storageService.checkStorageAvailability(creatorId, fileSize);
  // アップロード処理
  await this.storageService.incrementStorageUsage(creatorId, fileSize);
} catch (error) {
  // ストレージ不足エラー
  throw error;
}
```

### ファイル削除時の使用量減少
```typescript
const fileSize = BigInt(mediaRecord.fileSize);
await this.storageService.decrementStorageUsage(creatorId, fileSize);
```

## 注意事項
- `Media` テーブルに `fileSize` フィールドが追加されました。今後のアップロード時にファイルサイズを記録してください。
- 既存のメディアは `fileSize` が `null` の可能性があるため、再計算スクリプトを実行することを推奨します。
- ストレージ使用量は BigInt 型で管理されます（PostgreSQL の BIGINT に対応）。
