# CSV Import Guide - Virtual Accounts

## Overview

実際のバーチャル口座データをCSVファイルからインポートするガイドです。

## 前提条件

1. **CSVファイル:** GMOあおぞらネット銀行から提供されたバーチャル口座リスト
2. **エンコーディング:** Shift_JIS
3. **フォーマット:**
   ```csv
   支店,支店名(カナ),口座番号,口座名義,口座タイプ,...
   579,ペーパーレス支店,6945838,イノマタ シンスケ,バーチャ,...
   ```

## セットアップ

### 1. 依存関係のインストール

```bash
cd apps/api
npm install
```

これにより、`iconv-lite`（文字エンコーディング変換用）がインストールされます。

### 2. マイグレーション実行

```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx prisma generate --schema=./prisma/schema.prisma
```

## インポート実行

### コマンド構文

```bash
npm run import:csv <csv-file-path> <purpose>
```

**パラメータ:**
- `<csv-file-path>`: CSVファイルのパス
- `<purpose>`: `CREATOR_PLAN` または `FAN_CREDIT`

### 例1: クリエイタープラン用口座をインポート

```bash
cd apps/api
npm run import:csv "c:\Users\仕事用\Downloads\account_list.csv" CREATOR_PLAN
```

### 例2: ファンクレジット用口座をインポート

```bash
cd apps/api
npm run import:csv "c:\Users\仕事用\Downloads\fan_accounts.csv" FAN_CREDIT
```

## 実行結果

### 成功時

```
Starting CSV import...

CSV file: c:\Users\仕事用\Downloads\account_list.csv
Purpose: CREATOR_PLAN

Found 100 accounts in CSV file

✅ Imported: 6945838 (イノマタ シンスケ)
✅ Imported: 6945846 (イノマタ シンスケ)
✅ Imported: 6945854 (イノマタ シンスケ)
...
⏭️  Skipped (already exists): 6945862
⏭️  Skipped (invalid format): Line 25
❌ Error importing 6945999: Database error

============================================================
Import Summary:
============================================================
✅ Successfully imported: 95
⏭️  Skipped (duplicates):  3
❌ Errors:                2
📊 Total processed:       100
============================================================

Current Inventory Status:
  CREATOR_PLAN available: 95
  FAN_CREDIT available:   0
```

## CSVファイルのカラム構成

インポートスクリプトは以下のカラムを使用します:

| Index | カラム名 | 使用用途 | 例 |
|-------|---------|---------|-----|
| 0 | 支店コード | branchCode | 579 |
| 1 | 支店名 | (参考情報) | ペーパーレス支店 |
| 2 | 口座番号 | accountNumber | 6945838 |
| 3 | 口座名義 | accountName | イノマタ シンスケ |
| 4+ | その他 | (無視) | - |

## 重複チェック

- 既に同じ `accountNumber` が登録されている場合はスキップされます
- 重複は `⏭️  Skipped (already exists)` として表示されます

## エラーハンドリング

### よくあるエラー

#### 1. ファイルが見つからない

```
Error: CSV file not found at c:\path\to\file.csv
```

**解決策:** ファイルパスを確認してください。Windowsの場合、パスを引用符で囲んでください。

#### 2. 無効なpurpose

```
Error: Invalid purpose. Must be CREATOR_PLAN or FAN_CREDIT
```

**解決策:** 第2引数を `CREATOR_PLAN` または `FAN_CREDIT` に設定してください。

#### 3. 文字化け

CSVファイルがShift_JIS以外のエンコーディングの場合、文字化けする可能性があります。

**解決策:**
```bash
# UTF-8に変換
iconv -f SHIFT_JIS -t UTF-8 account_list.csv > account_list_utf8.csv
```

その後、スクリプトの `iconv.decode(csvBuffer, 'shift_jis')` を `iconv.decode(csvBuffer, 'utf8')` に変更。

## インポート後の確認

### 1. データベースで確認

```sql
-- 登録された口座数
SELECT purpose, COUNT(*) as count
FROM "VirtualAccount"
GROUP BY purpose;

-- 最新の登録口座
SELECT *
FROM "VirtualAccount"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### 2. API経由で確認

```bash
# 在庫状況
curl http://localhost:3001/api/virtual-accounts/inventory

