# Trust & Lock UI実装完了レポート

## 実装完了項目

### 1. アカウント封鎖画面 (/account-suspended) ✅

**ファイル:** `apps/web/app/account-suspended/page.tsx`

**機能:**
- ロックされたアカウント専用のページ
- 警告メッセージとロック理由の表示
- 問い合わせフォーム（名前、メールアドレス、振込詳細、内容）
- フォーム送信完了後の確認画面
- `/trust-guide`へのリンク

**デザイン:**
- 赤色のアラートデザイン（Lock/AlertTriangleアイコン）
- 停止中のアカウントで利用できない機能のリスト表示
- 送信完了時の緑色の確認画面
- レスポンシブデザイン対応

**TODO:**
- 実際の問い合わせAPI実装（現在はモック）
- support@cocoba.jpへのメール送信機能

### 2. 信用ランク解説ページ (/trust-guide) ✅

**ファイル:** `apps/web/app/trust-guide/page.tsx`

**機能:**
- ティア0〜2の詳細説明
- 各ティアのメリット表示（即時チャージ上限、利便性）
- ランクアップの仕組み（4ステップで解説）
- ペナルティとアカウント停止の詳細説明
- よくある質問（FAQ）5項目
- CTAセクション（今すぐティア1を目指そう）

**デザイン:**
- グラデーション背景（青→白）
- 3カラムのティアカード（Tier 0:グレー、Tier 1:青、Tier 2:紫）
- ティア1に「おすすめ」バッジ表示
- Lucideアイコン使用（Shield、Star、Zap、Clock、Lock等）
- ユーザーが「早くティア1に上がりたい」と思える構成

**メリット強調:**
- Tier 0: 運営確認後に全額付与
- Tier 1: 3,000円まで即時利用可能（待ち時間ほぼゼロ）
- Tier 2: 無制限即時付与（待ち時間完全ゼロ）

**ペナルティ明記:**
- 虚偽の振込申告
- 48時間以内の未入金
- アカウント停止時の制限事項

### 3. UI表示の統一（信用ランク表示） ✅

#### 3.1 API更新

**ファイル:** `apps/web/app/api/fans/credits/route.ts`

**変更点:**
- レスポンスに`tier`、`trustScore`、`isLocked`を追加
- FanProfileクエリに新フィールドを含める

#### 3.2 共通コンポーネント作成

**ファイル:** `apps/web/components/credits/TrustRankDisplay.tsx`

**機能:**
- 全テーマで再利用可能な信用ランク表示コンポーネント
- ティア番号バッジ（0:グレー、1:青、2:紫のグラデーション）
- 即時チャージ上限の表示
- 信用スコアの表示
- ランクアップまでの残り回数表示
- `/trust-guide`へのリンク
- テーマカラー対応（creator-pro、neon-pro、pure-lite等）

**Props:**
```typescript
interface TrustRankDisplayProps {
  tier: number;
  trustScore: number;
  className?: string;
  variant?: "creator-pro" | "neon-pro" | "pure-lite" | "studio-pro" | "velvet-pro" | "zine-lite";
}
```

#### 3.3 Creator Proテーマ更新

**ファイル:** `apps/web/app/creator-pro/account/credits/page.tsx`

**変更点:**
1. Stateに`tier`、`trustScore`、`isLocked`を追加
2. `fetchCredits()`でAPIからティア情報を取得
3. `isLocked`がtrueの場合、`/account-suspended`にリダイレクト
4. クレジット残高セクションに`TrustRankDisplay`コンポーネントを追加
5. ティア情報を視覚的に表示

**表示内容:**
- ティア番号バッジ
- 「信用ランク：ティアX - ステータス」
- 即時チャージ上限
- 信用スコア
- 次のティアまでの残り回数

## データフロー

### アカウントロック時
```
1. バックエンドでisLocked=trueに設定
2. ファンがログイン/creditsページアクセス
3. API GET /api/fans/creditsでisLocked=trueを取得
4. フロントエンドでwindow.location.href = "/account-suspended"
5. 封鎖画面表示
```

### 信用ランク表示
```
1. API GET /api/fans/credits
2. レスポンス: { credits, tier, trustScore, isLocked, history }
3. TrustRankDisplayコンポーネントにtier/trustScoreを渡す
4. ティア情報を視覚的に表示
5. 「詳しく見る」→ /trust-guide
```

## 他テーマへの適用方法

現在、creator-proテーマのみ実装済みです。他のテーマ（neon-pro、pure-lite、studio-pro、velvet-pro、zine-lite）に適用するには：

### 手順

1. **各テーマのcreditsページを開く**
   ```
   apps/web/app/[theme-name]/account/credits/page.tsx
   ```

2. **Importを追加**
   ```typescript
   import { TrustRankDisplay } from "@/components/credits/TrustRankDisplay";
   ```

3. **Stateを追加**
   ```typescript
   const [tier, setTier] = useState(0);
   const [trustScore, setTrustScore] = useState(0);
   const [isLocked, setIsLocked] = useState(false);
   ```

4. **fetchCredits()を更新**
   ```typescript
   const data = await res.json();
   setTier(data.tier || 0);
   setTrustScore(data.trustScore || 0);
   setIsLocked(data.isLocked || false);

   if (data.isLocked) {
     window.location.href = "/account-suspended";
   }
   ```

