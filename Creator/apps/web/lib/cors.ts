import { NextResponse } from 'next/server';

export interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const defaultOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [],
  credentials: true,
  maxAge: 86400, // 24時間
};

/**
 * CORSヘッダーを設定
 * @param response NextResponse
 * @param options CORS設定
 * @returns CORSヘッダーが設定されたNextResponse
 */
export function setCorsHeaders(
  response: NextResponse,
  options: CorsOptions = {}
): NextResponse {
  const opts = { ...defaultOptions, ...options };

  // Origin
  if (Array.isArray(opts.origin)) {
    response.headers.set('Access-Control-Allow-Origin', opts.origin.join(','));
  } else {
    response.headers.set('Access-Control-Allow-Origin', opts.origin || '*');
  }

  // Methods
  if (opts.methods) {
    response.headers.set('Access-Control-Allow-Methods', opts.methods.join(','));
  }

  // Allowed Headers
  if (opts.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', opts.allowedHeaders.join(','));
  }

  // Exposed Headers
  if (opts.exposedHeaders && opts.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', opts.exposedHeaders.join(','));
  }

  // Credentials
  if (opts.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Max Age
  if (opts.maxAge) {
    response.headers.set('Access-Control-Max-Age', opts.maxAge.toString());
  }

  return response;
}

/**
 * OPTIONSリクエストに対するプリフライトレスポンスを作成
 * @param options CORS設定
 * @returns プリフライトレスポンス
 */
export function handleCorsPreFlight(options: CorsOptions = {}): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response, options);
}

/**
 * APIルートでCORSを簡単に有効化するヘルパー
 * @param handler APIハンドラー
 * @param options CORS設定
 * @returns CORSが有効化されたハンドラー
 */
export function withCors(
  handler: (req: Request) => Promise<NextResponse> | NextResponse,
  options: CorsOptions = {}
) {
  return async (req: Request) => {
    // OPTIONSリクエストの処理（プリフライト）
    if (req.method === 'OPTIONS') {
      return handleCorsPreFlight(options);
    }

    // 実際のリクエストを処理
    const response = await handler(req);

    // CORSヘッダーを追加
    return setCorsHeaders(response, options);
  };
}
