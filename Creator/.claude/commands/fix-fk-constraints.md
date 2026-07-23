# Prisma Studio でレコードが削除できない問題の対処法

## 症状

Prisma Studio（http://localhost:5555）でレコードを削除しようとすると以下のようなエラーが出る。

```
Foreign key constraint failed on the field: `xxx`
```

または PostgreSQL 側で：

```
ERROR: update or delete on table "xxx" violates foreign key constraint
```

## 原因

PostgreSQL の外部キー制約が `RESTRICT` になっているテーブルが存在すると、
親レコードを削除したときに子レコードが残っているとエラーになる。

**Prisma で `onDelete` を指定しない必須リレーション（nullable でないフィールド）は
デフォルトで `RESTRICT` になる。**

## 確認コマンド

### 現在の RESTRICT な FK 制約を確認する

```bash
docker exec creator-db-1 psql -U myuser -d mydb -c "
SELECT tc.table_name, kcu.column_name, ccu.table_name AS ref_table, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND rc.delete_rule = 'RESTRICT';
"
```

### 特定テーブルへの全 FK 制約を確認する（例: User）

```bash
docker exec creator-db-1 psql -U myuser -d mydb -c "
SELECT tc.table_name AS child, kcu.column_name AS fk_col, ccu.table_name AS parent, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'User'
ORDER BY child;
"
```

## 修正手順

### 1. `prisma/schema.prisma` を修正する

問題のあるリレーションに `onDelete: Cascade` または `onDelete: SetNull` を追加する。

**例（今回の修正内容）：**

```prisma
// 修正前 - RESTRICT になってしまう
model CreatorPayout {
  bankAccountId String
  bankAccount   BankAccount @relation(fields: [bankAccountId], references: [id])
}

// 修正後
model CreatorPayout {
  bankAccountId String
  bankAccount   BankAccount @relation(fields: [bankAccountId], references: [id], onDelete: Cascade)
}
```

**どちらを選ぶか：**

| 削除ルール | 使うケース |
|-----------|-----------|
| `onDelete: Cascade` | 親が消えたら子も消してよい場合 |
| `onDelete: SetNull` | 親が消えても子は残したい場合（フィールドは nullable にする） |
| `onDelete: Restrict` | 子が存在する間は親を削除禁止にしたい場合 |

### 2. DB に反映する

`prisma migrate dev` がエラーになる場合は `db push` を使う：

```bash
node node_modules/prisma/build/index.js db push
```

> `migrate dev` が失敗する場合（shadow DB エラー）は `db push` で直接反映できる。
> ただし `db push` はマイグレーション履歴に記録されないので注意。

### 3. 確認

再度 RESTRICT な制約がないか確認する（上記の確認コマンドを実行）。

---

## 過去の修正履歴

| 日付 | 修正内容 |
|------|---------|
| 2026-03-04 | `CreatorPayout.bankAccountId → BankAccount` を RESTRICT → CASCADE に変更 |

---

## 注意：削除してはいけない RESTRICT

以下は意図的に RESTRICT のまま残している制約：

| テーブル | カラム | 参照先 | 理由 |
|---------|-------|--------|------|
| `CreatorSubscription` | `planId` | `CreatorPlan` | マスターデータ（プラン）は削除しない前提 |
