# セキュリティ実装ガイド

## 📋 実装済みのセキュリティ機能

### 1. レート制限（Rate Limiting）
### 2. CORS設定
### 3. 入力バリデーション

---

## 🛡️ 1. レート制限（Rate Limiting）

リクエスト数を制限して、DDoS攻撃やブルートフォース攻撃を防ぎます。

### Next.js（apps/web）

#### 基本的な使い方

```typescript
import { checkRateLimit } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/get-client-ip';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // クライアントIPを取得
  const clientIp = getClientIp(req);

  // レート制限をチェック
  const rateLimitResult = await checkRateLimit(clientIp, 'default');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        resetTime: rateLimitResult.resetTime,
      },
      { status: 429 }
    );
  }

  // 通常の処理
  return NextResponse.json({ success: true });
}
```

#### レート制限のタイプ

| タイプ | リクエスト数 | 期間 | 用途 |
|--------|-------------|------|------|
| `default` | 100 | 15分 | 通常のAPI |
| `auth` | 5 | 15分 | ログイン・認証 |
| `admin` | 10 | 15分 | 管理画面 |

#### 認証エンドポイントの例

```typescript
// apps/web/app/api/auth/login/route.ts
import { checkRateLimit } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/get-client-ip';

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 認証用の厳しいレート制限
  const rateLimitResult = await checkRateLimit(clientIp, 'auth');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください。' },
      { status: 429 }
    );
  }

  // ログイン処理...
}
```

### NestJS（apps/api）

#### グローバル設定

`app.module.ts` で設定済み：

```typescript
ThrottlerModule.forRoot([{
  ttl: 60000, // 60秒
  limit: 100, // 100リクエスト
}])
```

#### カスタムレート制限

特定のエンドポイントでレート制限をカスタマイズ：

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  // 1分間に5リクエストまで
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // ログイン処理
  }

  // このエンドポイントはレート制限を無効化
  @SkipThrottle()
  @Get('public')
  getPublicInfo() {
    return { message: 'Public information' };
  }
}
```

---

## 🌐 2. CORS設定

クロスオリジンリクエストを適切に制御します。

### Next.js（apps/web）

#### 基本的な使い方

```typescript
import { withCors } from '@/lib/cors';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  return NextResponse.json({ message: 'Success' });
}

export const GET = withCors(handler, {
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST'],
  credentials: true,
});

export const POST = withCors(handler);
```

#### CORSオプション

```typescript
{
  origin: string | string[],        // 許可するオリジン
  methods: string[],                // 許可するHTTPメソッド
  allowedHeaders: string[],         // 許可するヘッダー
  exposedHeaders: string[],         // 公開するヘッダー
  credentials: boolean,             // 認証情報を含むか
  maxAge: number,                   // プリフライトのキャッシュ時間（秒）
}
```

### NestJS（apps/api）

`main.ts` で設定済み：

```typescript
app.enableCors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 3600,
});
```

---

## ✅ 3. 入力バリデーション

リクエストデータを検証して、不正なデータを拒否します。

### Next.js（apps/web） - Zod

#### 基本的な使い方

```typescript
import { withValidation } from '@/lib/validation';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// バリデーションスキーマを定義
const createPostSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください').max(200),
  content: z.string().min(1, 'コンテンツを入力してください'),
  price: z.number().min(0).optional(),
});

// withValidationでラップ
async function handler(req: Request, data: z.infer<typeof createPostSchema>) {
  // data は型安全で、バリデーション済み
  return NextResponse.json({
    message: 'Created',
    data,
  });
}

export const POST = withValidation(createPostSchema, handler);
```

#### 共通スキーマの使用

```typescript
import { commonSchemas, exampleSchemas } from '@/lib/validation';
import { z } from 'zod';

// 共通スキーマを使用
const signupSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  name: z.string().min(1).max(100),
});

// 既存のスキーマを使用
import { exampleSchemas } from '@/lib/validation';
const loginSchema = exampleSchemas.login;
```

#### 手動バリデーション

```typescript
import { validateBody, validationErrorResponse } from '@/lib/validation';
import { z } from 'zod';

