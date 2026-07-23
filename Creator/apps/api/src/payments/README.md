# Payments Module - Testing Guide

## 概要

このモジュールは、ファンがクレジットをチャージするための決済フローを提供します。

## テスト方法

### 前提条件

1. APIサーバーが起動していること（`http://localhost:3000`）
2. データベースにVirtualAccountの在庫が存在すること
3. テスト用のクリエイターIDを用意すること
4. `.env`に`AUTOMATION_WEBHOOK_SECRET`が設定されていること

### テストスクリプト

#### 1. PowerShell版（Windows推奨）

```powershell
# ファイルを編集してCREATOR_IDとAUTOMATION_SECRETを設定
notepad test-payment-flow.ps1

# 実行
.\test-payment-flow.ps1
```

#### 2. Bash版（macOS/Linux）

```bash
# ファイルを編集してCREATOR_IDとAUTOMATION_SECRETを設定
nano test-payment-flow.sh

# 実行権限を付与
chmod +x test-payment-flow.sh

# 実行
./test-payment-flow.sh
```

#### 3. REST Client版（VS Code拡張機能）

1. VS Codeに「REST Client」拡張機能をインストール
2. `test-payment-flow.http`を開く
3. ファイル内の`@creatorId`と`@automationSecret`を編集
4. 各リクエストの上にある「Send Request」をクリック

### 手動テスト（curl）

#### ステップ1: ChargeRequestを作成

```bash
curl -X POST http://localhost:3000/api/payments/charge \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "creatorId": "YOUR_CREATOR_ID"
  }'
```

レスポンス例:
```json
{
  "chargeRequestId": "clxxx...",
  "amount": 1000,
  "identifierCode": "123456",
  "expiresAt": "2026-02-08T...",
  "virtualAccount": {
    "accountNumber": "1234567",
    "accountName": "GMOアオゾラネット",
    "branchCode": "001"
  }
}
```

#### ステップ2: 在庫確認

```bash
curl http://localhost:3000/webhooks/virtual-accounts/inventory
```

#### ステップ3: Webhookシミュレーション

レスポンスから取得した`accountNumber`を使用:

```bash
curl -X POST http://localhost:3000/webhooks/automation/bank-transfer \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-automation-webhook-secret" \
  -d '{
    "accountNumber": "1234567",
    "amount": 1000,
    "transferorName": "ヤマダタロウ",
    "transferDate": "2026-02-01T10:00:00.000Z"
  }'
```

### 検証項目

Webhook送信後、以下をデータベースで確認:

1. **FanProfile.credits**: 1000円増加していること
2. **CreditHistory**: チャージ履歴が作成されていること
3. **ChargeRequest.status**: `APPROVED`になっていること
4. **VirtualAccount.isUsed**: `false`に戻っていること（在庫に戻る）
5. **BankTransfer**: レコードが作成され、`status`が`PROCESSED`であること

## トラブルシューティング

### エラー: "Virtual account inventory is currently unavailable"

在庫が不足しています。以下のスクリプトで在庫を追加:

```bash
# apps/api/src/bank-transfers/scripts/import-accounts.ts を実行
npm run import-accounts
```

### エラー: "Creator not found"

正しいクリエイターIDを指定してください。データベースから取得:

```sql
SELECT id, handle FROM "CreatorProfile" LIMIT 5;
```

### エラー: "Invalid webhook secret"

`.env`の`AUTOMATION_WEBHOOK_SECRET`とテストスクリプトの値が一致していることを確認してください。

## 本番環境での利用

本番環境では、実際の銀行振込後にGMOまたは自動化ツール（Make/Zapier）からWebhookが送信されます。

- GMO Webhook: `POST /webhooks/gmo/bank-transfer`（署名検証あり）
- Automation Webhook: `POST /webhooks/automation/bank-transfer`（シークレット認証）

開発環境でのみ`/webhooks/gmo/test`エンドポイントが利用可能です。
