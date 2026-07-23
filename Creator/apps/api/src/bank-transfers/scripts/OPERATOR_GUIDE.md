# 運営者向けガイド - バーチャル口座管理

## 口座在庫の確認方法

### 方法1: 専用スクリプト（推奨）

最も簡単で詳細な情報が得られます。

```bash
cd apps/api
npm run check:inventory
```

**表示される情報:**
- CREATOR_PLAN/FAN_CREDIT別の在庫数（合計、使用中、利用可能）
- 使用中の口座一覧（どのクリエイターに割り当てられているか）
- 利用可能な口座のサンプル
- 在庫アラート（残り少ない場合）

**出力例:**
```
======================================================================
バーチャル口座在庫状況
======================================================================

📊 CREATOR_PLAN（クリエイタープラン用）
   合計: 100口座
   使用中: 1口座
   利用可能: 99口座

📊 FAN_CREDIT（ファンクレジット用）
   合計: 3口座
   使用中: 0口座
   利用可能: 3口座

======================================================================
使用中の口座一覧
======================================================================

CREATOR_PLAN使用中:
  口座番号: 6945838 | クリエイター: ownstage3m1124 (S I) | 割当日: 2026/2/4 22:54:01
```

### 方法2: Prisma Studio（データベースGUI）

データベースを直接確認できます。

```bash
cd apps/api
npx prisma studio --schema=./src/prisma/schema.prisma
```

ブラウザが開いたら:
1. 左メニューから `VirtualAccount` を選択
2. フィルタで確認:
   - `isUsed = false` で利用可能な口座
   - `purpose = CREATOR_PLAN` でクリエイタープラン用
   - `purpose = FAN_CREDIT` でファンクレジット用

### 方法3: SQLクエリ

PostgreSQLに直接接続している場合:

```sql
-- 在庫サマリー
SELECT
  purpose,
  COUNT(*) as total,
  SUM(CASE WHEN "isUsed" = true THEN 1 ELSE 0 END) as used,
  SUM(CASE WHEN "isUsed" = false THEN 1 ELSE 0 END) as available
FROM "VirtualAccount"
WHERE "isActive" = true
GROUP BY purpose;

-- 利用可能な口座一覧
SELECT "accountNumber", "accountName", "branchCode", purpose
FROM "VirtualAccount"
WHERE "isUsed" = false AND "isActive" = true
ORDER BY purpose, "accountNumber";

-- 使用中の口座とクリエイター情報
SELECT
  va."accountNumber",
  va."accountName",
  va.purpose,
  va."assignedAt",
  c.handle as creator_handle,
  c."displayName" as creator_name
FROM "VirtualAccount" va
LEFT JOIN "Creator" c ON va."creatorId" = c.id
WHERE va."isUsed" = true
ORDER BY va."assignedAt" DESC;
```

### 方法4: API経由（開発中の場合）

将来的に管理画面を作る場合のAPI:

```bash
# 在庫状況を取得
curl http://localhost:3001/api/virtual-accounts/inventory

# レスポンス例
{
  "creatorPlan": {
    "total": 100,
    "used": 1,
    "available": 99
  },
  "fanCredit": {
    "total": 3,
    "used": 0,
    "available": 3
  }
}
```

## 在庫管理のベストプラクティス

### 推奨在庫数

- **CREATOR_PLAN:** 最低50口座を維持
  - 理由: クリエイターは固定口座を使用し、解約しても回収に時間がかかる

- **FAN_CREDIT:** 最低100口座を維持
  - 理由: ファンのクレジット購入は一時的に大量に使用される可能性がある

### アラート基準

スクリプトは以下の場合にアラートを表示します:

- CREATOR_PLAN: 残り10口座未満
- FAN_CREDIT: 残り50口座未満

### 定期チェック

**推奨頻度:**
- 週1回: 在庫状況の確認
- 月1回: CSVで新規口座をインポート（必要に応じて）

**チェックコマンド:**
```bash
cd apps/api
npm run check:inventory
```

## 追加口座のインポート

在庫が少なくなったら、GMOから新しいCSVファイルを受け取ってインポート:

```bash
# 新しい口座をインポート
npm run import:csv "path/to/new_accounts.csv" CREATOR_PLAN
# または
npm run import:csv "path/to/new_accounts.csv" FAN_CREDIT
```

## トラブルシューティング

### 問題: 在庫があるのに割り当てられない

**確認項目:**
1. `isActive = true` になっているか
2. `isUsed = false` になっているか
3. `creatorId = null` になっているか（CREATOR_PLANの場合）

**解決方法:**
```sql
-- 問題のある口座をリセット
UPDATE "VirtualAccount"
SET "isUsed" = false, "creatorId" = null, "assignedToPaymentId" = null
WHERE "accountNumber" = '口座番号';
```

### 問題: 重複した口座がある

**確認:**
```sql
SELECT "accountNumber", COUNT(*)
FROM "VirtualAccount"
GROUP BY "accountNumber"
HAVING COUNT(*) > 1;
```

**解決方法:**
```sql
-- 古い方を削除（手動で確認してから実行）
DELETE FROM "VirtualAccount"
WHERE id IN (
  SELECT id FROM "VirtualAccount"
  WHERE "accountNumber" = '重複している口座番号'
  ORDER BY "createdAt" DESC
  OFFSET 1
);
```

## 関連コマンド一覧

```bash
# 在庫確認
npm run check:inventory

# CSVインポート
npm run import:csv "<csv-path>" <CREATOR_PLAN|FAN_CREDIT>

# 口座用途の変更
npm run update:purpose "<csv-path>" <CREATOR_PLAN|FAN_CREDIT>

# Prisma Studio起動
npx prisma studio --schema=./src/prisma/schema.prisma
```

## 緊急時の連絡先

- GMOあおぞらネット銀行サポート: [連絡先を記載]
- 開発チーム: [連絡先を記載]
