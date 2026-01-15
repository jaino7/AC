/**
 * URLからクリエイターのハンドル名を取得する
 * 例: /neon-pro/signup → "neon-pro" (デフォルトのデモクリエイター)
 * 例: /@creator123/signup → "creator123" (カスタムドメインの場合)
 */
export function getCreatorHandleFromPath(pathname: string): string | null {
    // パターン1: /@handle/signup の形式
    const customHandleMatch = pathname.match(/\/@([^\/]+)/);
    if (customHandleMatch) {
        return customHandleMatch[1];
    }

    // パターン2: /theme-name/signup の形式（デモ/テーマページ）
    // 開発段階では各テーマごとにデモクリエイターを想定
    const themeMatch = pathname.match(/^\/([^\/]+)/);
    if (themeMatch) {
        const theme = themeMatch[1];
        // テーマ名をそのままハンドル名として使用（実際の運用ではマッピングテーブルなどを使用）
        // TODO: 本番環境では実際のクリエイターハンドルにマッピングする
        return `demo-${theme}`;
    }

    return null;
}
