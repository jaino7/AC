# Trust & Lock Payment System - Implementation Summary

## Overview

「信じて、奪う（Trust & Lock）」決済システムの実装が完了しました。このシステムは、ファン向け銀行振込決済において、ティアベースの即時チャージと不正検知時のアカウントロック機能を提供します。

## 実装完了項目

### Phase 1: Database Schema ✅

#### 追加されたEnums
- `BankTransferClaimStatus`: PENDING, VERIFIED, REJECTED, EXPIRED

#### FanProfile Extensions
- `tier` (Int): ユーザーのティアレベル (0=New, 1=Trusted, 2=Premium)
- `trustScore` (Int): 信頼スコア (成功した決済ごとに増加)
- `isLocked` (Boolean): アカウントロック状態
- `lockedReason` (String?): ロックの理由
- `lockedAt` (DateTime?): ロック日時

#### 新規モデル: BankTransferClaim
振込申告を管理するモデル:
- 申告情報 (amount, identifierCode)
- 処理状態 (status, approvedAt, rejectedAt)
- クレジット配分 (immediateCredit, pendingCredit)
- 関連エンティティ (chargeRequest, bankTransfer)
- 監査情報 (processedBy, processedAt)

#### ChargeRequest Extensions
- `hasClaim` (Boolean): 申告が存在するかのフラグ

#### BankTransfer Extensions
- `claim` (BankTransferClaim?): 紐付けられた申告

### Phase 2: Backend API ✅

#### ClaimsService (`apps/api/src/payments/claims.service.ts`)

**主要メソッド:**

1. **createClaim(fanId, chargeRequestId)**
   - 振込完了の自己申告を処理
   - ファンのロック状態をチェック
   - ティアに基づいてクレジットを即時/保留に分配
   - 即時クレジットがあれば即座に付与

2. **calculateCreditAllocation(tier, amount)**
   - Tier 0: 即時0円、全額保留
   - Tier 1: 最大3,000円即時、超過分保留
   - Tier 2: 全額即時

3. **grantImmediateCredits(fanId, amount, claimId)**
   - FanProfileのクレジット残高を更新
   - CreditHistoryレコードを作成

4. **verifyClaim(claim, bankTransfer)**
   - 実際の振込と申告を照合
   - 金額の一致を確認
   - 48時間以内かを確認
   - 不一致の場合はhandleFraudDetection()を呼び出し
   - 一致した場合は保留クレジットを付与

5. **handleFraudDetection(claim, bankTransfer, reason)**
   - FanProfileのisLockedをtrueに設定
   - 即時クレジットを取り消し
   - 申告をREJECTEDに更新

6. **incrementTrustScore(fanId)**
   - trustScoreを増加
   - 閾値到達時に自動的にティアをアップグレード
     - trustScore >= 1: Tier 1へ
     - trustScore >= 3: Tier 2へ

7. **expireOldClaims()**
   - 48時間以上経過したPENDING状態の申告を検索
   - 即時クレジットを取り消し
   - 申告をEXPIREDに更新

8. **管理者向けメソッド**
   - `approveClaim()`: 手動承認
   - `rejectClaim()`: 手動却下とアカウントロック
   - `lockFanAccount()`: アカウントをロック
   - `unlockFanAccount()`: アカウントのロックを解除
   - `getPendingClaims()`: 保留中の申告一覧を取得

#### ClaimsController (`apps/api/src/payments/claims.controller.ts`)

**エンドポイント:**
- `POST /payments/claims`: 新規申告を作成

#### BankTransfersService Updates

**processFanCreditCharge() の拡張:**
- ChargeRequestに関連するBankTransferClaimをチェック
- 申告が存在する場合はverifyClaim()で検証
- 申告がない場合は従来のフロー (Tier 0ユーザー)
- Tier 0ユーザーの場合もtrustScoreを増加

**新規メソッド:**
- `processNormalCredit()`: 申告なしの通常クレジット処理

### Phase 3: Access Control & Lock Enforcement ✅

#### AccountLockGuard (`apps/api/src/common/guards/account-lock.guard.ts`)
- リクエストヘッダーからuserIdとcreatorIdを取得
- FanProfileを検索
- isLockedがtrueの場合、ForbiddenExceptionをスロー
- ロック理由とロック日時を含むエラーレスポンス

**適用方法:**
```typescript
@UseGuards(AccountLockGuard)
@Post('some-endpoint')
async someMethod() { ... }
```

### Phase 4: Admin Management Interface ✅

