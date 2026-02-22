# バーチャル口座在庫引き当てシステム - 実装完了ガイド

## 概要

GMO銀行のAPI審査待ちの間、手動で発行したバーチャル口座を「在庫」として管理し、Make/Zapier経由のメール解析でWebhookを擬似する仕組みを実装しました。

---

## 実装内容

### 1. データベーススキーマ拡張

**ファイル**: `src/prisma/schema.prisma`

#### 追加されたフィールド

**VirtualAccount モデル**:
- `isUsed` - 口座が引き当て済みかどうか
- `assignedToUserId` - 引き当てられたユーザーID
- `assignedToUser` - ユーザーとのリレーション
- `assignedAt` - 引き当て日時

**User モデル**:
- `assignedVirtualAccounts` - ユーザーに引き当てられたバーチャル口座のリレーション

### 2. 新しいサービスメソッド

**ファイル**: `src/bank-transfers/bank-transfers.service.ts`

#### `assignVirtualAccount(userId, purpose)`
- 在庫から未使用の口座を引き当て
- FIFO方式（先入れ先出し）
- トランザクションで排他制御

#### `getInventoryStatus()`
- 在庫状況を取得（管理者用）
- クリエイタープラン用とファンクレジット用の在庫数を返す

#### `processAutomationWebhook(payload)`
- Make/Zapier経由のWebhookを処理
- 重複チェック（口座番号・金額・振込日時・振込人名義の組み合わせ）
- 既存の処理ロジックを再利用

### 3. 新しいエンドポイント

**ファイル**: `src/bank-transfers/bank-transfers.controller.ts`

#### `POST /webhooks/automation/bank-transfer`
- Make/Zapier からのWebhookを受信
- `X-Webhook-Secret` ヘッダーで認証
- 常にHTTP 200を返す（再送防止）

**注意**: 既存のGMO Webhookエンドポイントは `/webhooks/gmo/bank-transfer` に変更されました。

### 4. データ投入スクリプト

**ファイル**: `src/bank-transfers/scripts/import-accounts.ts`

- JSONファイルからバーチャル口座をインポート
- 重複チェック
- インポート結果のサマリー表示

---

## セットアップ手順

### ステップ1: データベース起動

```bash
# プロジェクトルートから
cd C:\dev\ACD\Creator
docker compose up -d
```

### ステップ2: マイグレーション実行

```bash
cd apps/api
npx prisma migrate dev --schema=src/prisma/schema.prisma --name add_virtual_account_inventory_fields
npx prisma generate --schema=src/prisma/schema.prisma
```

### ステップ3: 環境変数設定

`.env` ファイルに以下を追加（すでに追加済み）:

```bash
# Automation Webhook (Make/Zapier)
AUTOMATION_WEBHOOK_SECRET=change_this_to_a_strong_random_secret
```

**重要**: `AUTOMATION_WEBHOOK_SECRET` を強力なランダム文字列に変更してください。

生成例:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ステップ4: バーチャル口座データ準備

`src/bank-transfers/scripts/virtual-accounts.json` を編集して、実際の口座データを追加します:

```json
[
  {
    "accountNumber": "実際の口座番号",
    "accountName": "CREATOR_PLAN_001",
    "branchCode": "001",
    "purpose": "CREATOR_PLAN"
  },
  {
    "accountNumber": "実際の口座番号",
    "accountName": "FAN_CREDIT_001",
    "branchCode": "001",
    "purpose": "FAN_CREDIT"
  }
]
```

### ステップ5: データインポート

```bash
npm run import:virtual-accounts
```

出力例:
```
Starting virtual account import...

Found 4 accounts in JSON file

✅ Imported: 1234567001 (CREATOR_PLAN)
✅ Imported: 1234567002 (CREATOR_PLAN)
✅ Imported: 1234568001 (FAN_CREDIT)
✅ Imported: 1234568002 (FAN_CREDIT)

============================================================
Import Summary:
============================================================
✅ Successfully imported: 4
⏭️  Skipped (duplicates):  0
❌ Errors:                0
📊 Total processed:       4
============================================================

Current Inventory Status:
  CREATOR_PLAN available: 2
  FAN_CREDIT available:   2
```

---

## 使用方法

### 1. バーチャル口座の引き当て

ユーザーがクリエイタープランやファンクレジットを購入する際、在庫から口座を引き当てます:

```typescript
// サービス内で使用
const virtualAccount = await this.bankTransfersService.assignVirtualAccount(
  userId,
  BankTransferType.CREATOR_PLAN
);

console.log(`口座番号: ${virtualAccount.accountNumber}`);
// ユーザーに振込先情報を表示
```

### 2. Make/Zapier Webhook設定

#### Make (旧Integromat) の場合

1. Gmail/Outlook等のメールトリガーを設定
2. メール本文をパースして以下のデータを抽出:
   - 口座番号
   - 振込金額
   - 振込人名義
   - 振込日時
3. HTTPリクエストモジュールを追加:
   - URL: `https://your-domain.com/webhooks/automation/bank-transfer`
   - Method: POST
   - Headers:
     - `Content-Type: application/json`
     - `X-Webhook-Secret: your_secret_here`
   - Body:
     ```json
     {
       "accountNumber": "{{extracted.accountNumber}}",
       "amount": {{extracted.amount}},
       "transferorName": "{{extracted.transferorName}}",
       "transferDate": "{{extracted.transferDate}}",
       "branchCode": "001"
     }
     ```

#### Zapier の場合

