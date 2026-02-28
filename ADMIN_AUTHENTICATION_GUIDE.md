# 管理画面認証ガイド

## 🔐 概要

管理画面 (`/admin/*`) にADMIN認証ガードを実装しました。
ADMINロールを持つユーザーのみがアクセス可能です。

---

## ✅ 実装内容

### 1. Admin Layout 認証ガード
**ファイル:** `apps/web/app/admin/layout.tsx`

**機能:**
- ✅ セッションチェック（ログイン必須）
- ✅ ADMINロールチェック（ADMIN権限必須）
- ✅ 非認証ユーザーはログインページへリダイレクト
- ✅ 非ADMINユーザーは403ページへリダイレクト
- ✅ 管理画面ヘッダー・ナビゲーション表示

### 2. 403 Forbidden ページ
**ファイル:** `apps/web/app/forbidden/page.tsx`

権限のないユーザーがアクセスした場合に表示されます。

### 3. 管理者ユーザー作成スクリプト
**ファイル:** `scripts/create-admin-user.ts`

コマンドラインからADMINユーザーを作成できます。

---

## 🚀 使用方法

### ステップ1: PathKeyを生成して設定

```bash
# 秘密キーを生成
openssl rand -hex 16

# 出力例: a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2

# .env.local に追加
ADMIN_PATH_KEY="a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2"
```

### ステップ2: ADMINユーザーを作成

```bash
# 基本的な使い方
npm run create-admin <email> <password> [name]

# 例1: 名前を指定
npm run create-admin admin@cocoba.com SecurePass123 "管理者"

# 例2: 名前を省略（デフォルト: "Admin"）
npm run create-admin admin@cocoba.com SecurePass123
```

**出力例:**
```
✅ ADMINユーザーを作成しました！
   Email: admin@cocoba.com
   Name: 管理者
   Role: ADMIN
   ID: clxxx...
```

### ステップ3: 管理者メールアドレスを設定

`.env.local` に管理者のメールアドレスを追加:

```bash
# 管理者アカウントのメールアドレス（create-adminで作成したアカウント）
NEXT_PUBLIC_ADMIN_EMAIL="admin@cocoba.com"
```

### ステップ4: ログイン

1. ブラウザで管理画面ログインページにアクセス:
   ```
   http://localhost:3000/admin/{あなたのPathKey}/login
   ```

   例:
   ```
   http://localhost:3000/admin/a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2/login
   ```

2. **パスワードのみ**を入力してログイン
   - メールアドレスの入力は不要
   - 環境変数 `NEXT_PUBLIC_ADMIN_EMAIL` に設定されたアカウントで自動的にログイン

### ステップ5: 管理画面にアクセス

ログイン後、以下のURLにアクセス可能:
- ダッシュボード: `/admin/{key}/dashboard`
- 本人確認審査: `/admin/{key}/identity-verification`

### 管理者アカウントの変更

別の管理者アカウントを使用したい場合:

1. 新しい管理者を作成:
   ```bash
   npm run create-admin new-admin@cocoba.com SecurePass456 "新管理者"
   ```

2. `.env.local` を更新:
   ```bash
   NEXT_PUBLIC_ADMIN_EMAIL="new-admin@cocoba.com"
   ```

3. 開発サーバーを再起動

---

## 🛡️ セキュリティフロー

### 認証フロー

```
ユーザーが /admin/{secret-key}/* にアクセス
    ↓
PathKeyチェック
    ├─ ❌ 間違ったKey → 404 エラー（存在しないように見せる）
    └─ ✅ 正しいKey
         ↓
    セッションチェック
         ├─ ❌ 未ログイン → /admin/{key}/login へリダイレクト
         └─ ✅ ログイン済み
              ↓
         ロールチェック
              ├─ ❌ ADMIN以外 → /forbidden へリダイレクト
              └─ ✅ ADMIN → 管理画面を表示
```

### PathKey設定

管理画面へのアクセスをURL内の秘密キーで保護します。

#### 設定方法

`.env.local` に以下を追加:

```bash
# ランダムな秘密キーを生成
# openssl rand -hex 16 で生成可能
ADMIN_PATH_KEY="a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2"
```

#### 秘密キーの生成

```bash
# Linux/Mac/Git Bash
openssl rand -hex 16

# または
openssl rand -hex 32  # より長いキー

# 出力例: a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2
```

#### アクセスURL

PathKeyを設定すると、管理画面のURLは以下のようになります:

```
通常のURL:
❌ /admin/login
❌ /admin/dashboard

PathKey設定後のURL:
✅ /admin/a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2/login
✅ /admin/a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2/dashboard
✅ /admin/a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2/identity-verification
```

#### セキュリティ上の利点

- **ブルートフォース攻撃を防止**: 管理画面のURLを推測困難に
- **簡単な設定**: IPアドレスの管理不要
- **柔軟性**: どこからでもアクセス可能（キーを知っていれば）
- **ステルス**: 間違ったキーでは404を返し、存在を隠蔽

