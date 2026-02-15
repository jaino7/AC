import { PrismaClient, BankTransferType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VirtualAccountInput {
  accountNumber: string;
  accountName: string;
  branchCode?: string;
  purpose: 'CREATOR_PLAN' | 'FAN_CREDIT';
}

async function importAccounts() {
  console.log('Starting virtual account import...\n');

  const jsonPath = path.join(__dirname, 'virtual-accounts.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: JSON file not found at ${jsonPath}`);
    console.log('Please create virtual-accounts.json with the following structure:');
    console.log(JSON.stringify([
      {
        accountNumber: '1234567',
        accountName: 'CREATOR_PLAN_001',
        branchCode: '001',
        purpose: 'CREATOR_PLAN'
      },
      {
        accountNumber: '1234568',
        accountName: 'FAN_CREDIT_001',
        branchCode: '001',
        purpose: 'FAN_CREDIT'
      }
    ], null, 2));
    process.exit(1);
  }

  const accountsData: VirtualAccountInput[] = JSON.parse(
    fs.readFileSync(jsonPath, 'utf-8')
  );

  console.log(`Found ${accountsData.length} accounts in JSON file\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const account of accountsData) {
    try {
      const existing = await prisma.virtualAccount.findUnique({
        where: { accountNumber: account.accountNumber },
      });

      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${account.accountNumber}`);
        skipCount++;
        continue;
      }

      await prisma.virtualAccount.create({
        data: {
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          branchCode: account.branchCode || null,
          purpose: BankTransferType[account.purpose],
          isActive: true,
          isUsed: false,
          gmoAccountId: null,
        },
      });

      console.log(`✅ Imported: ${account.accountNumber} (${account.purpose})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error importing ${account.accountNumber}:`, (error as any).message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`⏭️  Skipped (duplicates):  ${skipCount}`);
  console.log(`❌ Errors:                ${errorCount}`);
  console.log(`📊 Total processed:       ${accountsData.length}`);
  console.log('='.repeat(60) + '\n');

  const creatorPlanCount = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.CREATOR_PLAN, isUsed: false },
  });
  const fanCreditCount = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.FAN_CREDIT, isUsed: false },
  });

  console.log('Current Inventory Status:');
  console.log(`  CREATOR_PLAN available: ${creatorPlanCount}`);
  console.log(`  FAN_CREDIT available:   ${fanCreditCount}\n`);
}

importAccounts()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
