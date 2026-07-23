# ストレージ管理機能 実装完了サマリー

## 実装内容

クリエイターごとのストレージ使用量を追跡し、プラン別の上限を設定する機能を実装しました。

### ストレージ上限
- **Free**: 15GB
- **Lite**: 200GB
- **Business**: 1TB

## 変更ファイル

### 1. スキーマ変更
**`apps/api/src/prisma/schema.prisma`**
- `CreatorProfile` モデル:
  - `storageUsedBytes`: 使用中のストレージ（BigInt）
  - `storageLimitBytes`: カスタム上限（BigInt, nullable）
- `CreatorPlan` モデル:
  - `storageLimitBytes`: プランのデフォルト上限（BigInt）
- `Media` モデル:
  - `fileSize`: ファイルサイズ（BigInt, nullable）

### 2. 新規ファイル
- **`apps/api/src/constants/storage.ts`**: ストレージ定数とユーティリティ関数
- **`apps/api/src/storage/storage.service.ts`**: ストレージ管理サービス
- **`apps/api/src/storage/storage.module.ts`**: ストレージモジュール
- **`apps/api/recalculate-storage.ts`**: 既存データの再計算スクリプト
- **`apps/api/STORAGE_MIGRATION.md`**: マイグレーションガイド
- **`apps/web/app/api/creators/storage/route.ts`**: Web API エンドポイント

### 3. 既存ファイルの更新
- **`apps/api/src/app.module.ts`**: StorageModule をインポート
- **`apps/api/src/creators/creators.module.ts`**: StorageModule をインポート
- **`apps/api/src/creators/creators.controller.ts`**: `/storage` エンドポイント追加
- **`apps/api/src/creators/creators.service.ts`**: `findCreatorByUserId` メソッド追加
- **`apps/api/src/prisma/seed.ts`**: プランに `storageLimitBytes` を追加

## マイグレーション手順

### 1. データベースマイグレーション
```bash
cd apps/api
npx prisma migrate dev --name add_storage_management
```

### 2. Prisma Client 再生成
```bash
npx prisma generate
```

### 3. Seed データ更新
```bash
npx prisma db seed
```

### 4. 既存データの再計算（オプション）
既存のメディアファイルがある場合、ストレージ使用量を再計算:
```bash
cd apps/api
npx ts-node recalculate-storage.ts
```

## API エンドポイント

### GET /api/creators/storage
クリエイターのストレージ使用状況を取得

**Request Headers:**
```
x-user-id: <user-id>
```

**Response:**
```json
{
  "usedBytes": "5368709120",
  "limitBytes": "16106127360",
  "availableBytes": "10737418240",
  "usagePercent": 33.33,
  "usedFormatted": "5.00 GB",
  "limitFormatted": "15.00 GB",
  "availableFormatted": "10.00 GB"
}
```

## StorageService メソッド

### `getStorageLimit(creatorId: string): Promise<bigint>`
クリエイターのストレージ上限を取得（カスタム上限 or プランのデフォルト）

### `getStorageUsage(creatorId: string)`
ストレージ使用状況を取得（使用量、上限、空き容量、使用率など）

### `checkStorageAvailability(creatorId: string, fileSizeBytes: bigint)`
アップロード前にストレージ容量をチェック（不足時は例外をスロー）

### `incrementStorageUsage(creatorId: string, fileSizeBytes: bigint)`
ファイルアップロード後に使用量を増加

### `decrementStorageUsage(creatorId: string, fileSizeBytes: bigint)`
ファイル削除後に使用量を減少

### `recalculateStorageUsage(creatorId: string): Promise<bigint>`
特定クリエイターのストレージ使用量を再計算

### `recalculateAllStorageUsage()`
全クリエイターのストレージ使用量を再計算（メンテナンス用）

## 使用例

### アップロード時の実装例
```typescript
import { StorageService } from './storage/storage.service';

@Injectable()
export class MediaService {
  constructor(private storageService: StorageService) {}

  async uploadMedia(creatorId: string, file: Express.Multer.File) {
    const fileSize = BigInt(file.size);

    // 1. 容量チェック
    await this.storageService.checkStorageAvailability(creatorId, fileSize);

    // 2. ファイルアップロード処理
    const uploadedUrl = await this.uploadToR2(file);

    // 3. DB保存 & ストレージ使用量を増加
    await this.prisma.media.create({
      data: {
        url: uploadedUrl,
        fileSize: fileSize,
        // ...
      },
    });

    await this.storageService.incrementStorageUsage(creatorId, fileSize);

    return uploadedUrl;
  }
}
```

### 削除時の実装例
```typescript
async deleteMedia(mediaId: string) {
  const media = await this.prisma.media.findUnique({
    where: { id: mediaId },
    include: { post: true },
  });

  if (!media) throw new Error('Media not found');

  // 1. ファイル削除処理
  await this.deleteFromR2(media.url);

  // 2. DB削除 & ストレージ使用量を減少
  await this.prisma.media.delete({
    where: { id: mediaId },
  });

  if (media.fileSize) {
    await this.storageService.decrementStorageUsage(
      media.post.creatorId,
      media.fileSize,
    );
  }
}
```

## フロントエンドでの表示例

```typescript
// apps/web/app/creators/[handle]/settings/storage/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function StoragePage() {
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    fetch('/api/creators/storage')
      .then((res) => res.json())
      .then((data) => setStorage(data));
  }, []);

  if (!storage) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>ストレージ使用状況</h1>
      <div>
        <p>使用量: {storage.usedFormatted} / {storage.limitFormatted}</p>
        <progress value={storage.usagePercent} max={100} />
        <p>{storage.usagePercent}% 使用中</p>
        <p>残り: {storage.availableFormatted}</p>
      </div>
    </div>
  );
}
```

## 注意事項
1. 今後のメディアアップロード処理では、必ず `checkStorageAvailability` でチェックし、`incrementStorageUsage` で使用量を更新してください。
2. メディア削除時は `decrementStorageUsage` で使用量を減少させてください。
3. 既存メディアの `fileSize` が `null` の場合、再計算スクリプトを実行することを推奨します。
4. ストレージ使用量は BigInt 型で管理されます（JavaScript では文字列として扱う必要があります）。

## 今後の拡張案
- [ ] ストレージ使用状況のダッシュボード表示
- [ ] ストレージ超過時のアラート通知
- [ ] ファイル種別ごとの使用量集計（画像、動画など）
- [ ] ストレージクリーンアップツール（未使用ファイル削除）
- [ ] プラン変更時のストレージ制限調整
