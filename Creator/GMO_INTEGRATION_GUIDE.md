# GMO Bank Integration Guide

## Overview
GMOあおぞらネット銀行のバーチャル口座を使った自動入金処理システムの実装ガイド。

## Architecture

### 1. Database Schema
以下のモデルを追加しました:

#### CreatorPlan
クリエイター向けプランマスター（Free/Lite/Business）

```prisma
model CreatorPlan {
  planType     CreatorPlanType @unique
  name         String
  monthlyPrice Int
  yearlyPrice  Int
  feeRate      Float
}
```

#### CreatorSubscription
クリエイターのプラン契約

```prisma
model CreatorSubscription {
  creatorId       String @unique
  planId          String
  status          CreatorSubscriptionStatus
  isYearly        Boolean
  startDate       DateTime?
  endDate         DateTime?
  nextBillingDate DateTime?
}
```

#### VirtualAccount
GMOバーチャル口座情報

```prisma
model VirtualAccount {
  creatorId     String?
  fanId         String?
  accountNumber String @unique
  purpose       BankTransferType
  gmoAccountId  String?
  isActive      Boolean
}
```

#### BankTransfer
銀行振込履歴（Webhookデータ）

```prisma
model BankTransfer {
  virtualAccountId      String
  amount                Int
  transferorName        String
  transferDate          DateTime
  type                  BankTransferType
  status                BankTransferStatus
  gmoTransactionId      String? @unique
  webhookPayload        Json?
  creatorSubscriptionId String?
  chargeRequestId       String?
}
```

### 2. API Endpoints

#### Webhook受信
```
POST /webhooks/gmo/bank-transfer
Headers:
  X-GMO-Signature: <HMAC署名>
Body:
  {
    "transactionId": "GMO_TXN_12345",
    "accountNumber": "1234567890",
    "amount": 4980,
    "transferorName": "ヤマダタロウ",
    "transferDate": "2026-01-30T12:00:00Z"
  }
```

#### テスト用エンドポイント（開発環境のみ）
```
POST /webhooks/gmo/test
Body: 同上
```

## Implementation Flow

### クリエイタープラン支払い

```
1. GMOからWebhook受信
   ↓
2. VirtualAccount特定（accountNumber）
   ↓
3. BankTransferレコード作成
   ↓
4. CreatorSubscription取得
   ↓
5. 支払額検証
   ↓
6. サブスクリプション有効化
   - status: ACTIVE
   - startDate: 現在日時
   - endDate: +30日 or +365日
   ↓
7. BankTransfer.status = PROCESSED
```

### ファンクレジット購入

```
1. GMOからWebhook受信
   ↓
2. VirtualAccount特定（accountNumber）
   ↓
3. BankTransferレコード作成
   ↓
4. FanProfile取得
   ↓
5. クレジット残高加算
   ↓
6. CreditHistory記録
   ↓
7. ChargeRequest承認（該当があれば）
   ↓
8. BankTransfer.status = PROCESSED
```

## Setup Instructions

### 1. Database Migration

```bash
cd Creator
npx prisma migrate dev --name add_gmo_bank_integration
npx prisma generate
```

### 2. Environment Variables

`.env`に以下を追加:

```env
# GMO Bank Configuration
GMO_WEBHOOK_SECRET=your_webhook_secret_here
GMO_API_KEY=your_api_key_here
GMO_API_ENDPOINT=https://api.gmo-aozora.com/v1

# Optional: IP Whitelist for Webhooks
GMO_ALLOWED_IPS=xxx.xxx.xxx.xxx,yyy.yyy.yyy.yyy
```

### 3. Seed Data

初期プランデータをシードする:

```typescript
// prisma/seed.ts
const plans = [
  {
    planType: 'FREE',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    feeRate: 0.12,
  },
  {
    planType: 'LITE',
    name: 'Lite',
    monthlyPrice: 4980,
    yearlyPrice: 49800,
    feeRate: 0.07,
  },
  {
    planType: 'BUSINESS',
    name: 'Business',
    monthlyPrice: 29800,
    yearlyPrice: 298000,
    feeRate: 0.03,
  },
];

for (const plan of plans) {
  await prisma.creatorPlan.upsert({
    where: { planType: plan.planType },
    update: plan,
    create: plan,
  });
}
```

実行:

```bash
npx prisma db seed
```

### 4. GMO API Integration

GMOのAPIを使ってバーチャル口座を作成するサービスを追加:

```typescript
// apps/api/src/bank-transfers/gmo-api.service.ts
@Injectable()
export class GmoApiService {
  async createVirtualAccount(userId: string, purpose: BankTransferType) {
    // GMO APIを呼び出してバーチャル口座を作成
    const response = await axios.post(
      `${process.env.GMO_API_ENDPOINT}/virtual-accounts`,
      {
        userId,
        purpose,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GMO_API_KEY}`,
        },
      },
    );

    return response.data;
  }
}
```

## Testing

### ローカルテスト

```bash
# Webhookテストエンドポイントを使用
curl -X POST http://localhost:3000/webhooks/gmo/test \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TEST_TXN_001",
    "accountNumber": "1234567890",
    "amount": 4980,
    "transferorName": "テストユーザー",
    "transferDate": "2026-01-30T12:00:00Z"
  }'
```

### Webhook署名テスト

```bash
# 署名付きリクエスト
PAYLOAD='{"transactionId":"TEST_001","accountNumber":"1234567890","amount":4980,"transferorName":"Test","transferDate":"2026-01-30T12:00:00Z"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "your_secret" | awk '{print $2}')

curl -X POST http://localhost:3000/webhooks/gmo/bank-transfer \
  -H "Content-Type: application/json" \
  -H "X-GMO-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

## Security Considerations

1. **Webhook署名検証**: 必ずHMAC署名を検証すること
2. **IP制限**: GMOのWebhook送信元IPアドレスをホワイトリスト化
3. **重複防止**: `gmoTransactionId`のユニーク制約で重複処理を防止
4. **エラーハンドリング**: 処理失敗時もGMOには200を返し、内部で記録
5. **環境変数**: Webhook Secretは必ず環境変数で管理

## Monitoring & Logging

### ログ出力

- Webhook受信時: `Received GMO webhook`
- 処理成功時: `Successfully processed bank transfer: {id}`
- 処理失敗時: `Failed to process bank transfer: {id}`

### メトリクス

- Webhook処理成功率
- 平均処理時間
- エラー頻度

### アラート

以下の場合にアラートを設定:
- Webhook署名検証失敗
- 処理失敗率が閾値を超える
- 未処理のBankTransferが溜まる

## Next Steps

1. **GMO API統合**: バーチャル口座作成APIの実装
2. **管理画面**: 振込履歴、バーチャル口座管理画面
3. **通知システム**: 入金完了メール送信
4. **レポート**: 収益レポート、手数料レポート
5. **リトライ機構**: Webhook処理失敗時の再試行

## References

- [GMOあおぞらネット銀行 API仕様書](https://developer.gmo-aozora.com/)
- [Prisma Schema](./prisma/schema.prisma)
- [Fee Calculation Design](./FEE_CALCULATION_DESIGN.md)
