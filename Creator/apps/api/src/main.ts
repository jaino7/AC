import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS設定（より詳細な設定）
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 3600, // 1時間
  });

  // バリデーションパイプ（より厳密な設定）
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTOに定義されていないプロパティを削除
    forbidNonWhitelisted: true, // 未定義のプロパティがある場合エラー
    transform: true, // リクエストデータを自動変換
    transformOptions: {
      enableImplicitConversion: true, // 型の暗黙的変換を有効化
    },
  }));

  // 静的ファイル配信（アップロードした画像用）
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API server running on http://localhost:${port}`);
}

bootstrap();
