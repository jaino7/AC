/**
 * テスト結果検証スクリプト
 * 使い方: npx ts-node src/payments/verify-test-results.ts <chargeRequestId>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const chargeRequestId = process.argv[2] || 'cml36milo0003vjnw7zpebbfj';

  console.log('========================================');
  console.log('決済フローテスト結果検証');
  console.log('========================================\n');

  // 1. ChargeRequestの確認
  console.log('[1/5] ChargeRequestの状態を確認中...');
  const chargeRequest = await prisma.chargeRequest.findUnique({
    where: { id: chargeRequestId },
    include: { fan: true },
  });

  if (!chargeRequest) {
    console.log('❌ ChargeRequestが見つかりません');
    return;
  }

  console.log(`✓ ChargeRequest ID: ${chargeRequest.id}`);
  console.log(`  - Status: ${chargeRequest.status}`);
  console.log(`  - Amount: ${chargeRequest.amount}円`);

  console.log(`  - Transferor Name: ${chargeRequest.transferorName || 'N/A'}`);
  console.log(`  - Approved At: ${chargeRequest.approvedAt || 'N/A'}`);

  if (chargeRequest.status === 'APPROVED') {
    console.log('  ✓ ステータス: APPROVED（承認済み）');
  } else {
    console.log(`  ❌ ステータス: ${chargeRequest.status}（APPROVED以外）`);
  }

  // 2. FanProfileのクレジット残高確認
  console.log('\n[2/5] FanProfileのクレジット残高を確認中...');
  const fanProfile = await prisma.fanProfile.findUnique({
    where: { id: chargeRequest.fanId },
  });

  if (!fanProfile) {
    console.log('❌ FanProfileが見つかりません');
    return;
  }

  console.log(`✓ FanProfile ID: ${fanProfile.id}`);
  console.log(`  - Credits: ${fanProfile.credits}円`);

  if (fanProfile.credits >= chargeRequest.amount) {
    console.log(`  ✓ クレジット残高が正しく更新されています`);
  } else {
    console.log(`  ❌ クレジット残高が不足しています`);
  }

  // 3. CreditHistoryの確認
  console.log('\n[3/5] CreditHistoryを確認中...');
  const creditHistory = await prisma.creditHistory.findFirst({
    where: { chargeRequestId: chargeRequest.id },
    orderBy: { createdAt: 'desc' },
  });

  if (creditHistory) {
    console.log(`✓ CreditHistory ID: ${creditHistory.id}`);
    console.log(`  - Type: ${creditHistory.type}`);
    console.log(`  - Amount: ${creditHistory.amount}円`);
    console.log(`  - Balance: ${creditHistory.balance}円`);
    console.log(`  - Description: ${creditHistory.description}`);
  } else {
    console.log('❌ CreditHistoryが見つかりません');
  }

  // 4. VirtualAccountの状態確認
  console.log('\n[4/5] VirtualAccountの状態を確認中...');
  const virtualAccount = await prisma.virtualAccount.findFirst({
    where: { assignedToPaymentId: chargeRequest.id },
  });

  if (virtualAccount) {
    console.log(`✓ VirtualAccount: ${virtualAccount.accountNumber}`);
    console.log(`  - Is Used: ${virtualAccount.isUsed}`);
    console.log(`  - Assigned To Payment ID: ${virtualAccount.assignedToPaymentId || 'NULL'}`);

    if (!virtualAccount.isUsed && !virtualAccount.assignedToPaymentId) {
      console.log('  ✓ 口座が在庫に戻されています');
    } else {
      console.log('  ❌ 口座がまだ使用中または割り当てられています');
    }
  } else {
    console.log('⚠ VirtualAccountが見つかりません（既に在庫に戻された可能性があります）');

    // 別の方法で確認
    const releasedAccount = await prisma.virtualAccount.findMany({
      where: {
        isUsed: false,
        purpose: 'FAN_CREDIT',
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });

    console.log(`\n  利用可能な口座（最新5件）:`);
    releasedAccount.forEach((acc, index) => {
      console.log(`    ${index + 1}. ${acc.accountNumber} (更新: ${acc.updatedAt})`);
    });
  }

  // 5. BankTransferの確認
  console.log('\n[5/5] BankTransferの処理状況を確認中...');
  const bankTransfer = await prisma.bankTransfer.findFirst({
    where: { chargeRequestId: chargeRequest.id },
    orderBy: { createdAt: 'desc' },
  });

  if (bankTransfer) {
    console.log(`✓ BankTransfer ID: ${bankTransfer.id}`);
    console.log(`  - Amount: ${bankTransfer.amount}円`);
    console.log(`  - Transferor Name: ${bankTransfer.transferorName}`);
    console.log(`  - Status: ${bankTransfer.status}`);
    console.log(`  - Processed At: ${bankTransfer.processedAt || 'N/A'}`);

    if (bankTransfer.status === 'PROCESSED') {
      console.log('  ✓ ステータス: PROCESSED（処理済み）');
    } else {
      console.log(`  ❌ ステータス: ${bankTransfer.status}（PROCESSED以外）`);
    }
  } else {
    console.log('❌ BankTransferが見つかりません');
  }

  // 総合判定
  console.log('\n========================================');
  console.log('総合判定');
  console.log('========================================\n');

  const allChecks = [
    chargeRequest.status === 'APPROVED',
    fanProfile.credits >= chargeRequest.amount,
    creditHistory !== null,
    virtualAccount !== null && !virtualAccount.isUsed,
    bankTransfer !== null && bankTransfer.status === 'PROCESSED',
  ];

  const passedChecks = allChecks.filter((check) => check).length;
  const totalChecks = allChecks.length;

  console.log(`チェック結果: ${passedChecks}/${totalChecks} 合格\n`);

  if (passedChecks === totalChecks) {
    console.log('🎉 全ての検証に合格しました！');
    console.log('\n決済フローが正常に動作しています。');
  } else {
    console.log('⚠ 一部の検証に失敗しました。');
    console.log('\n上記のエラーを確認してください。');
  }

  console.log('\n========================================\n');
}

main()
  .catch((e) => {
    console.error('エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
