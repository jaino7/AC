---
description: 開発環境の一括起動
---

# 開発環境の一括起動

## 概要
開発に必要なインフラ（Docker）、データベースツール（Prisma）、
およびフロントエンド/バックエンドの各サーバーを順番に起動する。

## 手順
1. **インフラの起動**: 
   `docker compose up -d` を実行する。
2. **データベース管理ツールの起動**: 
   `node node_modules/prisma/build/index.js studio` を実行する。
3. **Webサーバーの起動**: 
   `npm run dev:web` を実行する。
4. **APIサーバーの起動**: 
   `npm run dev:api` を実行する。

## 成功条件
- すべてのコマンドがエラーなく実行されること。
- 各サーバーがリスニング状態になること。
