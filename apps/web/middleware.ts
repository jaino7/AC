import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// カスタムドメインからクリエイター情報を取得
async function getCreatorByDomain(domain: string): Promise<{
    handle: string;
    creatorId: string;
    status: string;
    endDate?: string;
} | null> {
    try {
        // APIサーバーのURL（環境変数から取得、デフォルトはlocalhost）
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        const response = await fetch(`${apiUrl}/domains/lookup/${domain}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.creator) {
                return {
                    handle: data.creator.handle,
                    creatorId: data.creator.id,
                    status: data.creator.creatorSubscription?.status,
                    endDate: data.creator.creatorSubscription?.endDate
                };
            }
        }

        return null;
    } catch (error) {
        console.error("ドメイン検索エラー:", error);
        return null;
    }
}

export default withAuth(
    async function middleware(req) {
        // Host ヘッダーから実際のホスト名を取得（Nginx等のリバースプロキシ対応）
        const hostHeader = req.headers.get('host') || '';
        const hostname = hostHeader.split(':')[0] || req.nextUrl.hostname;
        const path = req.nextUrl.pathname;

        // Admin PathKey認証チェック（/admin/* パスのみ）
        if (path.startsWith('/admin')) {
            const adminPathKey = process.env.ADMIN_PATH_KEY;

            // PathKeyが設定されている場合のみチェック
            if (adminPathKey) {
                const pathSegments = path.split('/').filter(Boolean);
                const providedKey = pathSegments[1]; // /admin/{key}/...

                // /admin または /admin/login の直接アクセスは /admin/{key}/login にリダイレクト
                if (path === '/admin' || path === '/admin/') {
                    const redirectUrl = req.nextUrl.clone();
                    redirectUrl.pathname = `/admin/${adminPathKey}/login`;
                    return NextResponse.redirect(redirectUrl);
                }

                // /admin/XXX の形式（XXXがPathKeyでない場合）
                if (providedKey && providedKey !== adminPathKey) {
                    // 404を返して存在しないように見せる
                    return new NextResponse(
                        `<!DOCTYPE html>
                        <html>
                          <head>
                            <title>404 - Not Found</title>
                            <meta charset="utf-8">
                            <style>
                              body {
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                margin: 0;
                                background: #f5f5f5;
                              }
                              .container {
                                text-align: center;
                                padding: 2rem;
                                background: white;
                                border-radius: 8px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                max-width: 500px;
                              }
                              h1 { color: #333; margin-bottom: 1rem; }
                              p { color: #666; line-height: 1.6; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h1>404 - Not Found</h1>
                              <p>お探しのページは見つかりませんでした。</p>
                            </div>
                          </body>
                        </html>`,
                        {
                            status: 404,
                            headers: {
                                'Content-Type': 'text/html; charset=utf-8',
                            },
                        }
                    );
                }

                // /admin/{正しいkey}/... の場合、内部的に /admin/... にrewrite
                if (providedKey === adminPathKey) {
                    const newPath = path.replace(`/admin/${adminPathKey}`, '/admin');
                    const url = req.nextUrl.clone();
                    url.pathname = newPath;

                    // rewriteしたレスポンスにカスタムヘッダーを追加
                    const response = NextResponse.rewrite(url);
                    response.headers.set('x-pathname', path);
                    return response;
                }
            }
            // PathKeyが設定されていない場合はそのまま通す（開発環境）
        }

        // カスタムドメインチェック
        // localhost, 127.0.0.1, vercel.app, メインドメインなどを除外
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;
        const mainDomainHost = mainDomain ? mainDomain.split(':')[0] : '';
        // メインドメインとその関連ドメインを除外
        const isOwnDomain =
            hostname === mainDomainHost ||
            hostname === `www.${mainDomainHost}` ||
            hostname === 'getcocoba.com' ||
            hostname === 'www.getcocoba.com' ||
            hostname === 'cocoba.com' ||
            hostname === 'www.cocoba.com';
        const isCustomDomain =
            hostname !== "localhost" &&
            hostname !== "127.0.0.1" &&
            !hostname.endsWith(".vercel.app") &&
            !hostname.endsWith(".ngrok.io") &&
            !isOwnDomain;

        if (isCustomDomain) {
            // カスタムドメインからクリエイター情報を取得
            const creatorInfo = await getCreatorByDomain(hostname);

            if (creatorInfo) {
                const { handle, creatorId, status, endDate } = creatorInfo;

                // プラン期限切れチェック
                if (
                    status === 'EXPIRED' ||
                    (endDate && new Date(endDate) < new Date())
                ) {
                    return new NextResponse(
                        `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>サービス停止中</title>
                            <meta charset="utf-8">
                            <style>
                              body {
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                margin: 0;
                                background: #f5f5f5;
                              }
                              .container {
                                text-align: center;
                                padding: 2rem;
                                background: white;
                                border-radius: 8px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                max-width: 500px;
                              }
                              h1 { color: #333; margin-bottom: 1rem; }
                              p { color: #666; line-height: 1.6; }
                            </style>
                          </head>
                          <body>
                            <div class="container">
                              <h1>サービス停止中</h1>
                              <p>このページは現在ご利用いただけません。</p>
                              <p>プランの期限が切れています。</p>
                            </div>
                          </body>
                        </html>
                        `,
                        {
                            status: 503,
                            headers: {
                                'Content-Type': 'text/html; charset=utf-8',
                            },
                        }
                    );
                }

                // クリエイターページへリライト
                // 例: custom.com/ → /[handle]
                const url = req.nextUrl.clone();

                // 既に /[handle] で始まっている場合はそのまま
                if (path.startsWith(`/${handle}`)) {
                    return NextResponse.next();
                }

                // ルートパスの場合はクリエイターのトップページへ
                if (path === "/" || path === "") {
                    url.pathname = `/${handle}/content`;
                } else {
                    // その他のパスはクリエイターのサブパスへ
                    url.pathname = `/${handle}${path}`;
                }

                // カスタムヘッダーとクッキーを追加
                const response = NextResponse.rewrite(url);
                response.headers.set('x-custom-domain', hostname);
                response.headers.set('x-creator-handle', handle);
                response.headers.set('x-creator-id', creatorId);
                // クライアント側でハンドルを取得できるようにクッキーを設定
                response.cookies.set('x-creator-handle', handle, { path: '/' });

                return response;
            } else {
                // ドメインが見つからない場合
                return new NextResponse(
                    `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>ドメインが見つかりません</title>
                        <meta charset="utf-8">
                        <style>
                          body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            margin: 0;
                            background: #f5f5f5;
                          }
                          .container {
                            text-align: center;
                            padding: 2rem;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            max-width: 500px;
                          }
                          h1 { color: #333; margin-bottom: 1rem; }
                          p { color: #666; line-height: 1.6; }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <h1>ドメインが見つかりません</h1>
                          <p>このドメインは設定されていないか、現在利用できません。</p>
                        </div>
                      </body>
                    </html>
                    `,
                    {
                        status: 404,
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8',
                        },
                    }
                );
            }
        }

        // 通常のフロー（認証チェック）
        // Note: Fan lock check is done in /[handle]/layout.tsx
        return NextResponse.next();
    },
    {
        // NEXTAUTH_SECRETを明示指定してセッションCookieを正しく読む
        secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
        // Nginx環境向けにプレフィックスなしのCookie名を設定（auth.tsと一致させる）
        cookies: {
            sessionToken: {
                name: 'next-auth.session-token',
            }
        },
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;
                const adminPathKey = process.env.ADMIN_PATH_KEY;

                // デバッグログ（問題解決後に削除可）
                if (path.startsWith('/creators')) {
                    console.log(`[MW] path=${path} token=${token ? 'OK' : 'NULL'}`);
                }

                // Public paths that don't require authentication
                if (
                    path.startsWith('/creators/login') ||
                    path.startsWith('/creators/signup') ||
                    path.startsWith('/creators/password-reset') ||
                    path.startsWith('/creators/verify-email')
                ) {
                    return true;
                }

                // Admin login path is always public (both with and without key)
                if (path === '/admin/login' || (adminPathKey && path === `/admin/${adminPathKey}/login`)) {
                    return true;
                }

                // Protected /admin/* paths require authentication (role check in layout)
                if (path.startsWith('/admin')) {
                    return !!token;
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
