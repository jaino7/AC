import { NextRequest } from 'next/server';

/**
 * リクエストからクライアントIPアドレスを取得
 * プロキシ環境にも対応
 * @param req NextRequest
 * @returns IPアドレス
 */
export function getClientIp(req: NextRequest): string {
  // X-Forwarded-For ヘッダーをチェック（プロキシ経由の場合）
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // 複数のIPがある場合、最初のものが実際のクライアントIP
    return forwardedFor.split(',')[0].trim();
  }

  // X-Real-IP ヘッダーをチェック
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // CF-Connecting-IP（Cloudflare）
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  // req.ip（直接接続の場合）
  if (req.ip) {
    return req.ip;
  }

  // フォールバック
  return 'unknown';
}
