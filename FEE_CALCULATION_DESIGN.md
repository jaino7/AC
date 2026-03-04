# Fee Calculation Logic Design

## Overview
クリエイターのプラン（Free/Lite/Business）に応じて、ファンからの収益に対する手数料を計算・控除するロジックの設計。

## Fee Rates
| Plan Type | Monthly Price | Yearly Price | Fee Rate |
|-----------|---------------|--------------|----------|
| Free      | ¥0            | ¥0           | 8%       |
| Lite      | ¥2,980        | ¥29,800      | 5%       |
| Business  | ¥19,800       | ¥198,000     | 2.8%     |

手数料率は`CreatorPlan.feeRate`に格納（例: 8.0, 5.0, 2.8）

## Architecture

### 1. Fee Rate Management
**Location**: Database (`CreatorPlan` model)

```prisma
model CreatorPlan {
  feeRate Float // 手数料率
}
```

### 2. Fee Calculation Service
**Location**: `apps/api/src/revenue/revenue.service.ts`

```typescript
@Injectable()
export class RevenueService {
  /**
   * クリエイターの現在の手数料率を取得
   */
  async getCreatorFeeRate(creatorId: string): Promise<number> {
    const subscription = await this.prisma.creatorSubscription.findUnique({
      where: { creatorId },
      include: { plan: true },
    });

    // サブスクリプションがない、またはFreeプランの場合はデフォルト8%
    return subscription?.plan.feeRate ?? 0.08;
  }

  /**
   * 手数料を計算
   * @param amount - 収益額（円）
   * @param feeRate - 手数料率
   * @returns { platformFee, creatorRevenue }
   */
  calculateFee(amount: number, feeRate: number) {
    const platformFee = Math.floor(amount * feeRate);
    const creatorRevenue = amount - platformFee;

    return {
      platformFee,     // プラットフォーム手数料
      creatorRevenue,  // クリエイター受取額
    };
  }

  /**
   * トランザクション作成時に手数料を自動計算
   */
  async createRevenueTransaction(
    creatorId: string,
    amount: number,
    metadata: any,
  ) {
    const feeRate = await this.getCreatorFeeRate(creatorId);
    const { platformFee, creatorRevenue } = this.calculateFee(amount, feeRate);

    // Transactionレコードを作成
    return this.prisma.transaction.create({
      data: {
        creatorId,
        amount: creatorRevenue, // クリエイター受取額を記録
        status: 'PAID',
        metadata: {
          ...metadata,
          originalAmount: amount,
          platformFee,
          feeRate,
        },
      },
    });
  }
}
```

### 3. Integration Points

#### A. ファンのサブスクリプション支払い時
**Location**: `apps/api/src/subscriptions/subscriptions.service.ts`

```typescript
async processSubscriptionPayment(fanId: string, planId: string) {
  const plan = await this.prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    include: { creator: true },
  });

  // クレジットから支払い
  await this.creditService.deductCredits(fanId, plan.price);

  // 収益トランザクション作成（手数料自動計算）
  await this.revenueService.createRevenueTransaction(
    plan.creatorId,
    plan.price,
    { type: 'SUBSCRIPTION', planId },
  );
}
```

#### B. 単体購入時
**Location**: `apps/api/src/purchases/purchases.service.ts`

```typescript
async processPurchase(fanId: string, postId: string) {
  const post = await this.prisma.post.findUnique({
    where: { id: postId },
    include: { creator: true },
  });

  // クレジットから支払い
  await this.creditService.deductCredits(fanId, post.price);

  // 収益トランザクション作成（手数料自動計算）
  await this.revenueService.createRevenueTransaction(
    post.creatorId,
    post.price,
    { type: 'PURCHASE', postId },
  );
}
```

### 4. Withdrawal Processing
**Location**: `apps/api/src/revenue/revenue.service.ts`

クリエイターが収益を引き出す際は、すでに手数料が控除された金額（`Transaction.amount`）を使用。

```typescript
async getCreatorBalance(creatorId: string): Promise<number> {
  const transactions = await this.prisma.transaction.findMany({
    where: {
      creatorId,
      status: 'PAID',
    },
  });

  // Transaction.amountにはすでに手数料控除後の金額が入っている
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}
```

## Data Flow

```
1. ファンがコンテンツ購入 (¥1,000)
   ↓
2. CreditHistoryに記録 (-¥1,000)
   ↓
3. クリエイターの手数料率を取得 (例: Lite = 5%)
   ↓
4. 手数料計算
   - Platform Fee: ¥50
   - Creator Revenue: ¥950
   ↓
5. Transactionレコード作成
   - amount: ¥950 (手数料控除後)
   - metadata: { originalAmount: 1000, platformFee: 50, feeRate: 0.05 }
   ↓
6. クリエイターが引き出し可能額: ¥950
```

## Database Schema Changes

### Transaction Model Extension
`Transaction.metadata`に以下の情報を含める:

```json
{
  "originalAmount": 1000,      // 元の金額
  "platformFee": 50,           // プラットフォーム手数料
  "feeRate": 0.05,             // 適用された手数料率
  "type": "PURCHASE",          // トランザクション種別
  "postId": "xxx"              // 関連エンティティID
}
```

## Implementation Priority

1. **Phase 1**: RevenueService基本実装
   - `getCreatorFeeRate()`
   - `calculateFee()`
   - `createRevenueTransaction()`

2. **Phase 2**: 既存サービスへの統合
   - SubscriptionsService
   - PurchasesService

3. **Phase 3**: Analytics & Reporting
   - 手数料レポート画面
   - クリエイターダッシュボードへの表示

## Testing Considerations

- Freeプラン（8%）の手数料計算
- Liteプラン（5%）の手数料計算
- Businessプラン（2.8%）の手数料計算
- プラン未契約の場合のデフォルト動作
- 端数処理（切り捨て）の確認
- マイナス金額や0円の処理

## Notes

- 手数料は常に切り捨て（`Math.floor()`）
- プラン変更時は次回請求から新しい手数料率を適用
- 過去のトランザクションの手数料率は変更しない（metadata に記録）
