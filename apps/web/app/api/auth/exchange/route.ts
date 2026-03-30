import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * カスタムドメインでセッション Cookie を設定する交換エンドポイント
 *
 * メインドメインの /api/auth/cross-domain から署名付きトークンを受け取り、
 * 検証後にセッション Cookie をカスタムドメインに設定してリダイレクト
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const redirect = req.nextUrl.searchParams.get("redirect") || "/";

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    // 交換トークンをデコード
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    const { sessionToken, timestamp, signature } = payload;

    if (!sessionToken || !timestamp || !signature) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
    }

    // 有効期限チェック（30秒）
    const elapsed = Date.now() - parseInt(timestamp);
    if (elapsed > 30000 || elapsed < 0) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // 署名検証
    const secret = process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production";
    const expectedSignature = createHmac("sha256", secret)
      .update(`${sessionToken}:${timestamp}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid token signature" }, { status: 400 });
    }

    // リダイレクト先の決定（Nginx経由で req.url が localhost になるのを防ぐため、Hostヘッダーを使用）
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
    const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
    const baseUrl = `${proto.replace(':', '')}://${host}`;
    
    // セッション Cookie をカスタムドメインに設定してリダイレクト
    const response = NextResponse.redirect(new URL(redirect, baseUrl));
    response.cookies.set("next-auth.session-token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: req.nextUrl.protocol === "https:",
      maxAge: 30 * 24 * 60 * 60, // 30 days (auth.ts と同じ)
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
}