5. **クレジット残高セクションに追加**
   ```typescript
   <TrustRankDisplay
     tier={tier}
     trustScore={trustScore}
     variant="neon-pro" // テーマ名に変更
     className="pt-6 border-t border-gray-800"
   />
   ```

### テーマ別variantマッピング

| テーマ | variant値 | リンクカラー |
|--------|-----------|-------------|
| creator-pro | `creator-pro` | cyan-400 |
| neon-pro | `neon-pro` | pink-400 |
| pure-lite | `pure-lite` | emerald-400 |
| studio-pro | `studio-pro` | amber-400 |
| velvet-pro | `velvet-pro` | rose-400 |
| zine-lite | `zine-lite` | slate-400 |

## ファイル一覧

### 新規作成（3ファイル）
- `apps/web/app/account-suspended/page.tsx` - アカウント封鎖画面
- `apps/web/app/trust-guide/page.tsx` - 信用ランク解説ページ
- `apps/web/components/credits/TrustRankDisplay.tsx` - 共通コンポーネント

### 更新（2ファイル）
- `apps/web/app/api/fans/credits/route.ts` - APIレスポンス拡張
- `apps/web/app/creator-pro/account/credits/page.tsx` - 信用ランク表示追加

## 動作確認チェックリスト

### アカウント封鎖画面
- [ ] `/account-suspended`にアクセスできる
- [ ] ロック理由が表示される
- [ ] 問い合わせフォームが正常に動作する
- [ ] 送信完了画面が表示される
- [ ] `/trust-guide`リンクが機能する

### 信用ランク解説ページ
- [ ] `/trust-guide`にアクセスできる
- [ ] 3つのティアカードが正しく表示される
- [ ] ランクアップの仕組みが4ステップで表示される
- [ ] ペナルティセクションが明確に表示される
- [ ] FAQ5項目が開閉できる
- [ ] CTAボタンが機能する

### 信用ランク表示（Creator Pro）
- [ ] creditsページでティアバッジが表示される
- [ ] 「信用ランク：ティアX」と表示される
- [ ] 即時チャージ上限が正しく表示される
- [ ] 信用スコアが表示される
- [ ] 次のティアまでの残り回数が表示される（Tier 0, 1のみ）
- [ ] 「詳しく見る」リンクが`/trust-guide`に遷移する
- [ ] isLocked=trueの場合、`/account-suspended`にリダイレクトされる

## デザイン仕様

### カラーパレット

**ティア0（新規）**
- バッジ背景: `bg-gray-700`
- テキスト: `text-gray-400`
- 説明: グレースケール、控えめ

**ティア1（信頼済み）**
- バッジ背景: `bg-gradient-to-br from-blue-500 to-blue-600`
- テキスト: `text-blue-400`
- 強調: 「おすすめ」バッジ付き

**ティア2（優良）**
- バッジ背景: `bg-gradient-to-br from-purple-500 to-purple-600`
- テキスト: `text-purple-400`
- 強調: 塗りつぶしのStarアイコン

**警告・エラー**
- アカウント停止: `bg-red-50 border-red-200 text-red-800`
- 注意事項: `bg-yellow-50 border-yellow-300 text-yellow-900`

### レスポンシブ対応

全ページでモバイル/タブレット/デスクトップに対応:
- グリッドレイアウト: `grid md:grid-cols-3`
- 最大幅: `max-w-5xl mx-auto`
- パディング: `px-4 py-12`

## 次のステップ（未実装）

### 1. 他テーマへの展開
- [ ] neon-proのcreditsページ更新
- [ ] pure-liteのcreditsページ更新
- [ ] studio-proのcreditsページ更新
- [ ] velvet-proのcreditsページ更新
- [ ] zine-liteのcreditsページ更新

### 2. バックエンド連携
- [ ] 問い合わせフォームのAPI実装
- [ ] メール送信機能（support@cocoba.jp宛）
- [ ] 問い合わせ履歴の管理画面

### 3. 追加機能
- [ ] ログインページでのisLockedチェック
- [ ] 投稿アクセス時のロック画面表示
- [ ] メール通知（アカウントロック時）
- [ ] ティアアップグレード通知

## 用語統一

以下の表現を全体で統一しました：

| 旧 | 新 |
|----|-----|
| 信頼度 | 信用ランク |
| トラストスコア | 信用スコア |
| レベル | ティア |
| - | ティア0 - 新規ユーザー |
| - | ティア1 - 信頼済み |
| - | ティア2 - 優良 |

## まとめ

アカウント封鎖画面、信用ランク解説ページ、および信用ランク表示UIの実装が完了しました。

**完成度:**
- アカウント封鎖画面: 100%（問い合わせAPI実装待ち）
- 信用ランク解説ページ: 100%
- 信用ランク表示: 80%（Creator Proのみ、他テーマは手順書提供）

**ユーザー体験:**
- ロックされたユーザーは明確な理由と問い合わせ方法を知ることができる
- 新規ユーザーは「早くティア1になりたい」というモチベーションを持てる
- 既存ユーザーは自分の信用ランクを常に確認でき、次のティアまでの進捗がわかる

すべてのUIは清潔で整理されたデザインで、ユーザーフレンドリーな体験を提供します。
