---
description: 開発環境の一括起動
---

# 開発環境の一括起動

## 概要
開発に必要なインフラ（Docker）とデータベースツール（Prisma Studio）を起動する。

## 手順
1. **インフラの起動**:
   `docker compose up -d` を実行する。
2. **データベース管理ツールの起動**:
   `node node_modules/prisma/build/index.js studio` を実行する。

## 成功条件
- すべてのコマンドがエラーなく実行されること。
- Docker コンテナとPrisma Studioが起動すること。
