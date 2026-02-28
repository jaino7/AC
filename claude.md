# Claude AI Assistant - Project Context

## 開発環境セットアップ

### 起動コマンド
- **Start Environment:** `docker compose up -d && node node_modules/prisma/build/index.js studio`

## プロジェクト情報
- **プロダクト名:** CocoBa
- **Architecture:** Monorepo (NestJS & Next.js)
- **Frontend (apps/web):** Next.js (App Router), Tailwind CSS
- **Backend (apps/api):** NestJS
- **Database/ORM:** Prisma, Supabase
- **Infrastructure:** Docker, Vultr, Porkbun, Bunny.net

## 注意事項
- コードの修正後は、必要に応じて `npx prisma generate` を実行すること。
- UIはシンプルかつ清潔感のあるデザインを優先する。
- 変数名やドキュメントは、英語をベースに作成する。