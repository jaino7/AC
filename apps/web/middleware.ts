import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// カスタムドメインからクリエイターハンドルを取得
async function getCreatorHandleByDomain(domain: string): Promise<string | null> {
    try {
        // APIサーバーのURL（環境変数から取得、デフォルトはlocalhost）
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        const response = await fetch(`${apiUrl}/creators/domains/lookup?domain=${domain}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.handle || null;
        }

        return null;
    } catch (error) {
        console.error("ドメイン検索エラー:", error);
        return null;
    }
}

export default withAuth(
    async function middleware(req) {
        const hostname = req.nextUrl.hostname;
        const path = req.nextUrl.pathname;

        // カスタムドメインチェック
        // localhost, 127.0.0.1, vercel.app などのデフォルトドメイン以外の場合
        const isCustomDomain =
            hostname !== "localhost" &&
            hostname !== "127.0.0.1" &&
            !hostname.endsWith(".vercel.app") &&
            !hostname.endsWith(".ngrok.io");

        if (isCustomDomain) {
            // カスタムドメインからクリエイターハンドルを取得
            const handle = await getCreatorHandleByDomain(hostname);

            if (handle) {
                // クリエイターページへリライト
                // 例: custom.com/posts → /creators/[handle]/posts
                const url = req.nextUrl.clone();

                // 既に /creators/[handle] で始まっている場合はそのまま
                if (path.startsWith(`/creators/${handle}`)) {
                    return NextResponse.next();
                }

                // ルートパスの場合はクリエイターのトップページへ
                if (path === "/" || path === "") {
                    url.pathname = `/creators/${handle}`;
                } else {
                    // その他のパスはクリエイターのサブパスへ
                    url.pathname = `/creators/${handle}${path}`;
                }

                return NextResponse.rewrite(url);
            }
        }

        // 通常のフロー（認証チェック）
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;

                // Public paths that don't require authentication
                if (
                    path.startsWith('/creators/login') ||
                    path.startsWith('/creators/signup') ||
                    path.startsWith('/creators/password-reset') ||
                    path.startsWith('/creators/verify-email')
                ) {
                    return true;
                }

                // Protected /creators/* paths require authentication
                if (path.startsWith('/creators')) {
                    return !!token;
                }

                // All other paths are public
                return true;
            }
        },
        pages: {
            signIn: '/creators/login'
        }
    }
);

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
};
