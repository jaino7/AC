import { PrismaClient, BankTransferType } from '@prisma/client';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';

const prisma = new PrismaClient();

async function updateAccountPurpose() {
  console.log('Updating account purposes from CSV...\n');

  const csvPath = process.argv[2];
  const targetPurpose = process.argv[3] as BankTransferType;

  if (!csvPath) {
    console.error('Error: CSV file path is required');
    console.log('Usage: ts-node update-account-purpose.ts <csv-file-path> <new-purpose>');
    console.log('Example: ts-node update-account-purpose.ts account_list.csv CREATOR_PLAN');
    process.exit(1);
  }

  if (!targetPurpose || !['CREATOR_PLAN', 'FAN_CREDIT'].includes(targetPurpose)) {
    console.error('Error: Invalid purpose. Must be CREATOR_PLAN or FAN_CREDIT');
    process.exit(1);
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  console.log(`CSV file: ${csvPath}`);
  console.log(`Target purpose: ${targetPurpose}\n`);

  // Read CSV file
  const csvBuffer = fs.readFileSync(csvPath);
  const csvContent = iconv.decode(csvBuffer, 'shift_jis');
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length <= 1) {
    console.error('Error: CSV file is empty or has only header');
    process.exit(1);
  }

  const accountNumbers: string[] = [];

  // Extract account numbers from CSV (skip header)
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',').map(col => col.replace(/^"/, '').replace(/"$/, '').trim());
    if (columns.length >= 3) {
      const accountNumber = columns[2];
      if (accountNumber && accountNumber.length >= 5) {
        accountNumbers.push(accountNumber);
      }
    }
  }

  console.log(`Found ${accountNumbers.length} account numbers in CSV\n`);

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const accountNumber of accountNumbers) {
    try {
      const account = await prisma.virtualAccount.findUnique({
        where: { accountNumber },
      });

      if (!account) {
        console.log(`⏭️  Not found: ${accountNumber}`);
        notFoundCount++;
        continue;
      }

      if (account.purpose === targetPurpose) {
        console.log(`⏭️  Already ${targetPurpose}: ${accountNumber}`);
        continue;
      }

      await prisma.virtualAccount.update({
        where: { accountNumber },
        data: { purpose: targetPurpose },
      });

      console.log(`✅ Updated: ${accountNumber} (${account.purpose} → ${targetPurpose})`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Error updating ${accountNumber}:`, (error as any).message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Update Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Successfully updated: ${updatedCount}`);
  console.log(`⏭️  Not found in DB:     ${notFoundCount}`);
  console.log(`📊 Total processed:      ${accountNumbers.length}`);
  console.log('='.repeat(60) + '\n');

  // Show updated inventory
  const creatorPlanCount = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.CREATOR_PLAN, isUsed: false },
  });
  const fanCreditCount = await prisma.virtualAccount.count({
    where: { purpose: BankTransferType.FAN_CREDIT, isUsed: false },
  });

  console.log('Updated Inventory Status:');
  console.log(`  CREATOR_PLAN available: ${creatorPlanCount}`);
  console.log(`  FAN_CREDIT available:   ${fanCreditCount}\n`);
}

updateAccountPurpose()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
