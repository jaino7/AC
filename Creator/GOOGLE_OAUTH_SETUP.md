# Google OAuth Setup Guide

## Google OAuth認証を有効化する方法

現在、Google OAuthは環境変数が未設定のため無効化されています。  
有効化するには以下の手順を実行してください。

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新規プロジェクトを作成（または既存プロジェクトを選択）

### 2. OAuth 2.0認証情報を作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類：「ウェブアプリケーション」を選択
4. 名前：任意（例：「Creator Platform」）
5. 承認済みのリダイレクトURIに以下を追加：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   本番環境では実際のドメインに変更：
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. 「作成」をクリック
7. クライアントIDとクライアントシークレットをコピー

### 3. 環境変数を設定

プロジェクトルートに `.env.local` ファイルを作成し、以下を追加：

```bash
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 4. サーバーを再起動

```bash
# 開発サーバーを停止して再起動
npm run dev
```

### 5. 確認

ログインページに「Googleでログイン」ボタンが表示されるようになります。

---

## 注意事項

- Google OAuthは**オプション機能**です
- 環境変数が未設定の場合、自動的に無効化されます
- メール/パスワード認証は常に利用可能です
- 本番環境では必ず承認済みリダイレクトURIを更新してください

---

## トラブルシューティング

### Googleログインボタンが表示されない
→ `.env.local` ファイルが正しい場所にあるか確認  
→ サーバーを再起動したか確認

### "redirect_uri_mismatch" エラー  
→ Google Cloud Consoleの承認済みリダイレクトURIが正しいか確認
