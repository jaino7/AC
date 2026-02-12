# CocoBa 本番デプロイガイド

このガイドは、VultrのVPS（AlmaLinux 8）上でCocoBaプロジェクトをデプロイする手順を記載しています。

## 前提条件

- ✅ AlmaLinux 8環境
- ✅ SSH鍵認証設定済み
- ✅ cocobaユーザー（sudo権限あり）
- ✅ Node.js、Docker、Docker Compose インストール済み
- ✅ PostgreSQLがDocker Composeで起動中

---

## ステップ1: GitHubデプロイキーの設定

### 1-1. サーバー側でSSH鍵を生成

```bash
cd ~/.ssh
ssh-keygen -t ed25519 -C "deploy@cocoba" -f github_deploy
# パスフレーズは空でEnter
```

### 1-2. 公開鍵をコピー

```bash
cat ~/.ssh/github_deploy.pub
```

### 1-3. GitHubに登録

1. リポジトリの **Settings** → **Deploy keys** → **Add deploy key**
2. Title: `Vultr Production Server`
3. Key: コピーした公開鍵を貼り付け
4. **Add key** をクリック

### 1-4. SSH設定

```bash
nano ~/.ssh/config
```

以下を追加：

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  StrictHostKeyChecking no
```

保存して閉じる（`Ctrl+X` → `Y` → `Enter`）

```bash
chmod 600 ~/.ssh/config
```

---

## ステップ2: リポジトリのクローン

```bash
mkdir -p ~/apps
cd ~/apps
git clone git@github.com:YOUR_USERNAME/Creator.git cocoba
cd cocoba
```

**注意**: `YOUR_USERNAME`を実際のGitHubユーザー名に置き換えてください。

---

## ステップ3: 環境変数の設定

### 3-1. APIの環境変数

```bash
cd ~/apps/cocoba/apps/api
cp .env.production .env
nano .env
```

**重要な設定項目:**

```env
# データベースパスワードを変更
DATABASE_URL="postgresql://cocoba:STRONG_PASSWORD@localhost:5432/cocoba?schema=public"

# 各種APIキーを設定
GMO_API_KEY=your_actual_key
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_key
# ... 他のキーも設定
```

### 3-2. Webの環境変数

```bash
cd ~/apps/cocoba/apps/web
cp .env.local.production .env.local
nano .env.local
```

**シークレットキーの生成:**

```bash
# NEXTAUTHシークレット
openssl rand -base64 32

# CRONシークレット
openssl rand -base64 32

# 管理者パスキー
openssl rand -hex 16
```

生成した値を`.env.local`に設定してください。

---

## ステップ4: PostgreSQLデータベースの準備

### 4-1. Docker Composeの編集

```bash
cd ~/app-data
nano docker-compose.yml
```

以下のように変更：

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      - POSTGRES_USER=cocoba
      - POSTGRES_PASSWORD=STRONG_PASSWORD  # 3-1で設定したものと同じ
      - POSTGRES_DB=cocoba
    command: postgres -c max_connections=200 -c shared_buffers=256MB
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 4-2. PostgreSQLの再起動

```bash
docker compose down
docker compose up -d
```

### 4-3. データベース接続確認

```bash
docker exec -it app-data-db-1 psql -U cocoba -d cocoba
# 接続できたら \q で終了
```

---

## ステップ5: 依存関係のインストール

```bash
cd ~/apps/cocoba

# Node.jsバージョンの確認
node -v  # v20以上推奨

# 必要に応じて切り替え
nvm use 20

# 依存関係のインストール
npm install
```

---

## ステップ6: データベースのマイグレーション

```bash
cd ~/apps/cocoba

# Prismaクライアントの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate deploy

# 初期データの投入（必要な場合）
npx prisma db seed
```

---

## ステップ7: アプリケーションのビルド

### 7-1. APIのビルド

```bash
cd ~/apps/cocoba/apps/api
npm run build
```

### 7-2. Webのビルド

```bash
cd ~/apps/cocoba/apps/web
npm run build
```

**ビルドが成功したら次へ進みます。**

---

## ステップ8: PM2のセットアップ

### 8-1. PM2のグローバルインストール

```bash
npm install -g pm2
```

### 8-2. ログディレクトリの作成

```bash
cd ~/apps/cocoba
mkdir -p logs
```

### 8-3. PM2でアプリを起動

```bash
pm2 start ecosystem.config.js
```

### 8-4. 状態確認

```bash
# ステータス確認
pm2 status