1. トリガー: Gmail/Outlook New Email
2. フィルター: 件名に「振込通知」等を含む
3. パース: メール本文から必要な情報を抽出
4. アクション: Webhooks by Zapier
   - Event: POST
   - URL: `https://your-domain.com/webhooks/automation/bank-transfer`
   - Payload Type: JSON
   - Headers:
     ```
     X-Webhook-Secret: your_secret_here
     ```
   - Data:
     ```json
     {
       "accountNumber": "{{1.AccountNumber}}",
       "amount": {{1.Amount}},
       "transferorName": "{{1.TransferorName}}",
       "transferDate": "{{1.TransferDate}}",
       "branchCode": "001"
     }
     ```

### 3. 在庫状況の確認

管理画面等で在庫状況を表示:

```typescript
const status = await this.bankTransfersService.getInventoryStatus();

console.log(status);
// {
//   creatorPlan: { total: 10, used: 3, available: 7 },
//   fanCredit: { total: 20, used: 5, available: 15 }
// }
```

---

## テスト方法

### 1. Automation Webhookのテスト

```bash
curl -X POST http://localhost:3000/webhooks/automation/bank-transfer \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your_automation_webhook_secret_here" \
  -d '{
    "accountNumber": "1234567001",
    "amount": 5000,
    "transferorName": "ヤマダタロウ",
    "transferDate": "2026-01-31T10:30:00.000Z",
    "branchCode": "001"
  }'
```

期待されるレスポンス:
```json
{
  "success": true,
  "transactionId": "clxxxxx",
  "message": "Webhook processed successfully"
}
```

### 2. Prisma Studioで確認

```bash
npx prisma studio --schema=src/prisma/schema.prisma
```

確認項目:
- **VirtualAccount**: `isUsed`, `assignedToUserId`, `assignedAt` が正しく設定されているか
- **BankTransfer**: レコードが作成され、`status` が `PROCESSED` になっているか
- **CreatorSubscription** または **FanProfile.credits**: 更新されているか

---

## エラーハンドリング

### 在庫切れエラー

```
CRITICAL: Virtual account inventory depleted for purpose: CREATOR_PLAN
```

**対応**:
1. `virtual-accounts.json` に新しい口座を追加
2. `npm run import:virtual-accounts` を実行
3. ログを監視して、在庫が少なくなったらアラートを送る仕組みを検討

### 重複Webhook

同じ口座番号・金額・振込日時・振込人名義の組み合わせで重複チェックを行います。重複の場合はログに警告を出力し、既存のレコードを返します。

### Webhook認証失敗

```
Invalid webhook secret
```

**対応**:
- `.env` の `AUTOMATION_WEBHOOK_SECRET` とMake/Zapierの設定が一致しているか確認
- ヘッダー名が `X-Webhook-Secret` になっているか確認

---

## セキュリティ考慮事項

1. **Webhook認証**: シンプルなシークレット認証（環境変数管理）
2. **競合条件**: Prismaトランザクションで在庫引き当ての排他制御
3. **重複処理防止**: 口座番号・金額・振込日時・振込人名義の組み合わせで重複チェック
4. **エラーハンドリング**: 常にHTTP 200を返し、内部エラーはログに記録
5. **環境変数の保護**: `.env` ファイルを `.gitignore` に追加（既に追加済み）

---

## 注意事項

1. **FanProfile のマルチテナント性**:
   - 1ユーザーが複数クリエイターにファンとして登録可能
   - `assignedToUserId` のみを設定し、`fanId` は Webhook処理時に適切に特定する必要があります
   - 現在の実装では `virtualAccount.fanId` が事前設定されている前提で動作

2. **既存のGMO Webhookとの共存**:
   - `/webhooks/gmo/bank-transfer` - GMO公式Webhook
   - `/webhooks/automation/bank-transfer` - Make/Zapier Webhook
   - 両方のエンドポイントは別々に運用

3. **在庫切れ時の対応**:
   - 在庫が切れた場合、CRITICALレベルでログ出力
   - 管理者が手動で追加投入する必要があります
   - 在庫監視の自動化を推奨

4. **GMO API審査通過後**:
   - このシステムは暫定的なものです
   - GMO API審査通過後は、公式APIを使用した自動発行に移行してください

---

## トラブルシューティング

### データベース接続エラー

```bash
# Dockerコンテナが起動しているか確認
docker ps

# 起動していない場合
cd C:\dev\ACD\Creator
docker compose up -d
```

### マイグレーションエラー

```bash
# マイグレーションをリセット（開発環境のみ）
npx prisma migrate reset --schema=src/prisma/schema.prisma

# 再度マイグレーション実行
npx prisma migrate dev --schema=src/prisma/schema.prisma
```

### TypeScript型エラー

```bash
# Prisma Clientを再生成
npx prisma generate --schema=src/prisma/schema.prisma
```

---

## 今後の改善案

1. **在庫監視の自動化**
   - 在庫が一定数を下回ったらSlack/メール通知
   - 定期的な在庫レポート生成

2. **管理画面の実装**
   - 在庫状況のダッシュボード
   - 口座の一括インポート機能
   - 使用履歴の確認

3. **GMO API統合**
   - 審査通過後、自動発行APIに移行
   - 在庫システムとのハイブリッド運用

4. **ログ分析**
   - 振込パターンの分析
   - 不正利用の検知

---

## 関連ドキュメント

- [GMO_INTEGRATION_GUIDE.md](../../GMO_INTEGRATION_GUIDE.md) - GMO統合ガイド
- [GMO_API_USAGE.md](../../GMO_API_USAGE.md) - GMO API使用方法
- [FEE_CALCULATION_DESIGN.md](../../FEE_CALCULATION_DESIGN.md) - 手数料計算設計

---

## サポート

問題が発生した場合は、以下の情報を添えて開発チームに連絡してください:

1. エラーメッセージ
2. ログファイル
3. 実行したコマンド
4. 環境情報（OS, Node.js バージョン等）
