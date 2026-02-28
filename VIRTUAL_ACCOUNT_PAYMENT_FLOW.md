# Virtual Account Payment Flow - Payment-based Assignment

## Overview
バーチャル口座を**決済単位**で管理することで、1人のファンが複数のクリエイターに同時に課金できるように改良しました。

## Key Changes

### Before (User-based Assignment)
- 1つのバーチャル口座が1人のユーザー（`assignedToUserId`）に紐付けられる
- 1人のファンは同時に1つのクリエイターにしか課金できない
- 口座の再利用が困難

### After (Payment-based Assignment)
- 1つのバーチャル口座が1つの決済（`assignedToPaymentId`）に紐付けられる
- 1人のファンが複数のクリエイターに同時に課金可能
- 決済完了後、口座が自動的に在庫に戻る

## Architecture

### Database Schema Changes

#### VirtualAccount Model
```prisma
model VirtualAccount {
  // ... existing fields ...

  // 決済単位の紐付け（1つの口座は1つの決済に割り当てられる）
  assignedToPaymentId String? // CreatorSubscription.id または ChargeRequest.id
  isUsed              Boolean  @default(false) // 使用中フラグ
  assignedAt          DateTime? // 割り当て日時

  @@index([assignedToPaymentId])
  @@index([isUsed, purpose]) // 在庫検索用
}
```

## Payment Flow

### 1. Fan Credit Charge Flow

```
[Frontend]
1. ファンがチャージ金額を選択
   ↓
2. POST /api/fan/charge-requests
   - ChargeRequest を作成
   - バーチャル口座を割り当て（assignVirtualAccount）
   - 口座番号を返す
   ↓
3. 決済画面に口座番号を表示
   GET /api/payments/:chargeRequestId/virtual-account

[User Action]
4. ファンが銀行振込を実行

[Backend - Webhook]
5. GMO Webhook受信: POST /webhooks/gmo/bank-transfer
   ↓
6. VirtualAccount を特定（accountNumber）
   ↓
7. assignedToPaymentId から ChargeRequest を特定
   ↓
8. 支払額を検証
   ↓
9. ファンのクレジット残高を加算
   ↓
10. ChargeRequest を APPROVED に更新
   ↓
11. 口座を在庫に戻す（releaseVirtualAccount）
```

### 2. Creator Plan Payment Flow

```
[Frontend]
1. クリエイターがプランを選択
   ↓
2. POST /api/creator/subscriptions
   - CreatorSubscription を作成（status: PENDING）
   - バーチャル口座を割り当て（assignVirtualAccount）
   - 口座番号を返す
   ↓
3. 決済画面に口座番号を表示
   GET /api/payments/:subscriptionId/virtual-account

[User Action]
4. クリエイターが銀行振込を実行

[Backend - Webhook]
5. GMO Webhook受信: POST /webhooks/gmo/bank-transfer
   ↓
6. VirtualAccount を特定（accountNumber）
   ↓
7. assignedToPaymentId から CreatorSubscription を特定
   ↓
8. 支払額を検証
   ↓
9. サブスクリプションを有効化（status: ACTIVE）
   ↓
10. 口座を在庫に戻す（releaseVirtualAccount）
```

## API Endpoints

### 1. Get Virtual Account for Payment
```http
GET /api/payments/:paymentId/virtual-account

Response:
{
  "accountNumber": "1234567890",
  "accountName": "コココバ",
  "branchCode": "001",
  "purpose": "FAN_CREDIT",
  "assignedAt": "2026-01-31T12:00:00Z"
}
```

### 2. Get Inventory Status (Admin)
```http
GET /api/virtual-accounts/inventory

Response:
{
  "creatorPlan": {
    "total": 1000,
    "used": 50,
    "available": 950
  },
  "fanCredit": {
    "total": 5000,
    "used": 200,
    "available": 4800
  }
}
```

### 3. Release Expired Accounts (Admin/Cron)
```http
POST /api/virtual-accounts/release-expired

Response:
{
  "success": true,
  "releasedCount": 10,
  "message": "Released 10 virtual accounts"
}
```

## Service Methods

### BankTransfersService

#### assignVirtualAccount(paymentId, purpose)
```typescript
/**
 * バーチャル口座を決済に割り当て
 * @param paymentId CreatorSubscription.id または ChargeRequest.id
 * @param purpose CREATOR_PLAN または FAN_CREDIT
 */
async assignVirtualAccount(paymentId: string, purpose: BankTransferType)
```

#### releaseVirtualAccount(paymentId)
```typescript
/**
 * バーチャル口座を在庫に戻す（決済完了・期限切れ時）
 * @param paymentId CreatorSubscription.id または ChargeRequest.id
 */
async releaseVirtualAccount(paymentId: string)
```

#### releaseExpiredChargeRequests()
```typescript
/**
 * 期限切れの ChargeRequest に紐付く口座を解放
 * @returns 解放された口座の数
 */
async releaseExpiredChargeRequests()
```

#### getVirtualAccountByPaymentId(paymentId)
```typescript
/**
 * 決済IDに紐付くバーチャル口座を取得
 * @param paymentId CreatorSubscription.id または ChargeRequest.id
 */
async getVirtualAccountByPaymentId(paymentId: string)
```

## Cron Job Setup

期限切れの決済に紐付く口座を定期的に解放するため、Cron Jobを設定します。

```typescript
// Example: NestJS @Cron decorator
@Cron('0 */6 * * *') // 6時間ごとに実行
async handleExpiredAccounts() {
  await this.bankTransfersService.releaseExpiredChargeRequests();
}
```

## Migration

```bash
# Apply migration
cd apps/api
npx prisma migrate deploy --schema=./src/prisma/schema.prisma

# Regenerate Prisma Client
npx prisma generate --schema=./src/prisma/schema.prisma
```

## Benefits

1. **スケーラビリティ**: 1人のファンが複数のクリエイターに同時に課金可能
2. **効率的な在庫管理**: 決済完了後、口座が自動的に在庫に戻る
3. **追跡可能性**: 各決済に専用の口座が割り当てられ、トラッキングが容易
4. **柔軟性**: 決済ごとに独立した口座を使用するため、エラー処理が簡単

## Testing

### Test Scenarios

1. **Fan charges credit for multiple creators simultaneously**
   - Create 3 ChargeRequests for different creators
   - Verify each gets a unique virtual account
   - Process payments via webhook
   - Verify all accounts are released back to inventory

2. **Account inventory depletion**
   - Assign all available accounts
   - Attempt to create a new payment
   - Verify appropriate error is returned

3. **Expired charge requests**
   - Create ChargeRequest with expiresAt in the past
   - Run releaseExpiredChargeRequests()
   - Verify account is released

4. **Concurrent payment processing**
   - Process multiple webhooks simultaneously
   - Verify no race conditions in account assignment/release
