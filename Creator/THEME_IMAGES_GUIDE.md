# テーマプレビュー画像の作成ガイド

トップページの「6つの洗練されたテーマから選択」セクションに表示するテーマプレビュー画像を作成します。

## 必要な画像

以下の6つの画像を `apps/web/public/themes/` に配置してください：

1. `creator-pro.jpg`
2. `neon-pro.jpg`
3. `studio-pro.jpg`
4. `velvet-pro.jpg`
5. `pure-lite.jpg`
6. `zine-lite.jpg`

## 推奨仕様

- **サイズ**: 800×600px 以上
- **フォーマット**: JPG または WebP
- **アスペクト比**: 4:3
- **最適化**: 100KB以下に圧縮推奨

## 方法1: 実際のテーマページのスクリーンショット（推奨）

### ステップ
1. 開発サーバーを起動: `npm run dev`
2. 各テーマページにアクセス:
   - `http://localhost:3000/creator-pro`
   - `http://localhost:3000/neon-pro`
   - `http://localhost:3000/studio-pro`
   - `http://localhost:3000/velvet-pro`
   - `http://localhost:3000/pure-lite`
   - `http://localhost:3000/zine-lite`
3. ブラウザのスクリーンショット機能またはツールで撮影
4. 800×600pxにリサイズ
5. 対応するファイル名で保存

### ツール
- **Windows**: Snipping Tool / Snip & Sketch
- **Mac**: Command + Shift + 4
- **Chrome DevTools**: F12 → Command Menu (Ctrl+Shift+P) → "Capture screenshot"

## 方法2: プレースホルダー画像（一時的）

`apps/web/scripts/generate-theme-placeholders.html` をブラウザで開いて、各SVGを右クリックで保存できます。

### 手順
1. `apps/web/scripts/generate-theme-placeholders.html` をブラウザで開く
2. 各テーマのSVGをクリック（自動ダウンロード）
3. ダウンロードした画像を `apps/web/public/themes/` に移動

## 方法3: デザインツールで作成

Figma / Photoshop / Canva などで各テーマのモックアップを作成:

### Creator Pro（紫系）
- ベースカラー: `#7c3aed` → `#581c87`
- アクセント: `#a78bfa`

### Neon Pro（シアン・青系）
- ベースカラー: `#06b6d4` → `#1e3a8a`
- アクセント: `#22d3ee`

### Studio Pro（グレー系）
- ベースカラー: `#475569` → `#0f172a`
- アクセント: `#cbd5e1`

### Velvet Pro（ローズ・赤系）
- ベースカラー: `#e11d48` → `#4c0519`
- アクセント: `#fb7185`

### Pure Lite（ライトグレー）
- ベースカラー: `#f3f4f6` → `#ffffff`
- アクセント: `#1f2937`

### Zine Lite（オレンジ系）
- ベースカラー: `#fbbf24` → `#ea580c`
- アクセント: `#fde68a`

## 画像の配置

```bash
apps/web/public/themes/
├── creator-pro.jpg
├── neon-pro.jpg
├── studio-pro.jpg
├── velvet-pro.jpg
├── pure-lite.jpg
└── zine-lite.jpg
```

## 確認

画像を配置後、開発サーバーで `http://localhost:3000` にアクセスして、「6つの洗練されたテーマから選択」セクションを確認してください。

## トラブルシューティング

### 画像が表示されない
- ファイル名が正確か確認（拡張子含む）
- `public/themes/` ディレクトリが存在するか確認
- 開発サーバーを再起動

### 画像が歪む
- アスペクト比 4:3 を維持しているか確認
- Next.js の Image コンポーネントは自動で最適化します