#### 注意事項

- **キーは絶対に公開しないでください**
- キーは最低32文字（16バイト）以上を推奨
- 定期的にキーを変更することを推奨
- キーを忘れた場合は `.env.local` を確認

### 保護されているページ

- ✅ `/admin/identity-verification` - 本人確認審査
- ✅ `/admin/*` - 将来追加される全ての管理機能

---

## 👥 ユーザーロール

Prisma Schema で定義されているロール:

```prisma
enum Role {
  USER      // 一般ユーザー（ファン）
  CREATOR   // クリエイター
  ADMIN     // 管理者
}
```

### ロールの権限

| ロール | アクセス可能な範囲 |
|--------|------------------|
| USER | ファン向けページ（/{handle}/*） |
| CREATOR | クリエイターダッシュボード（/creators/*） |
| ADMIN | 管理画面（/admin/*）+ 全ページ |

---

## 🔧 既存ユーザーをADMINに昇格

既存のユーザーをADMINロールに変更する場合:

### 方法1: スクリプトを使用（簡単）

```bash
# 既存のメールアドレスでスクリプトを実行
npm run create-admin existing-user@example.com DummyPass123

# 既存ユーザーの場合、ロールのみ更新されます
```

### 方法2: Prisma Studio を使用

```bash
# Prisma Studio を起動
npx prisma studio

# 手順:
# 1. User テーブルを開く
# 2. 対象ユーザーを検索
# 3. role を "ADMIN" に変更
# 4. Save
```

### 方法3: SQL を直接実行

```sql
-- ユーザーのメールアドレスでADMINに昇格
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'user@example.com';
```

---

## 🧪 テスト方法

### 1. PathKeyを設定

```bash
# .env.local を編集
ADMIN_PATH_KEY="test-key-12345"
```

### 2. ADMIN ユーザーでログイン

```bash
# 1. ADMINユーザーを作成
npm run create-admin admin@test.com Admin123

# 2. ログイン
# http://localhost:3000/admin/test-key-12345/login

# 3. 管理画面にアクセス
# http://localhost:3000/admin/test-key-12345/dashboard

# ✅ 管理画面が表示される
```

### 3. 間違ったPathKeyでアクセス試行

```bash
# 間違ったキーでアクセス
# http://localhost:3000/admin/wrong-key/login

# ❌ 404 Not Found ページが表示される
```

### 4. 一般ユーザーでアクセス試行

```bash
# 1. 一般ユーザーでログイン（CREATOR or USER）
# 2. 正しいPathKeyで管理画面URLに直接アクセス
# http://localhost:3000/admin/test-key-12345/dashboard

# ❌ 403 Forbidden ページにリダイレクトされる
```

### 5. 未ログインでアクセス試行

```bash
# 1. ログアウト状態で管理画面にアクセス
# http://localhost:3000/admin/test-key-12345/dashboard

# ❌ ログインページにリダイレクトされる
# URL: /admin/test-key-12345/login?callbackUrl=/admin/test-key-12345/dashboard
```

---

## 📝 管理画面ヘッダー

認証されたADMINユーザーには以下のヘッダーが表示されます:

```
┌─────────────────────────────────────────────┐
│ 管理画面  [ADMIN]           admin@cocoba.com  ログアウト │
├─────────────────────────────────────────────┤
│ 本人確認審査                                    │
└─────────────────────────────────────────────┘
```

**要素:**
- タイトル「管理画面」
- ADMINバッジ（赤色）
- ログインユーザー名/メールアドレス
- ログアウトリンク
- ナビゲーションタブ

---

## 🔄 既存の管理画面

### 本人確認審査ページ
**URL:** `/admin/identity-verification`

**機能:**
- クリエイターが提出した本人確認書類を審査
- 運転免許証・パスポート・マイナンバーカードの画像を確認
- 承認/却下の判断
- 却下理由の記入とメール通知

---

## 🚨 トラブルシューティング

### エラー: "404 - Not Found"

**原因:** PathKeyが間違っている、または設定されていない

**解決策:**
```bash
# 1. .env.local を確認
cat apps/web/.env.local | grep ADMIN_PATH_KEY

# 2. PathKeyが設定されていない場合は生成
openssl rand -hex 16

# 3. .env.local に追加
ADMIN_PATH_KEY="生成されたキー"

# 4. Next.jsを再起動
```

### PathKeyを忘れた場合

**解決策:**
```bash
# サーバーの .env.local を確認
cat apps/web/.env.local | grep ADMIN_PATH_KEY

# 出力例:
# ADMIN_PATH_KEY="a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2"

# このキーを使ってアクセス:
# http://localhost:3000/admin/a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2/login
```

### エラー: "Access denied"

**原因:** ユーザーがADMINロールを持っていない

**解決策:**
```bash
# スクリプトでロールを更新
npm run create-admin user@example.com DummyPass

# または Prisma Studio で role を "ADMIN" に変更
```

### エラー: "User not found"

**原因:** セッションのメールアドレスに一致するユーザーがDBに存在しない

**解決策:**
1. ログアウト
2. 正しい認証情報で再ログイン
3. Userテーブルを確認

### ログインページにリダイレクトされ続ける

**原因:** セッションが正しく確立されていない

**解決策:**
1. ブラウザのキャッシュ・Cookie をクリア
2. 再度ログイン
3. NextAuth設定（`lib/auth.ts`）を確認

---

## 🎯 ベストプラクティス

### 1. 強力なPathKeyを使用
```bash
# ❌ 弱いPathKey（推測されやすい）
ADMIN_PATH_KEY="admin"
ADMIN_PATH_KEY="secret"
ADMIN_PATH_KEY="123456"

# ✅ 強力なPathKey（ランダム生成）
ADMIN_PATH_KEY="a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2"
ADMIN_PATH_KEY="f4e8d2a7f3e9d2c8b4f1a6e5d9c3b7a1f4e8d2c8b4f1a6e5d9c3b7a1"
```

### 2. パスワードの設定
```bash
# 最低6文字以上のパスワードが必要です
npm run create-admin admin@cocoba.com Pass123

# より強力なパスワードを推奨
npm run create-admin admin@cocoba.com Adm1n!StrongP@ss2024
```

### 3. PathKeyの管理
- **絶対に公開リポジトリにコミットしない**
- `.gitignore` に `.env.local` が含まれていることを確認
- PathKeyは社内の安全な場所（パスワードマネージャー等）に保管
- 定期的にPathKeyを変更（3〜6ヶ月ごと）

### 4. 本番環境のADMINユーザー管理
- 本番DBで直接 `npm run create-admin` を実行
- または本番環境のPrisma Studioでロールを変更
- ADMINユーザーの数は最小限に

### 5. ログの監視
- 管理画面へのアクセスログを記録
- 404エラー（間違ったPathKey）の頻発を監視
- 不正アクセス試行を検出

### 6. 2要素認証の検討（将来）
- ADMIN アカウントには2FA を推奨
- 現時点では未実装

---

## 📚 関連ファイル

- `apps/web/app/admin/layout.tsx` - Admin認証ガード
- `apps/web/app/admin/identity-verification/page.tsx` - 本人確認審査ページ
- `apps/web/app/forbidden/page.tsx` - 403エラーページ
- `scripts/create-admin-user.ts` - ADMINユーザー作成スクリプト
- `prisma/schema.prisma` - Role定義

---

## ✅ チェックリスト

実装完了前に確認:

- [x] Admin Layout を作成
- [x] Admin Login ページを作成
- [x] Admin Dashboard ページを作成
- [x] セッションチェックを実装
- [x] ADMINロールチェックを実装
- [x] PathKey認証を実装
- [x] 403 Forbidden ページを作成
- [x] ADMINユーザー作成スクリプトを作成
- [ ] `.env.local` に `ADMIN_PATH_KEY` を設定
- [ ] ADMINユーザーを作成してテスト
- [ ] 正しいPathKeyでログインできることを確認
- [ ] 間違ったPathKeyで404が返ることを確認
- [ ] 一般ユーザーでアクセス拒否をテスト
- [ ] 未ログインでリダイレクトをテスト

---

## 🎉 完了

管理画面は現在、以下のセキュリティ層で保護されています:

✅ **Layer 1: PathKey認証** - 秘密キーを知っている人のみアクセス可能
✅ **Layer 2: 認証** - ログインが必須
✅ **Layer 3: 認可** - ADMINロールが必須

次のステップ:
1. **開発環境セットアップ:**
   ```bash
   # PathKeyを生成
   openssl rand -hex 16

   # .env.local に追加
   ADMIN_PATH_KEY="生成されたキー"

   # ADMINユーザーを作成
   npm run create-admin admin@cocoba.com SecurePass123 "管理者"

   # ログインしてテスト
   # http://localhost:3000/admin/{生成されたキー}/login
   ```

2. **本番環境セットアップ:**
   ```bash
   # 本番用の強力なPathKeyを生成
   openssl rand -hex 32

   # .env に設定（必須）
   ADMIN_PATH_KEY="本番用の長いキー"

   # ADMINユーザーを作成
   npm run create-admin admin@cocoba.com [強力なパスワード] "管理者"
   ```

3. **セキュリティテスト:**
   - 正しいPathKeyでログインできることを確認
   - 間違ったPathKeyで404が返ることを確認
   - ADMINユーザーで管理画面にアクセスできることを確認
   - 一般ユーザーでアクセスが拒否されることを確認
   - 未ログインでリダイレクトされることを確認

4. **重要な注意事項:**
   - **PathKeyは絶対に公開しないでください**
   - PathKeyは社内でのみ共有し、外部に漏らさないこと
   - 定期的にPathKeyを変更することを推奨
   - PathKeyを変更した場合、全ての管理者に新しいURLを通知