# レスポンス例
{
  "creatorPlan": {
    "total": 95,
    "used": 0,
    "available": 95
  },
  "fanCredit": {
    "total": 0,
    "used": 0,
    "available": 0
  }
}
```

## 実際の割り当てテスト

### クリエイタープラン用口座のテスト

```bash
# 1. プラン選択
curl -X POST http://localhost:3001/api/payments/creator-plan \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <creator-id>" \
  -d '{
    "creatorId": "<creator-id>",
    "planType": "LITE",
    "isYearly": false
  }'

# 2. レスポンスで実際の口座番号を確認
{
  "subscriptionId": "...",
  "planName": "Lite",
  "amount": 4980,
  "virtualAccount": {
    "accountNumber": "6945838",  // 実際の口座番号
    "accountName": "イノマタ シンスケ",
    "branchCode": "579"
  }
}
```

### ファンクレジット用口座のテスト

```bash
curl -X POST http://localhost:3001/api/fans/credits/charge \
  -H "Content-Type: application/json" \
  -d '{
    "creatorId": "<creator-id>",
    "amount": 10000
  }'
```

## 複数ファイルのインポート

異なる用途の口座を別々にインポートする場合:

```bash
# クリエイタープラン用（100口座）
npm run import:csv "creator_accounts.csv" CREATOR_PLAN

# ファンクレジット用（500口座）
npm run import:csv "fan_accounts.csv" FAN_CREDIT
```

## 口座用途の変更

既にインポート済みの口座の用途（purpose）を変更する場合:

### コマンド構文

```bash
npm run update:purpose <csv-file-path> <new-purpose>
```

**パラメータ:**
- `<csv-file-path>`: CSVファイルのパス（変更したい口座のリスト）
- `<new-purpose>`: 新しい用途（`CREATOR_PLAN` または `FAN_CREDIT`）

### 例: FAN_CREDITからCREATOR_PLANに変更

```bash
cd apps/api
npm run update:purpose "c:\\Users\\仕事用\\Downloads\\account_list.csv" CREATOR_PLAN
```

### 実行結果

```
Updating account purposes from CSV...

CSV file: c:\Users\仕事用\Downloads\account_list.csv
Target purpose: CREATOR_PLAN

Found 100 account numbers in CSV

✅ Updated: 6945838 (FAN_CREDIT → CREATOR_PLAN)
✅ Updated: 6945846 (FAN_CREDIT → CREATOR_PLAN)
...

============================================================
Update Summary:
============================================================
✅ Successfully updated: 100
⏭️  Not found in DB:     0
📊 Total processed:      100
============================================================

Updated Inventory Status:
  CREATOR_PLAN available: 103
  FAN_CREDIT available:   6
```

**注意:** このコマンドは既存のデータベースレコードを更新します。実行前に必ず目的を確認してください。

## トラブルシューティング

### メモリ不足エラー

大量の口座（10,000+）をインポートする場合、メモリ不足になる可能性があります。

**解決策:** バッチ処理
```bash
# CSVを分割（1000行ごと）
split -l 1000 account_list.csv account_batch_

# 各バッチをインポート
for file in account_batch_*; do
  npm run import:csv "$file" CREATOR_PLAN
done
```

### データベース接続エラー

```
Error: Connection refused
```

**解決策:**
1. PostgreSQLが起動しているか確認
   ```bash
   docker compose ps
   ```

2. 環境変数を確認
   ```bash
   cat .env | grep DATABASE_URL
   ```

### 既存データのクリア（注意）

**警告:** 本番環境では実行しないでください！

```sql
-- 開発環境でのみ実行
DELETE FROM "VirtualAccount" WHERE "isUsed" = false;
```

## まとめ

1. CSVファイルを準備
2. 依存関係をインストール (`npm install`)
3. マイグレーション実行 (`npx prisma migrate deploy`)
4. インポート実行 (`npm run import:csv <path> <purpose>`)
5. 確認 (`curl http://localhost:3001/api/virtual-accounts/inventory`)

## 関連ドキュメント

- [Virtual Account Optimization](../../../VIRTUAL_ACCOUNT_OPTIMIZATION.md)
- [Virtual Account Payment Flow](../../../VIRTUAL_ACCOUNT_PAYMENT_FLOW.md)
- [Import Accounts Script](./import-accounts.ts)
