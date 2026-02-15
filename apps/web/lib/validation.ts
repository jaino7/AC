import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * 共通のバリデーションスキーマ
 */
export const commonSchemas = {
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
  handle: z.string()
    .min(3, 'ハンドル名は3文字以上である必要があります')
    .max(30, 'ハンドル名は30文字以内である必要があります')
    .regex(/^[a-z0-9_-]+$/, 'ハンドル名は小文字英数字、ハイフン、アンダースコアのみ使用できます'),
  url: z.string().url('有効なURLを入力してください'),
  positiveInt: z.number().int().positive(),
  dateString: z.string().datetime(),
};

/**
 * リクエストボディをバリデーション
 * @param body リクエストボディ
 * @param schema Zodスキーマ
 * @returns バリデーション結果
 */
export function validateBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * バリデーションエラーレスポンスを作成
 * @param errors Zodエラー
 * @returns エラーレスポンス
 */
export function validationErrorResponse(errors: z.ZodError): NextResponse {
  const formattedErrors = errors.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return NextResponse.json(
    {
      error: 'Validation failed',
      errors: formattedErrors,
    },
    { status: 400 }
  );
}

/**
 * APIルートでバリデーションを簡単に使うヘルパー
 * @param handler APIハンドラー
 * @param schema Zodスキーマ
 * @returns バリデーション付きハンドラー
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: Request, data: T) => Promise<NextResponse> | NextResponse
) {
  return async (req: Request) => {
    try {
      const body = await req.json();
      const validation = validateBody(body, schema);

      if (!validation.success) {
        return validationErrorResponse(validation.errors);
      }

      return await handler(req, validation.data);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
  };
}

/**
 * 使用例用のスキーマ
 */
export const exampleSchemas = {
  // ログインスキーマ
  login: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
  }),

  // ユーザー登録スキーマ
  signup: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    name: z.string().min(1, '名前を入力してください').max(100),
  }),

  // プロフィール更新スキーマ
  updateProfile: z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: commonSchemas.url.optional(),
  }),

  // コンテンツ作成スキーマ
  createPost: z.object({
    title: z.string().min(1, 'タイトルを入力してください').max(200),
    content: z.string().min(1, 'コンテンツを入力してください'),
    price: z.number().min(0).optional(),
    isPublic: z.boolean().optional(),
  }),
};