export async function POST(req: Request) {
  const body = await req.json();

  const schema = z.object({
    username: z.string().min(3),
  });

  const validation = validateBody(body, schema);

  if (!validation.success) {
    return validationErrorResponse(validation.errors);
  }

  // validation.data を使用（型安全）
  const { username } = validation.data;

  return NextResponse.json({ username });
}
```

### NestJS（apps/api） - class-validator

#### DTOの作成

```typescript
// src/creators/dto/create-creator.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCreatorDto {
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'パスワードは6文字以上である必要があります' })
  password: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;
}
```

#### コントローラーで使用

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { CreateCreatorDto } from './dto/create-creator.dto';

@Controller('creators')
export class CreatorsController {
  @Post()
  create(@Body() createCreatorDto: CreateCreatorDto) {
    // createCreatorDto は自動的にバリデーション済み
    return this.creatorsService.create(createCreatorDto);
  }
}
```

#### よく使うデコレーター

```typescript
// 文字列
@IsString()
@MinLength(3)
@MaxLength(100)
@IsEmail()
@IsUrl()

// 数値
@IsNumber()
@IsInt()
@Min(0)
@Max(100)
@IsPositive()

// 真偽値
@IsBoolean()

// 配列
@IsArray()
@ArrayMinSize(1)
@ArrayMaxSize(10)

// オプショナル
@IsOptional()

// ネストしたオブジェクト
@ValidateNested()
@Type(() => AddressDto)
address: AddressDto;
```

---

## 🔒 セキュリティベストプラクティス

### 1. 環境変数の管理

```bash
# .env.local（開発環境）
NEXTAUTH_SECRET="development-secret-change-in-production"
ADMIN_PATH_KEY="dev-key-12345"

# .env（本番環境）
NEXTAUTH_SECRET="<強力なランダム文字列>"
ADMIN_PATH_KEY="<強力なランダム文字列>"
```

### 2. HTTPSの使用

本番環境では必ずHTTPSを使用してください。

### 3. セキュリティヘッダー

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // セキュリティヘッダーを追加
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}
```

### 4. SQLインジェクション対策

Prismaを使用しているため、自動的にSQLインジェクションから保護されています：

```typescript
// ✅ 安全（パラメータ化されたクエリ）
const user = await prisma.user.findUnique({
  where: { email: userInput },
});

// ❌ 危険（生のクエリは避ける）
const users = await prisma.$queryRawUnsafe(`SELECT * FROM User WHERE email = '${userInput}'`);
```

### 5. XSS対策

```typescript
// ✅ 安全（Reactは自動的にエスケープ）
<div>{userInput}</div>

// ❌ 危険（dangerouslySetInnerHTMLは避ける）
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// HTMLを表示する必要がある場合はサニタイズ
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);
```

### 6. 認証トークンの管理

```typescript
// ✅ HttpOnly Cookieを使用（XSSから保護）
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,  // JavaScriptからアクセス不可
      sameSite: 'lax', // CSRF対策
      secure: true,    // HTTPS必須（本番環境）
    },
  },
}

// ❌ localStorageは使わない（XSSに脆弱）
```

---

## 📊 監視とログ

### レート制限のログ

```typescript
import { checkRateLimit } from '@/lib/rate-limiter';

const result = await checkRateLimit(clientIp, 'auth');

if (!result.success) {
  console.warn(`Rate limit exceeded for IP: ${clientIp}`);
  // 監視サービスに送信（例: Sentry, DataDog）
}
```

### バリデーションエラーのログ

```typescript
if (!validation.success) {
  console.error('Validation failed:', {
    ip: clientIp,
    errors: validation.errors.errors,
  });
}
```

---

## 🧪 テスト

### レート制限のテスト

```typescript
// レート制限をリセット（テスト後）
import { resetRateLimit } from '@/lib/rate-limiter';

afterEach(async () => {
  await resetRateLimit('test-ip', 'default');
});
```

---

## ⚠️ 注意事項

1. **本番環境では必ず強力なシークレットキーを使用**
2. **HTTPS を有効化**
3. **定期的なセキュリティアップデート**
4. **ログの監視とアラート設定**
5. **レート制限の閾値は環境に応じて調整**

---

## 📚 参考リンク

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Zod Documentation](https://zod.dev/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [NestJS Throttler](https://docs.nestjs.com/security/rate-limiting)
