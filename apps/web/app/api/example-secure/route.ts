/**
 * セキュリティ機能の使用例
 * このファイルは実装例として作成されています
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/validation';
import { withCors } from '@/lib/cors';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/get-client-ip';

// 1. バリデーションスキーマを定義
const exampleSchema = z.object({
  name: z.string().min(1, '名前を入力してください').max(100),
  email: z.string().email('有効なメールアドレスを入力してください'),
  age: z.number().min(0).max(150).optional(),
});

type ExampleData = z.infer<typeof exampleSchema>;

// 2. ハンドラー関数を定義
async function handleRequest(req: NextRequest, data: ExampleData) {
  // 3. レート制限をチェック
  const clientIp = getClientIp(req);
  const rateLimitResult = await checkRateLimit(clientIp, 'default');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
        resetTime: rateLimitResult.resetTime,
      },
      { status: 429 }
    );
  }

  // 4. ビジネスロジック
  // data は型安全でバリデーション済み
  const result = {
    message: 'Success',
    data: {
      name: data.name,
      email: data.email,
      age: data.age || null,
    },
    remainingRequests: rateLimitResult.remainingPoints,
  };

  return NextResponse.json(result);
}

// 5. バリデーション、CORS、レート制限を適用
export const POST = withCors(
  withValidation(exampleSchema, handleRequest),
  {
    origin: ['http://localhost:3000'],
    methods: ['POST', 'OPTIONS'],
    credentials: true,
  }
);

// OPTIONSリクエスト（プリフライト）の処理
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
