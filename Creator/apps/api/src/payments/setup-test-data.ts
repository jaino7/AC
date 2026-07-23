/**
 * テストデータセットアップスクリプト
 *
 * 使い方:
 * npx ts-node src/payments/setup-test-data.ts
 */

import { PrismaClient, BankTransferType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('テストデータセットアップ開始');
  console.log('========================================\n');

  // 1. テスト用クリエイターの作成（または取得）
  console.log('[1/4] テスト用クリエイターを作成中...');

  let user = await prisma.user.findFirst({
    where: { email: 'test-creator@example.com' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test-creator@example.com',
        name: 'Test Creator',
        role: 'CREATOR',
        password: 'hashed_password_here', // 本番環境では適切にハッシュ化
      },
    });
    console.log(`✓ ユーザー作成: ${user.id}`);
  } else {
    console.log(`✓ 既存ユーザーを使用: ${user.id}`);
  }

  let creator = await prisma.creatorProfile.findUnique({
    where: { userId: user.id },
  });

  if (!creator) {
    creator = await prisma.creatorProfile.create({
      data: {
        userId: user.id,
        handle: 'test-creator',
        displayName: 'Test Creator',
        theme: 'creator-pro',
      },
    });
    console.log(`✓ クリエイタープロフィール作成: ${creator.id}`);
  } else {
    console.log(`✓ 既存クリエイターを使用: ${creator.id}`);
  }

  // 2. テスト用ファンユーザーの作成（または取得）
  console.log('\n[2/4] テスト用ファンユーザーを作成中...');

  let fanUser = await prisma.user.findFirst({
    where: { email: 'test-fan@example.com' },
  });

  if (!fanUser) {
    fanUser = await prisma.user.create({
      data: {
        email: 'test-fan@example.com',
        name: 'Test Fan',
        role: 'USER',
        password: 'hashed_password_here',
      },
    });
    console.log(`✓ ファンユーザー作成: ${fanUser.id}`);
  } else {
    console.log(`✓ 既存ファンユーザーを使用: ${fanUser.id}`);
  }

  // 3. バーチャル口座の在庫確認・作成
  console.log('\n[3/4] バーチャル口座の在庫を確認中...');

  const availableAccounts = await prisma.virtualAccount.count({
    where: {
      purpose: BankTransferType.FAN_CREDIT,
      isUsed: false,
      isActive: true,
    },
  });

  console.log(`現在の在庫: ${availableAccounts}件`);

  if (availableAccounts < 5) {
    console.log('在庫が少ないため、テスト用口座を追加します...');

    const accountsToCreate = 5 - availableAccounts;

    for (let i = 0; i < accountsToCreate; i++) {
      const accountNumber = String(1000000 + Math.floor(Math.random() * 9000000));

      await prisma.virtualAccount.create({
        data: {
          accountNumber,
          accountName: 'GMOアオゾラネット',
          branchCode: '001',
          purpose: BankTransferType.FAN_CREDIT,
          isUsed: false,
          isActive: true,
        },
      });

      console.log(`  ✓ 口座作成: ${accountNumber}`);
    }
  } else {
    console.log('✓ 十分な在庫があります');
  }

  // 4. 環境情報の表示
  console.log('\n[4/4] テスト実行用の環境変数を表示中...');
  console.log('\n========================================');
  console.log('セットアップ完了');
  console.log('========================================\n');

  console.log('以下の情報をテストスクリプトに設定してください:\n');
  console.log(`CREATOR_ID="${creator.id}"`);
  console.log(`FAN_USER_ID="${fanUser.id}"`);
  console.log(`CREATOR_HANDLE="test-creator"`);
  console.log('\n.envに以下が設定されていることを確認してください:\n');
  console.log('AUTOMATION_WEBHOOK_SECRET="your-secret-key-here"');
  console.log('\nテスト実行コマンド:');
  console.log('  PowerShell: .\\test-payment-flow.ps1');
  console.log('  Bash: ./test-payment-flow.sh');
  console.log('\nまたは、以下のcurlコマンドでテスト:');
  console.log(`
curl -X POST http://localhost:3000/api/payments/charge \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "creatorId": "${creator.id}"
  }'
  `);
}

main()
  .catch((e) => {
    console.error('エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
