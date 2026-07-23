# 独自ドメイン機能 実装完了

Cloudflare for SaaSを使用した独自ドメイン機能の実装が完了しました。

## 実装内容

### 1. データベーススキーマ

**Domainモデルの拡張:**
- `cloudflareHostnameId`: Cloudflare Custom Hostname ID
- `sslValidationRecords`: SSL検証用のDNSレコード（JSON）
- `sslStatus`: SSL証明書のステータス
- `lastError`: 検証エラーメッセージ

**マイグレーション:**
- `prisma/migrations/20260203000000_add_cloudflare_domain_fields/migration.sql`

### 2. NestJS API (apps/api)

**新規モジュール: `src/domains/`**

- **cloudflare.service.ts**: Cloudflare API クライアント
  - `createCustomHostname()`: カスタムホスト名を作成
  - `getCustomHostname()`: ステータスを取得
  - `deleteCustomHostname()`: ホスト名を削除

- **domains.service.ts**: ドメイン管理ロジック
  - プラン権限チェック（LITE/BUSINESS）
  - ドメイン登録・検証・削除
  - クリエイター検索（カスタムドメインから）

- **domains.controller.ts**: REST API エンドポイント
  - `GET /domains/me`: 自分のドメインを取得
  - `POST /domains`: ドメインを登録
  - `POST /domains/:id/verify`: ドメインを検証
  - `DELETE /domains/:id`: ドメインを削除
  - `GET /domains/lookup/:hostname`: ドメインからクリエイターを検索（公開）

### 3. Next.js Middleware (apps/web/middleware.ts)

**マルチテナント対応:**
- カスタムドメインを検出
- APIでクリエイター情報を取得
- プラン期限切れチェック
- `/{handle}` へ内部リライト
- カスタムヘッダーを追加

### 4. フロントエンドUI (apps/web)

**ドメイン設定（既存の設定ページに統合）:**
- `app/creators/[handle]/settings/settings-content.tsx` - 「ドメイン設定」タブに実装

**主な機能:**
- プランチェック（無料ユーザーにはアップグレードオーバーレイ）
- ドメイン登録フォーム
- DNS設定手順の表示（動的に生成されたTXTレコード）
- 検証ボタン（Cloudflareにステータス問い合わせ）
- ステータス表示（PENDING, VERIFYING, ACTIVE, FAILED）

**Next.js API Routes:**
- `/api/domains/me`: ドメイン取得
- `/api/domains`: ドメイン登録
- `/api/domains/[domainId]/verify`: ドメイン検証
- `/api/domains/[domainId]`: ドメイン削除

## セットアップ手順

### 1. 環境変数の設定

**apps/api/.env に追加:**
```env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ZONE_ID=your_cloudflare_zone_id_here
```

**apps/web/.env.local に追加:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_MAIN_DOMAIN=localhost:3000
```

### 2. Cloudflare セットアップ

1. Cloudflare ダッシュボードにログイン
2. 対象のゾーン（ドメイン）を選択
3. **SSL/TLS** → **Custom Hostnames** を有効化
4. **API Token** を作成:
   - Zone.SSL and Certificates: Edit
   - Zone.Custom Hostnames: Edit
5. Zone ID を確認（ダッシュボードの右下に表示）

### 3. データベースマイグレーション

```bash
cd C:\dev\ACD\Creator
npx prisma migrate deploy
# または
npx prisma db push
```

### 4. サーバー再起動

```bash
# API サーバー
cd apps/api
npm run start:dev

# Web サーバー
cd apps/web
npm run dev
```

## 使用方法

### クリエイター側

1. Lite または Business プランに登録
2. `/creators/{handle}/settings` にアクセスし、「ドメイン設定」タブを選択
3. 独自ドメインを入力して登録
4. 表示されたDNS設定（TXTレコード）をドメインのDNS設定に追加
5. 「検証」ボタンをクリック
6. ステータスが「有効」になったら完了

### DNS設定例

Cloudflare、Namecheap、Google Domainsなど、ほとんどのDNSプロバイダーで以下のTXTレコードを追加:

```
タイプ: TXT
名前: _acme-challenge.example.com
値: (Cloudflareから提供された値)
TTL: Auto または 3600
```

### ファン側

独自ドメイン経由でアクセス:
```
https://example.com
```

自動的にクリエイターのページが表示されます。

## プラン権限

| プラン | 独自ドメイン |
|--------|------------|
| FREE | ❌ |
| LITE | ✅ |
| BUSINESS | ✅ |

無料プランのユーザーが設定ページにアクセスすると、アップグレードを促すオーバーレイが表示されます。

## エラーハンドリング

### プラン期限切れ
- ステータス: `EXPIRED`
- または `endDate` が過去
- → 503 エラーページを表示

### ドメインが見つからない
- カスタムドメインが未登録
- または ステータスが `ACTIVE` でない
- → 404 エラーページを表示

### DNS検証失敗
- TXTレコードが正しく設定されていない
- DNSの反映待ち（最大48時間）
- `lastError` フィールドにエラー詳細を保存

## テスト

### ローカル環境でのテスト

カスタムドメインのローカルテストには、以下の方法があります:

1. **hostsファイルを編集:**
   ```
   # Windows: C:\Windows\System32\drivers\etc\hosts
   # Mac/Linux: /etc/hosts

   127.0.0.1 test-domain.local
   ```

2. **ngrok を使用:**
   ```bash
   ngrok http 3000
   # 提供されたURLをCloudflareに登録
   ```

### 本番環境

1. 実際のドメインを用意
2. Cloudflare for SaaSを設定
3. アプリをデプロイ
4. クリエイターがドメインを登録
5. DNS設定を追加
6. 検証完了後、カスタムドメインでアクセス可能

## トラブルシューティング

### DNS設定が反映されない
- TTLを確認（3600秒 = 1時間）
- `dig` や `nslookup` でレコードを確認:
  ```bash
  dig TXT _acme-challenge.example.com
  ```

### SSL証明書が発行されない
- DNS設定が正しいか確認
- Cloudflareのダッシュボードでステータスを確認
- 通常、検証成功後15分以内に発行

### Middlewareが動作しない
- `NEXT_PUBLIC_API_URL` が正しいか確認
- NestJS APIが起動しているか確認
- ブラウザのDevToolsでネットワークタブを確認

## 今後の拡張

- [ ] カスタムドメインの一括管理画面（管理者用）
- [ ] DNS設定の自動検証（定期ジョブ）
- [ ] SSL証明書の自動更新確認
- [ ] ドメイン検証の通知メール
- [ ] サブドメイン対応（www.example.com）

## 参考リンク

- [Cloudflare for SaaS Documentation](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/)
- [Cloudflare Custom Hostnames API](https://developers.cloudflare.com/api/operations/custom-hostname-for-a-zone-create-custom-hostname)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
