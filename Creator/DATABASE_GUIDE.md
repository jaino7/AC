# データベース確認ガイド

このガイドでは、Creatorプロジェクトのデータベースを確認する方法を説明します。

## 方法1: Prisma Studio（推奨）

Prisma Studioは、データベースを視覚的に確認・編集できるGUIツールです。

### 起動方法

```bash
node node_modules/prisma/build/index.js studio
```

または、PowerShellの実行ポリシーが設定されている場合：

```bash
npx prisma studio
```

### 使い方

1. コマンドを実行すると、ブラウザが自動的に開きます（通常は `http://localhost:5555`）
2. 左側のサイドバーから確認したいテーブルを選択
3. データの閲覧、追加、編集、削除が可能

### 確認できる内容

- すべてのテーブルとデータ
- リレーション（関連データ）
- レコードの追加・編集・削除

---

## 方法2: PostgreSQL CLIツール（psql）

PostgreSQLに直接接続してSQLコマンドで確認する方法です。

### 接続方法

```bash
# .envファイルのDATABASE_URLを確認
# 例: postgresql://user:password@localhost:5432/mydb

# psqlで接続
psql -h localhost -p 5432 -U user -d mydb
```

### よく使うコマンド

```sql
-- データベース一覧
\l

-- テーブル一覧
\dt

-- テーブル構造の確認
\d "User"
\d "CreatorProfile"
\d "Transaction"

-- データの確認
SELECT * FROM "User";
SELECT * FROM "CreatorProfile";
SELECT * FROM "Transaction";

-- レコード数の確認
SELECT COUNT(*) FROM "User";

-- リレーションを含むクエリ
SELECT u.email, cp.handle, cp.displayName 
FROM "User" u 
LEFT JOIN "CreatorProfile" cp ON u.id = cp."userId";

-- 終了
\q
```

---

## 方法3: Prismaマイグレーションステータス確認

マイグレーションの適用状況を確認できます。

```bash
node node_modules/prisma/build/index.js migrate status
```

### 確認できる内容

- 適用済みのマイグレーション一覧
- 未適用のマイグレーション
- データベースとスキーマの同期状態

---

## 方法4: Node.jsスクリプトでの確認

Prisma Clientを使ってデータを確認するスクリプトを作成できます。

### スクリプト例: `scripts/check-db.js`

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // ユーザー数を確認
  const userCount = await prisma.user.count();
  console.log(`Total Users: ${userCount}`);

  // クリエイタープロフィール一覧
  const creators = await prisma.creatorProfile.findMany({
    include: {
      user: true,
      plans: true,
    },
  });
  console.log('\nCreators:');
  creators.forEach(creator => {
    console.log(`- ${creator.handle} (${creator.user.email})`);
  });

  // トランザクション一覧
  const transactions = await prisma.transaction.findMany({
    include: {
      creator: true,
    },
    take: 10,
  });
  console.log(`\nRecent Transactions: ${transactions.length}`);

  // ドメイン一覧
  const domains = await prisma.domain.findMany({
    include: {
      creator: true,
    },
  });
  console.log(`\nCustom Domains: ${domains.length}`);
  domains.forEach(domain => {
    console.log(`- ${domain.domain} (${domain.status})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 実行方法

```bash
node scripts/check-db.js
```

---

## 方法5: データベース管理ツール

### DBeaver（無料・推奨）

1. [DBeaver](https://dbeaver.io/)をダウンロード・インストール
2. 新規接続 → PostgreSQL を選択
3. 接続情報を入力（`.env`の`DATABASE_URL`から取得）
   - Host: `localhost`
   - Port: `5432`
   - Database: `mydb`
   - Username: ユーザー名
   - Password: パスワード
4. 接続テスト → 保存

### その他のツール

- **pgAdmin**: PostgreSQL公式GUIツール
- **TablePlus**: macOS/Windows対応の有料ツール（無料版あり）
- **DataGrip**: JetBrains製の有料IDE

---

## 現在のデータベース構造

### 主要テーブル

| テーブル名 | 説明 |
|-----------|------|
| `User` | ユーザー基本情報 |
| `Account` | OAuth認証アカウント |
| `Session` | セッション管理 |
| `CreatorProfile` | クリエイタープロフィール |
| `SubscriptionPlan` | サブスクリプションプラン |
| `Subscription` | サブスクリプション契約 |
| `Post` | コンテンツ投稿 |
| `Media` | メディアファイル |
| `Transaction` | 収益トランザクション ⭐ 新規 |
| `BankAccount` | 振込先口座情報 ⭐ 新規 |
| `Domain` | カスタムドメイン ⭐ 新規 |

### Enum型

| Enum名 | 値 |
|--------|-----|
| `Role` | USER, CREATOR, ADMIN |
| `TransactionStatus` | PENDING, PAID, FAILED, REFUNDED ⭐ 新規 |
| `DomainStatus` | PENDING, VERIFYING, ACTIVE, FAILED, DISCONNECTED ⭐ 新規 |

---

## トラブルシューティング

### Prisma Studioが起動しない

```bash
# Prisma Clientを再生成
node node_modules/prisma/build/index.js generate

# 再度起動
node node_modules/prisma/build/index.js studio
```

### データベースに接続できない

1. PostgreSQLが起動しているか確認
   ```bash
   # Dockerの場合
   docker ps
   
   # 起動していない場合
   docker-compose up -d
   ```

2. `.env`ファイルの`DATABASE_URL`が正しいか確認

3. データベースが存在するか確認
   ```bash
   psql -h localhost -p 5432 -U user -l
   ```

### マイグレーションエラー

```bash
# マイグレーションステータス確認
node node_modules/prisma/build/index.js migrate status

# データベースをリセット（開発環境のみ！）
node node_modules/prisma/build/index.js migrate reset --force
```

---

## 参考リンク

- [Prisma Studio ドキュメント](https://www.prisma.io/docs/concepts/components/prisma-studio)
- [Prisma Client ドキュメント](https://www.prisma.io/docs/concepts/components/prisma-client)
- [PostgreSQL ドキュメント](https://www.postgresql.org/docs/)
