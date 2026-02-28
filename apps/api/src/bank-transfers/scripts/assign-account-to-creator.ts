import { PrismaClient, BankTransferType } from '@prisma/client';

const prisma = new PrismaClient();

async function assignAccountToCreator(creatorId: string) {
  console.log(`\n🔍 Assigning virtual account to creator: ${creatorId}\n`);

  try {
    // 1. クリエイター情報を取得
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: {
        user: true,
        creatorSubscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!creator) {
      throw new Error(`Creator not found: ${creatorId}`);
    }

    console.log('📋 Creator Info:');
    console.log(`  Name: ${creator.displayName}`);
    console.log(`  Handle: ${creator.handle}`);
    console.log(`  Email: ${creator.user?.email}`);
    console.log('');

    if (!creator.creatorSubscription) {
      throw new Error('Creator does not have a subscription');
    }

    console.log('💳 Subscription Info:');
    console.log(`  ID: ${creator.creatorSubscription.id}`);
    console.log(`  Plan: ${creator.creatorSubscription.plan.name} (${creator.creatorSubscription.plan.type})`);
    console.log(`  Status: ${creator.creatorSubscription.status}`);
    console.log('');

    // 2. 既に口座が割り当てられているか確認
    const existingAccount = await prisma.virtualAccount.findFirst({
      where: {
        creatorId,
        purpose: BankTransferType.CREATOR_PLAN,
        isActive: true,
      },
    });

    if (existingAccount) {
      console.log('✅ Virtual account already assigned:');
      console.log(`  Account Number: ${existingAccount.accountNumber}`);
      console.log(`  Branch Code: ${existingAccount.branchCode}`);
      console.log(`  Account Name: ${existingAccount.accountName}`);
      console.log(`  Is Used: ${existingAccount.isUsed}`);
      console.log(`  Assigned At: ${existingAccount.assignedAt}`);
      console.log('');
      return existingAccount;
    }

    console.log('🔎 No existing account found. Looking for available account...\n');

    // 3. 未使用の口座を検索
    const availableAccount = await prisma.virtualAccount.findFirst({
      where: {
        purpose: BankTransferType.CREATOR_PLAN,
        isUsed: false,
        isActive: true,
        creatorId: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!availableAccount) {
      throw new Error(
        'No available virtual accounts. Please import more accounts or check cooling period.',
      );
    }

    console.log('📦 Available account found:');
    console.log(`  Account Number: ${availableAccount.accountNumber}`);
    console.log(`  Branch Code: ${availableAccount.branchCode}`);
    console.log(`  Account Name: ${availableAccount.accountName}`);
    console.log('');

    // 5. 口座を割り当て
    console.log('⚙️  Assigning account to creator...\n');

    const assignedAccount = await prisma.virtualAccount.update({
      where: { id: availableAccount.id },
      data: {
        creatorId,
        isUsed: true,
        assignedToPaymentId: creator.creatorSubscription.id,
        assignedAt: new Date(),
      },
    });

    console.log('✅ Virtual account assigned successfully!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 Assignment Details:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Creator ID:      ${creatorId}`);
    console.log(`  Creator Name:    ${creator.displayName}`);
    console.log(`  Creator Handle:  ${creator.handle}`);
    console.log('');
    console.log(`  Account Number:  ${assignedAccount.accountNumber}`);
    console.log(`  Branch Code:     ${assignedAccount.branchCode}`);
    console.log(`  Account Name:    ${assignedAccount.accountName}`);
    console.log(`  Purpose:         ${assignedAccount.purpose}`);
    console.log(`  Assigned At:     ${assignedAccount.assignedAt}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    return assignedAccount;
  } catch (error) {
    console.error('❌ Error assigning virtual account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// コマンドライン引数からクリエイターIDを取得
const creatorId = process.argv[2];

if (!creatorId) {
  console.error('Usage: ts-node assign-account-to-creator.ts <creatorId>');
  process.exit(1);
}

assignAccountToCreator(creatorId)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
