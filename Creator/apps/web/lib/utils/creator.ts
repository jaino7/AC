/**
 * URLからクリエイターのハンドル名を取得する
 * 例: /creator-pro/signup → null (テーマ名はデモとして扱わない or 別途処理)
 * 例: /peepfff58564/signup → "peepfff58564" (実際のクリエイターハンドル)
 */

// 既知のテーマ名リスト
const THEME_NAMES = [
    "creator-pro",
    "neon-pro",
    "studio-pro",
    "velvet-pro",
    "pure-lite",
    "zine-lite"
];

export function getCreatorHandleFromPath(pathname: string): string | null {
    // パターン1: /@handle/xxx の形式
    const customHandleMatch = pathname.match(/\/@([^\/]+)/);
    if (customHandleMatch) {
        return customHandleMatch[1];
    }

    // パターン2: /xxx/yyy の形式で最初のセグメントを取得
    const pathMatch = pathname.match(/^\/([^\/]+)/);
    if (pathMatch) {
        const segment = pathMatch[1];

        // テーマ名の場合はnullを返す（デモページとして扱う）
        if (THEME_NAMES.includes(segment)) {
            return null;
        }

        // それ以外は実際のクリエイターハンドルとして返す
        return segment;
    }

    return null;
}