# ログをリアルタイムで表示
pm2 logs

# 特定のアプリのログ
pm2 logs cocoba-api
pm2 logs cocoba-web
```

### 8-5. PM2の自動起動設定

```bash
# スタートアップスクリプトの生成
pm2 startup

# 上記コマンドで表示されたsudoコマンドをコピー&実行
# 例: sudo env PATH=$PATH:/home/cocoba/.nvm/versions/node/v20.x.x/bin ...

# 現在の状態を保存
pm2 save
```

---

## ステップ9: 動作確認

### 9-1. APIの確認

```bash
curl http://localhost:3001
# または
curl http://localhost:3001/api/health  # ヘルスチェックエンドポイントがある場合
```

### 9-2. Webの確認

```bash
curl http://localhost:3000
```

### 9-3. ブラウザからアクセス

サーバーのIPアドレスを使ってブラウザでアクセス：

- Web: `http://YOUR_SERVER_IP:3000`
- API: `http://YOUR_SERVER_IP:3001`

---

## ステップ10: ファイアウォール設定（重要）

```bash
# ファイアウォールの状態確認
sudo firewall-cmd --state

# HTTP/HTTPSポートを開放
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# アプリケーションポートを開放（必要に応じて）
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp

# 設定を反映
sudo firewall-cmd --reload

# 設定確認
sudo firewall-cmd --list-all
```

---

## 🔄 よく使うコマンド

### PM2関連

```bash
# アプリの再起動
pm2 restart all

# アプリの停止
pm2 stop all

# アプリの削除
pm2 delete all

# ログの確認
pm2 logs

# メモリ使用状況の確認
pm2 monit
```

### デプロイ更新（コード変更時）

```bash
cd ~/apps/cocoba

# 最新コードを取得
git pull origin main

# 依存関係の更新（package.jsonに変更がある場合）
npm install

# Prismaの再生成（schema.prismaに変更がある場合）
npx prisma generate
npx prisma migrate deploy

# ビルド
cd apps/api && npm run build
cd ../web && npm run build

# アプリの再起動
cd ~/apps/cocoba
pm2 restart all
```

---

## 🚨 トラブルシューティング

### ビルドエラー

```bash
# node_modulesをクリーンインストール
rm -rf node_modules package-lock.json
npm install
```

### データベース接続エラー

```bash
# PostgreSQLの状態確認
docker ps
docker logs app-data-db-1

# 環境変数の確認
cat apps/api/.env | grep DATABASE_URL
```

### ポート競合

```bash
# ポート使用状況の確認
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001

# PM2を停止
pm2 stop all
pm2 delete all
```

### ログの確認

```bash
# PM2ログ
pm2 logs

# アプリケーション別ログ
cat ~/apps/cocoba/logs/api-error.log
cat ~/apps/cocoba/logs/web-error.log
```

---

## 📝 次のステップ（推奨）

1. **Nginxのセットアップ**: リバースプロキシとして80/443ポートで公開
2. **SSL証明書の取得**: Let's Encryptで無料SSL証明書
3. **カスタムドメインの設定**: DNSレコードの設定
4. **監視設定**: UptimeRobot、DataDog等
5. **バックアップ設定**: データベースの定期バックアップ

---

## ✅ デプロイ完了チェックリスト

- [ ] GitHubデプロイキー設定完了
- [ ] リポジトリのクローン完了
- [ ] 環境変数の設定完了（API + Web）
- [ ] PostgreSQL起動確認
- [ ] Prismaマイグレーション完了
- [ ] API & Webビルド成功
- [ ] PM2でアプリ起動成功
- [ ] ブラウザからアクセス確認
- [ ] ファイアウォール設定完了
- [ ] PM2自動起動設定完了

全てチェックできたら、本番環境デプロイ完了です！🎉
