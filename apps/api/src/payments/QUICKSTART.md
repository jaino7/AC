# 支払いフロー テストクイックスタート

## 5分でテスト実行

### ステップ1: 環境設定

`.env`ファイルに以下を追加:

```env
# データベース接続（既存）
DATABASE_URL="postgresql://..."

# Webhook認証用シークレット（新規追加）
AUTOMATION_WEBHOOK_SECRET="test-secret-key-12345"

# 環境（開発環境）
NODE_ENV="development"
```

### ステップ2: データベースマイグレーション

```bash
# Prisma Clientを生成
npx prisma generate

# マイグレーション実行（必要に応じて）
npx prisma migrate dev
```

### ステップ3: テストデータ作成

```bash
# セットアップスクリプトを実行
npx ts-node src/payments/setup-test-data.ts
```

出力例:
```
========================================
セットアップ完了
========================================

以下の情報をテストスクリプトに設定してください:

CREATOR_ID="clxxx..."
FAN_USER_ID="clyyy..."
CREATOR_HANDLE="test-creator"
```

### ステップ4: APIサーバー起動

```bash
# 開発サーバーを起動
npm run start:dev
```

### ステップ5: テスト実行

#### オプションA: PowerShell（Windows）

1. `test-payment-flow.ps1`を開く
2. `CREATOR_ID`を**ステップ3**で取得した値に置き換え
3. `AUTOMATION_SECRET`を`.env`の値と同じにする
4. 実行:

```powershell
.\src\payments\test-payment-flow.ps1
```

#### オプションB: 手動テスト（curl）

```bash
# 1. ChargeRequestを作成
curl -X POST http://localhost:3000/api/payments/charge \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "creatorId": "clxxx..."
  }' | jq '.'

# レスポンスから accountNumber をコピー

# 2. Webhookシミュレーション
curl -X POST http://localhost:3000/webhooks/automation/bank-transfer \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: test-secret-key-12345" \
  -d '{
    "accountNumber": "1234567",
    "amount": 1000,
    "transferorName": "ヤマダタロウ",
    "transferDate": "2026-02-01T10:00:00.000Z"
  }' | jq '.'
```

### ステップ6: 結果確認

#### Prisma Studioで確認

```bash
npx prisma studio
```

確認項目:
1. **FanProfile** → `credits`が1000円増加
2. **CreditHistory** → チャージ履歴が作成されている
3. **ChargeRequest** → `status`が`APPROVED`
4. **VirtualAccount** → `isUsed`が`false`（在庫に戻る）
5. **BankTransfer** → `status`が`PROCESSED`

#### SQLで確認

```sql
-- FanProfileのクレジット残高
SELECT id, credits FROM "FanProfile" WHERE id = 'clyyy...';

-- 最新のCreditHistory
SELECT * FROM "CreditHistory"
ORDER BY "createdAt" DESC
LIMIT 5;

-- ChargeRequestの状態
SELECT id, amount, status FROM "ChargeRequest"
ORDER BY "createdAt" DESC
LIMIT 5;

-- BankTransferの処理状況
SELECT id, amount, status, "processedAt" FROM "BankTransfer"
ORDER BY "createdAt" DESC
LIMIT 5;
```

## 成功時の出力例

```
=========================================
支払いフロー統合テスト
=========================================

[1/4] ChargeRequestを作成中...
✓ ChargeRequest作成成功
  - ChargeRequest ID: clxxx...
  - 口座番号: 1234567

[2/4] バーチャル口座在庫を確認中...
在庫状況:
{
  "creatorPlan": { "total": 10, "used": 0, "available": 10 },
  "fanCredit": { "total": 15, "used": 1, "available": 14 }
}

[3/4] Webhook送信まで5秒待機...

[4/4] Webhookシミュレーションを送信中...
Webhookレスポンス:
{
  "success": true,
  "transactionId": "clzzz...",
  "message": "Webhook processed successfully"
}

=========================================
✓ 支払いフローテスト成功
=========================================
```

## トラブルシューティング

### エラー: "Virtual account inventory is currently unavailable"

**原因**: バーチャル口座の在庫不足

**解決策**:
```bash
# セットアップスクリプトを再実行
npx ts-node src/payments/setup-test-data.ts
```

### エラー: "Creator not found"

**原因**: 無効なクリエイターIDを指定

**解決策**:
```bash
# セットアップスクリプトで作成されたIDを使用
npx ts-node src/payments/setup-test-data.ts
```

### エラー: "Invalid webhook secret"

**原因**: `.env`とテストスクリプトのシークレットが不一致

**解決策**: 両方を同じ値に設定
```env
# .env
AUTOMATION_WEBHOOK_SECRET="test-secret-key-12345"
```

```powershell
# test-payment-flow.ps1
$AUTOMATION_SECRET = "test-secret-key-12345"
```

### エラー: "Connection refused"

**原因**: APIサーバーが起動していない

**解決策**:
```bash
npm run start:dev
```

## 次のステップ

1. フロントエンド連携
   - 決済画面でChargeRequest作成
   - 振込情報（口座番号、振込期限）を表示
   - 入金確認画面の実装

2. 通知機能の追加
   - 入金完了メール送信
   - クレジット残高の表示

3. 期限切れ処理
   - Cronジョブで定期的に`/webhooks/virtual-accounts/release-expired`を実行
   - 7日経過したChargeRequestを自動でEXPIREDに変更

4. 本番環境設定
   - GMO Webhookの署名検証を有効化
   - IPアドレス制限の設定
   - 本番用の環境変数設定
