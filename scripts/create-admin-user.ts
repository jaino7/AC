import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin';

  if (!email || !password) {
    console.error('❌ 使用方法: npm run create-admin <email> <password> [name]');
    console.error('例: npm run create-admin admin@cocoba.com SecurePassword123 "管理者"');
    process.exit(1);
  }

  // メールアドレスの検証
  if (!email.includes('@')) {
    console.error('❌ 有効なメールアドレスを入力してください');
    process.exit(1);
  }

  // パスワードの検証
  if (password.length < 6) {
    console.error('❌ パスワードは6文字以上である必要があります');
    process.exit(1);
  }

  try {
    // 既存ユーザーの確認
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // パスワードのハッシュ化（argon2を使用）
    const hashedPassword = await hash(password);

    if (existingUser) {
      // 既存ユーザーをADMINに昇格し、パスワードも更新
      console.log(`ℹ️  ユーザー ${email} は既に存在します。ADMINロールとパスワードを更新します...`);

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
        },
      });

      console.log('✅ ユーザーをADMINロールに更新し、パスワードを変更しました');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Role: ${updatedUser.role}`);
      console.log('');
      console.log('🔐 管理画面にログインできます');

      // ADMIN_PATH_KEYを環境変数から取得
      const adminPathKey = process.env.ADMIN_PATH_KEY;
      if (adminPathKey) {
        console.log(`   URL: http://localhost:3000/admin/${adminPathKey}/login`);
      } else {
        console.log(`   URL: http://localhost:3000/admin/login`);
        console.log(`   ⚠️  ADMIN_PATH_KEYが設定されていません。apps/web/.env.localに設定してください。`);
      }
      return;
    }

    // 新しいADMINユーザーを作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        emailVerified: new Date(), // ADMINユーザーは即座に認証済みとする
      },
    });

    console.log('✅ ADMINユーザーを作成しました！');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log('');
    console.log('🔐 管理画面にログインできます');

    // ADMIN_PATH_KEYを環境変数から取得
    const adminPathKey = process.env.ADMIN_PATH_KEY;
    if (adminPathKey) {
      console.log(`   URL: http://localhost:3000/admin/${adminPathKey}/login`);
    } else {
      console.log(`   URL: http://localhost:3000/admin/login`);
      console.log(`   ⚠️  ADMIN_PATH_KEYが設定されていません。apps/web/.env.localに設定してください。`);
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
