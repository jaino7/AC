# Cron Job Implementation

## Overview

自動化された定期タスクを実装しました。期限切れのChargeRequestとCreatorSubscriptionを監視し、適切に処理します。

## 実装内容

### 1. Cron Job Service

**ファイル:** `apps/api/src/bank-transfers/cron.service.ts`

#### タスク1: 期限切れChargeRequestの処理

**実行頻度:** 1時間ごと

**ロジック:**
1. ChargeRequestの作成から24時間が経過し、かつステータスがPENDINGのものを検索
2. 対象のChargeRequestをEXPIREDステータスに更新
3. 紐付いているVirtualAccountのisUsedフラグをfalseに戻し、プールへ返却
4. 実行結果をCronLogテーブルに記録

**実装コード:**
```typescript
@Cron(CronExpression.EVERY_HOUR)
async handleExpiredChargeRequests() {
  // 24時間前のカットオフタイム
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 期限切れのChargeRequestを検索
  const expiredRequests = await this.prisma.chargeRequest.findMany({
    where: {
      status: ChargeRequestStatus.PENDING,
      createdAt: { lt: cutoffTime },
    },
  });

  // 各ChargeRequestを処理
  for (const request of expiredRequests) {
    // EXPIREDに更新
    await this.prisma.chargeRequest.update({
      where: { id: request.id },
      data: { status: ChargeRequestStatus.EXPIRED },
    });

    // VirtualAccountを解放
    await this.bankTransfersService.releaseVirtualAccount(request.id);
  }
}
```

#### タスク2: 期限切れCreatorSubscriptionの監視

**実行頻度:** 1時間ごと

**ロジック:**
1. CreatorSubscriptionのendDateをチェック
2. 期限を過ぎている場合はstatusをEXPIREDに変更
3. 実行結果をCronLogテーブルに記録

**実装コード:**
```typescript
@Cron(CronExpression.EVERY_HOUR)
async handleExpiredSubscriptions() {
  const now = new Date();

  // 期限切れのサブスクリプションを検索
  const expiredSubscriptions = await this.prisma.creatorSubscription.findMany({
    where: {
      status: CreatorSubscriptionStatus.ACTIVE,
      endDate: { lt: now },
    },
  });

  // 各サブスクリプションを処理
  for (const subscription of expiredSubscriptions) {
    // EXPIREDに更新
    await this.prisma.creatorSubscription.update({
      where: { id: subscription.id },
      data: { status: CreatorSubscriptionStatus.EXPIRED },
    });
  }
}
```

### 2. Cron Log Model

**ファイル:** `prisma/schema.prisma`

実行履歴を記録するためのモデル:

```prisma
model CronLog {
  id               String   @id @default(cuid())
  taskName         String   // タスク名
  status           String   // SUCCESS or FAILED
  recordsProcessed Int      // 処理したレコード数
  message          String   @db.Text // 実行結果メッセージ
  durationMs       Int      // 実行時間（ミリ秒）
  executedAt       DateTime // 実行日時

  @@index([taskName])
  @@index([executedAt])
  @@index([status])
}
```

### 3. Admin API

**ファイル:** `apps/api/src/bank-transfers/admin.controller.ts`

管理者がCron Job実行履歴を確認できるAPIエンドポイント:

#### GET /api/admin/cron-logs

Cron Job実行履歴を取得

**クエリパラメータ:**
- `taskName`: タスク名でフィルター（オプション）
- `status`: ステータスでフィルター（SUCCESS/FAILED）（オプション）
- `limit`: 取得件数（デフォルト: 100、最大: 1000）
- `offset`: スキップ件数（デフォルト: 0）

**レスポンス例:**
```json
{
  "logs": [
    {
      "id": "cml35joeg0003vjvcw3zo0wp6",
      "taskName": "expire_charge_requests",
      "status": "SUCCESS",
      "recordsProcessed": 5,
      "message": "Expired 5 charge requests, released 5 virtual accounts",
      "durationMs": 234,
      "executedAt": "2026-02-04T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

#### GET /api/admin/cron-logs/stats

Cron Job統計情報を取得

**レスポンス例:**
```json
{
  "stats": [
    {
      "taskName": "expire_charge_requests",
      "totalExecutions": 24,
      "successful": 24,
      "failed": 0,
      "successRate": 100,
      "avgDurationMs": 245.5,
      "lastExecution": {
        "executedAt": "2026-02-04T12:00:00.000Z",
        "status": "SUCCESS",
        "recordsProcessed": 5
      }
    },
    {
      "taskName": "expire_subscriptions",
      "totalExecutions": 24,
      "successful": 23,
      "failed": 1,
      "successRate": 95.83,
      "avgDurationMs": 156.2,
      "lastExecution": {
        "executedAt": "2026-02-04T12:00:00.000Z",
        "status": "SUCCESS",
        "recordsProcessed": 2
      }
    }
  ]
}
```

## セットアップ手順

### 1. Prismaマイグレーションの実行

```bash
# マイグレーションファイルを作成
npx prisma migrate dev --name add_cron_log_model --schema=./apps/api/src/prisma/schema.prisma

