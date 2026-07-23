import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "crypto";

/**
 * Google OAuth完了後、メインドメインのセッションをカスタムドメインに転送する
 *
 * Flow:
 * 1. Google OAuth がメインドメインで完了 → セッション Cookie がメインドメインに設定される
 * 2. NextAuth が callbackUrl としてこのエンドポイントにリダイレクト
 * 3. セッション Cookie を読み取り、署名付き交換トークンを生成
 * 4. カスタムドメインの /api/auth/exchange にリダイレクト
 */
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  const path = req.nextUrl.searchParams.get("path") || "/";

  if (!domain) {
    return NextResponse.json({ error: "Missing domain parameter" }, { status: 400 });
  }

  // セッション Cookie を読み取り
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("next-auth.session-token")?.value;

  if (!sessionToken) {
    // セッションがない場合（OAuth失敗時）、カスタムドメインのログインページへ
    const protocol = req.nextUrl.protocol;
    return NextResponse.redirect(`${protocol}//${domain}/login?error=OAuthFailed`);
  }

  // 署名付き交換トークンを生成（30秒有効）
  const secret = process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production";
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", secret)
    .update(`${sessionToken}:${timestamp}`)
    .digest("hex");

  const exchangePayload = JSON.stringify({ sessionToken, timestamp, signature });
  const exchangeToken = Buffer.from(exchangePayload).toString("base64url");

  // カスタムドメインの exchange エンドポイントへリダイレクト
  const protocol = req.nextUrl.protocol;
  const exchangeUrl = `${protocol}//${domain}/api/auth/exchange?token=${exchangeToken}&redirect=${encodeURIComponent(path)}`;

  return NextResponse.redirect(exchangeUrl);
}
