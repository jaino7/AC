import { PrismaClient, BankTransferType } from '@prisma/client';

const prisma = new PrismaClient();

async function checkInventory() {
  console.log('='.repeat(70));
  console.log('バーチャル口座在庫状況');
  console.log('='.repeat(70));
  console.log();

  // CREATOR_PLAN口座
  const creatorPlanTotal = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.CREATOR_PLAN },
  });
  const creatorPlanUsed = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.CREATOR_PLAN, isUsed: true },
  });
  const creatorPlanAvailable = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.CREATOR_PLAN, isUsed: false },
  });

  console.log('📊 CREATOR_PLAN（クリエイタープラン用）');
  console.log(`   合計: ${creatorPlanTotal}口座`);
  console.log(`   使用中: ${creatorPlanUsed}口座`);
  console.log(`   利用可能: ${creatorPlanAvailable}口座`);
  console.log();

  // FAN_CREDIT口座
  const fanCreditTotal = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.FAN_CREDIT },
  });
  const fanCreditUsed = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.FAN_CREDIT, isUsed: true },
  });
  const fanCreditAvailable = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.FAN_CREDIT, isUsed: false },
  });

  console.log('📊 FAN_CREDIT（ファンクレジット用）');
  console.log(`   合計: ${fanCreditTotal}口座`);
  console.log(`   使用中: ${fanCreditUsed}口座`);
  console.log(`   利用可能: ${fanCreditAvailable}口座`);
  console.log();

  console.log('='.repeat(70));
  console.log('使用中の口座一覧');
  console.log('='.repeat(70));
  console.log();

  // 使用中のCREATOR_PLAN口座
  const usedCreatorAccounts = await prisma.virtualAccount.findMany({
    where: {
      purpose: BankTransferType.CREATOR_PLAN,
      isUsed: true,
    },
    include: {
      creator: {
        select: {
          handle: true,
          displayName: true,
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  if (usedCreatorAccounts.length > 0) {
    console.log('CREATOR_PLAN使用中:');
    for (const acc of usedCreatorAccounts) {
      const assignedDate = acc.assignedAt
        ? new Date(acc.assignedAt).toLocaleString('ja-JP')
        : '不明';
      console.log(
        `  口座番号: ${acc.accountNumber} | クリエイター: ${acc.creator?.handle || 'N/A'} (${acc.creator?.displayName || 'N/A'}) | 割当日: ${assignedDate}`
      );
    }
    console.log();
  } else {
    console.log('CREATOR_PLAN使用中: なし\n');
  }

  // 使用中のFAN_CREDIT口座
  const usedFanAccounts = await prisma.virtualAccount.findMany({
    where: {
      purpose: BankTransferType.FAN_CREDIT,
      isUsed: true,
    },
    orderBy: { assignedAt: 'desc' },
    take: 10,
  });

  if (usedFanAccounts.length > 0) {
    console.log('FAN_CREDIT使用中（最新10件）:');
    for (const acc of usedFanAccounts) {
      const assignedDate = acc.assignedAt
        ? new Date(acc.assignedAt).toLocaleString('ja-JP')
        : '不明';
      console.log(
        `  口座番号: ${acc.accountNumber} | Payment ID: ${acc.assignedToPaymentId || 'N/A'} | 割当日: ${assignedDate}`
      );
    }
    console.log();
  } else {
    console.log('FAN_CREDIT使用中: なし\n');
  }

  console.log('='.repeat(70));
  console.log('利用可能な口座サンプル（各5件）');
  console.log('='.repeat(70));
  console.log();

  // 利用可能なCREATOR_PLAN口座
  const availableCreatorAccounts = await prisma.virtualAccount.findMany({
    where: {
      purpose: BankTransferType.CREATOR_PLAN,
      isUsed: false,
    },
    take: 5,
    orderBy: { accountNumber: 'asc' },
  });

  console.log('CREATOR_PLAN利用可能:');
  if (availableCreatorAccounts.length > 0) {
    for (const acc of availableCreatorAccounts) {
      console.log(
        `  口座番号: ${acc.accountNumber} | 口座名義: ${acc.accountName} | 支店: ${acc.branchCode}`
      );
    }
  } else {
    console.log('  なし');
  }
  console.log();

  // 利用可能なFAN_CREDIT口座
  const availableFanAccounts = await prisma.virtualAccount.findMany({
    where: {
      purpose: BankTransferType.FAN_CREDIT,
      isUsed: false,
    },
    take: 5,
    orderBy: { accountNumber: 'asc' },
  });

  console.log('FAN_CREDIT利用可能:');
  if (availableFanAccounts.length > 0) {
    for (const acc of availableFanAccounts) {
      console.log(
        `  口座番号: ${acc.accountNumber} | 口座名義: ${acc.accountName} | 支店: ${acc.branchCode}`
      );
    }
  } else {
    console.log('  なし');
  }
  console.log();

  // アラート
  console.log('='.repeat(70));
  console.log('⚠️  アラート');
  console.log('='.repeat(70));
  console.log();

  if (creatorPlanAvailable < 10) {
    console.log(`⚠️  CREATOR_PLAN口座の残りが少なくなっています（残り${creatorPlanAvailable}口座）`);
  }
  if (fanCreditAvailable < 50) {
    console.log(`⚠️  FAN_CREDIT口座の残りが少なくなっています（残り${fanCreditAvailable}口座）`);
  }
  if (creatorPlanAvailable >= 10 && fanCreditAvailable >= 50) {
    console.log('✅ すべての口座に十分な在庫があります');
  }
  console.log();
}

checkInventory()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