# Prisma Clientを再生成
npx prisma generate --schema=./apps/api/src/prisma/schema.prisma
```

### 2. 依存関係の確認

`@nestjs/schedule` がインストールされているか確認:

```bash
cd apps/api
npm list @nestjs/schedule
```

インストールされていない場合:

```bash
npm install @nestjs/schedule
```

### 3. アプリケーションの起動

```bash
cd apps/api
npm run start:dev
```

起動ログでCron Jobが登録されたことを確認:

```
[Nest] INFO [SchedulerRegistry] Jobs scheduled:
  - handleExpiredChargeRequests (every hour)
  - handleExpiredSubscriptions (every hour)
```

## 動作確認

### 1. ログの確認

アプリケーションログでCron Jobの実行を確認:

```
[CronService] Starting expired charge requests cleanup...
[CronService] Found 5 expired charge requests
[CronService] Released virtual account for expired ChargeRequest: xxx (Amount: ¥10000)
[CronService] Expired charge requests cleanup completed: 5 expired, 5 virtual accounts released (234ms)
```

### 2. Admin APIでの確認

```bash
# 実行履歴を取得
curl http://localhost:3001/api/admin/cron-logs

# 統計情報を取得
curl http://localhost:3001/api/admin/cron-logs/stats
```

### 3. データベースで直接確認

```sql
-- 最新のCron Log実行履歴
SELECT * FROM "CronLog" ORDER BY "executedAt" DESC LIMIT 10;

-- タスクごとの成功率
SELECT
  "taskName",
  COUNT(*) as total,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful,
  ROUND(AVG("durationMs"), 2) as avg_duration_ms
FROM "CronLog"
GROUP BY "taskName";
```

## ログ出力例

### 成功時

```
[CronService] Starting expired charge requests cleanup...
[CronService] Found 3 expired charge requests
[CronService] Released virtual account for expired ChargeRequest: cml35joeg0003vjvcw3zo0wp6 (Amount: ¥5000)
[CronService] Released virtual account for expired ChargeRequest: cml35joeg0004vjvcw3zo0wp7 (Amount: ¥10000)
[CronService] Released virtual account for expired ChargeRequest: cml35joeg0005vjvcw3zo0wp8 (Amount: ¥20000)
[CronService] Expired charge requests cleanup completed: 3 expired, 3 virtual accounts released (187ms)

[CronService] Starting expired subscriptions monitoring...
[CronService] Found 1 expired subscriptions
[CronService] Expired subscription: cml35joeg0006vjvcw3zo0wp9 (Creator: test-creator, Plan: Lite, EndDate: 2026-02-03T12:00:00.000Z)
[CronService] Expired subscriptions monitoring completed: 1 subscriptions expired (95ms)
```

### エラー時

```
[CronService] Starting expired charge requests cleanup...
[CronService] Failed to process expired ChargeRequest: cml35joeg0003vjvcw3zo0wp6
[CronService] Error: Virtual account not found
[CronService] Expired charge requests cleanup failed: Virtual account not found
```

## Cron スケジュールのカスタマイズ

`cron.service.ts` で実行頻度を変更できます:

```typescript
// 毎時0分に実行
@Cron('0 * * * *')

// 毎日午前2時に実行
@Cron('0 2 * * *')

// 15分ごとに実行
@Cron('*/15 * * * *')

// NestJS提供の定数を使用
@Cron(CronExpression.EVERY_HOUR)        // 毎時
@Cron(CronExpression.EVERY_DAY_AT_2AM)  // 毎日午前2時
@Cron(CronExpression.EVERY_30_MINUTES)  // 30分ごと
```

## トラブルシューティング

### Cron Jobが実行されない

**原因:** ScheduleModule が AppModule にインポートされていない

**解決策:**
```typescript
// apps/api/src/app.module.ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(), // これを追加
    // ...
  ],
})
export class AppModule {}
```

### CronLog が保存されない

**原因:** Prismaマイグレーションが実行されていない

**解決策:**
```bash
npx prisma migrate deploy --schema=./apps/api/src/prisma/schema.prisma
```

### 処理時間が長すぎる

**原因:** 大量のレコードを処理している

**解決策:** バッチサイズを制限して処理する

```typescript
const BATCH_SIZE = 100;
const expiredRequests = await this.prisma.chargeRequest.findMany({
  where: { /* ... */ },
  take: BATCH_SIZE,
});
```

## 今後の拡張

### 1. メール通知

サブスクリプション期限切れ時にクリエイターへメール通知:

```typescript
// TODO: Send email notification to creator about subscription expiration
await this.mailService.sendSubscriptionExpiryEmail(
  creator.user.email,
  {
    creatorName: creator.displayName,
    planName: subscription.plan.name,
    endDate: subscription.endDate,
  }
);
```

### 2. Slack通知

エラー発生時に管理者へSlack通知:

```typescript
if (failedCount > threshold) {
  await this.slackService.sendAlert({
    channel: '#system-alerts',
    message: `Cron job failed: ${failedCount} errors`,
  });
}
```

### 3. メトリクス収集

処理時間や成功率をPrometheusなどで監視:

```typescript
this.metricsService.recordCronExecution({
  taskName: 'expire_charge_requests',
  durationMs: duration,
  status: 'success',
});
```

## 関連ドキュメント

- [NestJS Scheduling](https://docs.nestjs.com/techniques/task-scheduling)
- [Virtual Account Payment Flow](./VIRTUAL_ACCOUNT_PAYMENT_FLOW.md)
- [Bank Transfers Service](./apps/api/src/bank-transfers/bank-transfers.service.ts)
