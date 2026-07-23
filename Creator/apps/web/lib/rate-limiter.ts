import { RateLimiterMemory } from 'rate-limiter-flexible';

// IPアドレスベースのレート制限
// 15分間に100リクエストまで
const rateLimiter = new RateLimiterMemory({
  points: 100, // リクエスト数
  duration: 15 * 60, // 15分（秒単位）
});

// 認証エンドポイント用の厳しいレート制限
// 15分間に5リクエストまで
const authRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 15 * 60,
});

// 管理画面用のレート制限
// 15分間に10リクエストまで
const adminRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 15 * 60,
});

export interface RateLimitResult {
  success: boolean;
  remainingPoints?: number;
  resetTime?: Date;
}

/**
 * レート制限をチェック
 * @param identifier ユーザー識別子（IPアドレスなど）
 * @param type レート制限のタイプ
 * @returns レート制限の結果
 */
export async function checkRateLimit(
  identifier: string,
  type: 'default' | 'auth' | 'admin' = 'default'
): Promise<RateLimitResult> {
  const limiter =
    type === 'auth' ? authRateLimiter :
    type === 'admin' ? adminRateLimiter :
    rateLimiter;

  try {
    const result = await limiter.consume(identifier);
    return {
      success: true,
      remainingPoints: result.remainingPoints,
      resetTime: new Date(Date.now() + result.msBeforeNext),
    };
  } catch (error: any) {
    // レート制限超過
    return {
      success: false,
      remainingPoints: 0,
      resetTime: new Date(Date.now() + error.msBeforeNext),
    };
  }
}

/**
 * レート制限をリセット（テスト用）
 * @param identifier ユーザー識別子
 * @param type レート制限のタイプ
 */
export async function resetRateLimit(
  identifier: string,
  type: 'default' | 'auth' | 'admin' = 'default'
): Promise<void> {
  const limiter =
    type === 'auth' ? authRateLimiter :
    type === 'admin' ? adminRateLimiter :
    rateLimiter;

  await limiter.delete(identifier);
}
