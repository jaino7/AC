# Virtual Account Optimization

## Overview

バーチャル口座のリソース最適化を実装しました。オンデマンド割り当て、自動回収、冷却期間管理により、口座リソースを効率的に運用します。

## 実装内容

### 1. データベース拡張

#### VirtualAccount モデル

`releasedAt` フィールドを追加して、冷却期間を管理します。

```prisma
model VirtualAccount {
  // ... existing fields ...

  assignedToPaymentId String? // CreatorSubscription.id または ChargeRequest.id
  isUsed              Boolean  @default(false)
  assignedAt          DateTime?
  releasedAt          DateTime? // 解放日時（冷却期間管理用）

  // ...
}
```

**マイグレーション:**
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx prisma generate --schema=./prisma/schema.prisma
```

### 2. オンデマンド割り当てロジック

#### クリエイター向け固定口座

**実装場所:** `apps/api/src/bank-transfers/bank-transfers.service.ts`

**ロジック:**
1. **無料プラン（FREE）:** 口座は割り当てない
2. **Lite/Business選択時:** 固定口座を1つ割り当て（`creatorId`に紐付け）
3. **既存口座の再利用:** 既に固定口座がある場合は再利用
4. **割り当て優先順位:**
   - `isUsed: false` かつ `creatorId: null`
   - `releasedAt` が null または 30日以上前
   - 冷却期間中のものしかない場合は、最近解放されたものから使用

```typescript
async assignVirtualAccount(
  paymentId: string,
  purpose: BankTransferType,
  creatorId?: string,
) {
  if (purpose === BankTransferType.CREATOR_PLAN && creatorId) {
    // 1. 既存の固定口座をチェック
    const existingAccount = await findExistingFixedAccount(creatorId);

    if (existingAccount) {
      return existingAccount; // 再利用
    }

    // 2. 新しい固定口座を割り当て
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const availableAccount = await findFirst({
      where: {
        isUsed: false,
        isActive: true,
        purpose: CREATOR_PLAN,
        creatorId: null,
        OR: [
          { releasedAt: null },
          { releasedAt: { lt: thirtyDaysAgo } }, // 30日以上前
        ],
      },
      orderBy: [
        { releasedAt: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // 固定割り当て
    await update({
      where: { id: availableAccount.id },
      data: {
        creatorId,
        releasedAt: null, // 冷却期間クリア
      },
    });
  }

  // ファンクレジットは既存のロジック
}
```

#### 冷却期間（30日）

解放された口座は30日間の冷却期間を経てから再割り当て可能になります。これにより：
- 誤って複数のクリエイターに同じ口座番号が表示される問題を防止
- 振込の混乱を防止

### 3. 口座回収（自動クリーンアップ）

#### 実装場所

`apps/api/src/bank-transfers/cron.service.ts`

#### 実行スケジュール

毎日午前3時に実行

```typescript
@Cron('0 3 * * *') // Daily at 3 AM
async handleVirtualAccountReclamation() {
  // ...
}
```

#### 回収条件

以下の条件をすべて満たす場合に口座を回収：

1. クリエイターのプランが `FREE`
2. `billingBalance` が 0円
3. 最後の入金またはプラン変更から 90日以上経過

#### 回収処理

```typescript
await prisma.virtualAccount.update({
  where: { id: account.id },
  data: {
    isUsed: false,
    creatorId: null,        // 固定割り当て解除
    assignedToPaymentId: null,
    assignedAt: null,
    releasedAt: new Date(), // 冷却期間開始
  },
});
```

#### 警告通知

83日目（回収7日前）に警告メールを送信予定:
- 「長期間ご利用がないため専用口座を返却します」
- 「残高をチャージすることで口座を継続できます」

### 4. フロントエンド UI の更新

#### 設定画面（creators/[handle]/settings）

**実装場所:** `apps/web/app/creators/[handle]/settings/settings-content.tsx`

#### 表示内容

##### 1. 現在のプリペイド残高

有料プラン（Lite/Business）の場合のみ表示:

```tsx
<div className="rounded-2xl border border-black/10 bg-white p-6">
  <h3>現在のプリペイド残高</h3>
  <span className="text-3xl font-bold">
    ¥{subscription.billingBalance.toLocaleString()}
  </span>
  <p>この残高から毎月のプラン料金が自動的に引き落とされます。</p>
</div>
```

##### 2. 残高不足アラート

次回更新日までに必要な金額が残高を上回る場合に警告表示:

```tsx
{isLowBalance && (
  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
    <span>⚠️</span>
    <p>残高不足の可能性</p>
    <p>
      次回更新日（{nextBillingDate}）までに
      ¥{requiredAmount}以上の残高が必要です。
      残高が不足している場合、自動更新が停止されます。
    </p>
  </div>
)}
```

##### 3. あなたの専用振込口座

固定口座が割り当てられている場合のみ表示:

```tsx
{virtualAccount && (
  <div className="rounded-2xl border border-black/10 bg-white p-6">
    <h3>あなたの専用振込口座</h3>
    <p>この口座に振り込むと、自動的にプリペイド残高にチャージされます。</p>
    <div>
      <div>銀行名: GMOあおぞらネット銀行</div>
      <div>支店名: {branchCode}支店</div>
      <div>口座種別: 普通</div>
      <div>口座番号: {accountNumber}</div>
      <div>口座名義: {accountName}</div>
    </div>
  </div>
)}
```

### 5. メール通知連携

#### 口座回収リマインドメール

**送信タイミング:** 回収7日前（83日目）

**実装予定:** `apps/api/src/mail/mail.service.ts`

```typescript
async sendVirtualAccountReclamationWarning(
  email: string,
  data: {
    creatorName: string;
    accountNumber: string;
    daysUntilReclamation: number;
  },
  userId: string,
) {
  const subject = '【重要】専用振込口座の返却予定のお知らせ';

  const html = `
    <h2>${data.creatorName}様</h2>

    <p>
      いつもご利用ありがとうございます。
    </p>

    <p>
      現在割り当てられている専用振込口座（口座番号: ${data.accountNumber}）について、
      長期間ご利用がないため、<strong>${data.daysUntilReclamation}日後</strong>に返却させていただく予定です。
    </p>

    <h3>継続してご利用いただく場合</h3>
    <p>
      専用口座に振込を行い、プリペイド残高をチャージしていただくことで、
      口座を継続してご利用いただけます。
    </p>

    <h3>返却後について</h3>
    <p>
      返却後も、プラン選択画面から再度Lite/Businessプランを選択いただくことで、
      新しい専用口座を割り当てることができます。
    </p>

    <p>
      ご不明な点がございましたら、お気軽にお問い合わせください。
    </p>
  `;

  await this.sendEmail(email, subject, html, userId);
}
```

#### メール送信ジョブ

CronServiceから呼び出し:

```typescript
@Cron('0 3 * * *')
async handleVirtualAccountReclamation() {
  // ...

  if (daysSinceActivity === 83) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: {
        user: true,
        virtualAccounts: {
          where: { purpose: 'CREATOR_PLAN', isActive: true },
        },
      },
    });

    if (creator?.user?.email) {
      await this.mailService.sendVirtualAccountReclamationWarning(
        creator.user.email,
        {
          creatorName: creator.displayName || creator.user.name,
          accountNumber: creator.virtualAccounts[0].accountNumber,
          daysUntilReclamation: 7,
        },
        creator.user.id,
      );
    }
  }
}
```

## 運用フロー

### クリエイタープラン選択時

```
1. ユーザーが Lite/Business プランを選択
   ↓
2. POST /api/creator/subscriptions
   ↓
3. PaymentsService.createCreatorPlanPurchase()
   ↓
4. BankTransfersService.assignVirtualAccount(subscriptionId, CREATOR_PLAN, creatorId)
   ↓
5. 既存の固定口座があれば再利用、なければ新規割り当て
   ↓
6. 口座情報をレスポンスとして返す
```

### 決済完了時

```
1. GMO Webhook 受信
   ↓
2. BankTransfersService.processGmoWebhook()
   ↓
3. billingBalance に入金額を加算
   ↓
4. 残高が十分なら subscription を ACTIVE に更新
   ↓
5. BankTransfersService.releaseVirtualAccount()
   ↓
6. isUsed = false に更新（固定口座なので creatorId は保持）
```

### 口座回収

```
1. Cron Job 実行（毎日午前3時）
   ↓
2. 条件チェック: FREE && billingBalance == 0 && 90日未使用
   ↓
3. 83日目: 警告メール送信
   ↓
4. 90日目: 口座回収
   - isUsed = false
   - creatorId = null
   - releasedAt = now
   ↓
5. 冷却期間（30日）
   ↓
6. 再割り当て可能
```

## 統計情報

### Admin API

口座の使用状況を確認:

```bash
# 在庫状況
curl http://localhost:3001/api/virtual-accounts/inventory

# 回収ログ
curl http://localhost:3001/api/admin/cron-logs?taskName=reclaim_virtual_accounts
```

### データベースクエリ

```sql
-- 固定割り当て口座の数
SELECT COUNT(*) FROM "VirtualAccount"
WHERE "creatorId" IS NOT NULL AND "purpose" = 'CREATOR_PLAN';

-- 冷却期間中の口座
SELECT COUNT(*) FROM "VirtualAccount"
WHERE "releasedAt" > NOW() - INTERVAL '30 days'
  AND "creatorId" IS NULL;

-- 回収対象のクリエイター
SELECT
  cp."id",
  cp."displayName",
  cs."billingBalance",
  cs."updatedAt",
  EXTRACT(DAY FROM NOW() - cs."updatedAt") as days_since_activity
FROM "CreatorProfile" cp
INNER JOIN "CreatorSubscription" cs ON cs."creatorId" = cp."id"
INNER JOIN "CreatorPlan" p ON cs."planId" = p."id"
WHERE p."type" = 'FREE'
  AND cs."billingBalance" = 0
  AND cs."updatedAt" < NOW() - INTERVAL '83 days';
```

## テスト

### 1. オンデマンド割り当てテスト

```bash
# Lite プランを選択
curl -X POST http://localhost:3001/api/payments/creator-plan \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <creator-id>" \
  -d '{"creatorId": "<creator-id>", "planType": "LITE", "isYearly": false}'

# 固定口座が割り当てられたことを確認
curl http://localhost:3001/api/creators/subscription
```

### 2. 冷却期間テスト

```sql
-- 口座を強制的に解放（テスト用）
UPDATE "VirtualAccount"
SET
  "isUsed" = false,
  "creatorId" = NULL,
  "releasedAt" = NOW() - INTERVAL '25 days'
WHERE "id" = '<account-id>';

-- 再割り当て試行（冷却期間中なので優先度低）
-- 30日以上前の口座があればそちらが優先される
```

### 3. 口座回収テスト

```sql
-- サブスクリプションを90日前に更新（テスト用）
UPDATE "CreatorSubscription"
SET "updatedAt" = NOW() - INTERVAL '91 days'
WHERE "creatorId" = '<creator-id>';

-- Cron Job を手動実行
curl -X POST http://localhost:3001/api/cron/reclaim-virtual-accounts
```

## パフォーマンス考慮事項

### インデックス

```sql
-- releasedAt でのソートを高速化
CREATE INDEX "VirtualAccount_releasedAt_idx" ON "VirtualAccount"("releasedAt");

-- クリエイター固定口座の検索を高速化
CREATE INDEX "VirtualAccount_creatorId_purpose_idx" ON "VirtualAccount"("creatorId", "purpose")
WHERE "creatorId" IS NOT NULL;
```

### 割り当てクエリの最適化

```typescript
// 良い例: 条件を絞り込んでから取得
const availableAccount = await prisma.virtualAccount.findFirst({
  where: {
    isUsed: false,
    isActive: true,
    purpose: CREATOR_PLAN,
    creatorId: null,
    OR: [
      { releasedAt: null },
      { releasedAt: { lt: thirtyDaysAgo } },
    ],
  },
  orderBy: [
    { releasedAt: 'asc' },
    { createdAt: 'asc' },
  ],
  take: 1,
});

// 悪い例: 全件取得してからフィルタリング
const allAccounts = await prisma.virtualAccount.findMany();
const availableAccount = allAccounts.filter(/* ... */)[0];
```

## トラブルシューティング

### 口座在庫が枯渇した場合

**エラー:**
```
Virtual account inventory is currently unavailable. Please contact support.
```

**対処法:**
1. 在庫状況を確認
   ```bash
   curl http://localhost:3001/api/virtual-accounts/inventory
   ```

2. 回収可能な口座を確認
   ```sql
   SELECT COUNT(*) FROM "VirtualAccount"
   WHERE "creatorId" IS NOT NULL
     AND "isUsed" = false;
   ```

3. 必要に応じて新しい口座を追加
   ```bash
   npm run import:virtual-accounts
   ```

### 冷却期間を短縮したい場合

開発環境でのテストなどで冷却期間を短縮する場合:

```typescript
// cron.service.ts
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 1); // 1日に短縮（開発用）
```

**注意:** 本番環境では30日を推奨

## 今後の拡張

### 1. 動的な冷却期間

使用頻度や口座在庫に応じて冷却期間を動的に調整:

```typescript
const coolingPeriod = calculateCoolingPeriod({
  inventoryUtilization: usedCount / totalCount,
  recentReclaimations: reclaimationsLast30Days,
});
```

### 2. 口座プール管理

用途別に口座プールを分離:
- クリエイタープラン用（固定割り当て）
- ファンクレジット用（一時的割り当て）
- 予備プール（在庫枯渇時の緊急用）

### 3. 予測的な口座生成

使用傾向を分析して、事前に必要な口座数を予測:

```typescript
const projectedDemand = predictAccountDemand({
  historicalData: last90DaysData,
  seasonalTrends: true,
});

if (availableInventory < projectedDemand) {
  await requestNewAccounts(projectedDemand - availableInventory);
}
```

## 関連ドキュメント

- [Virtual Account Payment Flow](./VIRTUAL_ACCOUNT_PAYMENT_FLOW.md)
- [GMO Integration Guide](./GMO_INTEGRATION_GUIDE.md)
- [Cron Job Implementation](./CRON_JOB_IMPLEMENTATION.md)
- [Bank Transfers Service](./apps/api/src/bank-transfers/bank-transfers.service.ts)