#### ClaimsAdminController (`apps/api/src/admin/claims-admin.controller.ts`)

**エンドポイント:**

| エンドポイント | メソッド | 説明 |
|----------|--------|-------------|
| `/admin/claims/pending` | GET | 保留中の申告一覧 |
| `/admin/claims/bank-transfers` | GET | 未照合の銀行振込一覧 |
| `/admin/claims/reconciliation` | GET | 照合ビュー (申告 + 振込 + マッチング候補) |
| `/admin/claims/:claimId/approve` | POST | 申告を手動承認 |
| `/admin/claims/:claimId/reject` | POST | 申告を却下しアカウントをロック |
| `/admin/claims/fans/:fanId/lock` | POST | ファンアカウントをロック |
| `/admin/claims/fans/:fanId/unlock` | POST | ファンアカウントのロックを解除 |
| `/admin/claims/batch-approve` | POST | 複数の申告を一括承認 |
| `/admin/claims/locked-accounts` | GET | ロックされたアカウント一覧 |
| `/admin/claims/stats` | GET | 申告統計情報 (不正率、ティア分布など) |

#### AdminModule (`apps/api/src/admin/admin.module.ts`)
- ClaimsAdminControllerを登録
- PaymentsModuleとPrismaModuleをインポート

### Phase 5: Automation ✅

#### CronService Updates (`apps/api/src/bank-transfers/cron.service.ts`)

**新規cron job:**
- `handleExpireClaims()`: 6時間ごとに実行
  - 48時間以上経過したPENDING申告を検索
  - 即時クレジットを取り消し
  - EXPIREDに更新
  - CronLogテーブルに記録

## ティアシステムの動作

### Tier 0 (新規ユーザー)
- **即時クレジット**: 0円
- **保留クレジット**: 全額
- **条件**: 成功した振込が0回
- **動作**: 従来通り運営確認後に付与

### Tier 1 (信頼済みユーザー)
- **即時クレジット**: 最大3,000円
- **保留クレジット**: 3,000円超過分
- **条件**: trustScore >= 1 (成功した振込が1回以上)
- **動作**: 3,000円まで即座に利用可能、残りは振込確認後

### Tier 2 (優良ユーザー)
- **即時クレジット**: 無制限
- **保留クレジット**: 0円
- **条件**: trustScore >= 3 (成功した振込が3回以上)
- **動作**: 全額即座に利用可能

## 不正検知とアカウントロック

### 不正検知条件
1. **金額不一致**: 申告額と実際の振込額が異なる
2. **タイムアウト**: 申告から48時間以内に振込が確認されない

### ロック時の動作
1. `FanProfile.isLocked = true`
2. `FanProfile.lockedReason`にロック理由を記録
3. 即時付与したクレジットを取り消し
4. 申告をREJECTEDステータスに更新
5. 全てのコンテンツアクセスをブロック

### ロック解除
- 管理者が手動でロック解除可能
- `POST /admin/claims/fans/:fanId/unlock`

## データフロー

### 1. 申告フロー (ファン側)
```
1. ファンがクレジットチャージを申請
2. ChargeRequestが作成される
3. ファンが「振込完了を申告」ボタンをクリック
4. POST /payments/claims が呼ばれる
5. ClaimsService.createClaim() が実行
   - ティアを確認
   - 即時/保留クレジットを計算
   - 即時クレジットを付与 (Tier 1, 2のみ)
   - BankTransferClaimレコード作成
6. ファンは即時クレジットを利用可能
```

### 2. 検証フロー (システム側)
```
1. GMO Webhookが銀行振込を通知
2. BankTransfersService.processGmoWebhook() が実行
3. processFanCreditCharge() 内で:
   - BankTransferClaimを検索
   - 申告がある場合:
     - ClaimsService.verifyClaim() で検証
     - 金額一致 → 保留クレジットを付与、trustScoreを増加
     - 金額不一致 → handleFraudDetection() でアカウントロック
   - 申告がない場合 (Tier 0):
     - processNormalCredit() で従来のフロー
```

### 3. 期限切れフロー (Cron)
```
1. 6時間ごとにCronService.handleExpireClaims()が実行
2. 48時間以上経過したPENDING申告を検索
3. 各申告に対して:
   - 即時クレジットを取り消し
   - ステータスをEXPIREDに更新
   - CreditHistoryに取り消し記録を追加
4. CronLogに実行結果を記録
```

## モジュール構成

### 更新されたモジュール
- `PaymentsModule`: ClaimsServiceとClaimsControllerを追加
- `BankTransfersModule`: PaymentsModuleをforwardRefでインポート
- `AppModule`: AdminModuleを追加

### 循環依存の解決
- BankTransfersServiceとClaimsServiceの間で`forwardRef()`を使用
- BankTransfersModuleとPaymentsModuleの間で`forwardRef()`を使用

## セキュリティ対策

1. **即時クレジット上限**: Tier 1は3,000円まで
2. **48時間タイムアウト**: 長期間放置された申告を自動失効
3. **自動アカウントロック**: 不正検知時に即座にロック
4. **クレジット取り消し**: 不正時は即時クレジットを回収
5. **サンクコスト効果**: ティアシステムが不正の抑止力

## 次のステップ (未実装)

### Phase 5: Frontend User Interface
- [ ] `apps/web/app/[handle]/account/credits/page.tsx`に「振込完了を申告」ボタン追加
- [ ] `ClaimWarningModal.tsx`コンポーネント作成
- [ ] `AccountLockedScreen.tsx`コンポーネント作成
- [ ] 投稿アクセス時のロックチェック追加

### Phase 6: Admin Dashboard
- [ ] `apps/web/app/admin/claims/page.tsx`管理画面作成
- [ ] ReconciliationViewコンポーネント
- [ ] PendingClaimsTableコンポーネント
- [ ] LockedAccountsTableコンポーネント

### その他
- [ ] メール通知の実装
  - 不正検知時の通知
  - 期限切れ警告
  - ティアアップグレード通知
- [ ] 単体テストの作成
- [ ] 統合テストの作成
- [ ] 管理者認証ガードの実装

## ファイル一覧

### 新規作成
- `prisma/migrations/20260206000000_add_trust_lock_system/migration.sql`
- `apps/api/src/payments/claims.service.ts`
- `apps/api/src/payments/claims.controller.ts`
- `apps/api/src/common/guards/account-lock.guard.ts`
- `apps/api/src/admin/claims-admin.controller.ts`
- `apps/api/src/admin/admin.module.ts`

### 更新
- `prisma/schema.prisma`
- `apps/api/src/payments/payments.module.ts`
- `apps/api/src/bank-transfers/bank-transfers.service.ts`
- `apps/api/src/bank-transfers/bank-transfers.module.ts`
- `apps/api/src/bank-transfers/cron.service.ts`
- `apps/api/src/app.module.ts`

## データベースマイグレーション

マイグレーションを適用するには:

```bash
# Dockerを起動
docker compose up -d

# マイグレーションを実行
npx prisma migrate dev

# Prisma Clientを生成
npx prisma generate
```

## テスト方法

### 1. Tier 0ユーザー (新規)
```bash
# 1. 新規ファンを作成
# 2. ChargeRequestを作成
# 3. 申告を試みる → 即時クレジット0円、全額保留
# 4. 銀行振込を実行
# 5. Webhookを送信 → 全額付与、trustScore=1、Tier 1へアップグレード
```

### 2. Tier 1ユーザー (3,000円上限)
```bash
# 1. trustScore=1のファンで5,000円の申告
# 2. 即時3,000円付与、2,000円保留
# 3. 5,000円振込 → 保留2,000円付与、trustScore=2
```

### 3. 不正検知
```bash
# 1. ファンが5,000円を申告
# 2. 実際には3,000円振込
# 3. Webhook受信 → 金額不一致検知
# 4. アカウントロック、即時クレジット取り消し
```

### 4. 期限切れ
```bash
# 1. 申告を作成
# 2. 48時間待つ (テスト時はタイムスタンプを手動変更)
# 3. Cronジョブ実行 → EXPIRED、即時クレジット取り消し
```

## 運用監視

### CronLog監視
```sql
SELECT * FROM "CronLog"
WHERE "taskName" = 'expire_claims'
ORDER BY "executedAt" DESC
LIMIT 10;
```

### 不正率監視
```bash
curl http://localhost:3000/admin/claims/stats
```

### ティア分布
```sql
SELECT
  tier,
  COUNT(*) as count,
  AVG("trustScore") as avg_trust_score
FROM "FanProfile"
GROUP BY tier
ORDER BY tier;
```

## 成功指標

1. **ティア分布**: 3ヶ月後に60%がTier 1以上
2. **不正率**: ロック率 < 1%
3. **UX改善**: Tier 1+ユーザーは5分以内にクレジット利用可能
4. **運用効率**: 管理者の照合時間 < 10分/日
5. **trustScore成長**: ティアアップグレード率を監視
