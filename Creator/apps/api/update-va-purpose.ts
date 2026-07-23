import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePurpose() {
  console.log('Updating virtual account purposes...\n');

  // Get total count
  const totalCount = await prisma.virtualAccount.count({
    where: { purpose: 'CREATOR_PLAN' },
  });

  console.log(`Total CREATOR_PLAN accounts: ${totalCount}`);

  // Convert half to FAN_CREDIT (or specify how many you want)
  const convertCount = Math.floor(totalCount / 2);
  console.log(`Converting ${convertCount} accounts to FAN_CREDIT...\n`);

  // Get accounts to convert (unassigned ones first)
  const accountsToConvert = await prisma.virtualAccount.findMany({
    where: {
      purpose: 'CREATOR_PLAN',
      fanId: null,
      creatorId: null,
    },
    take: convertCount,
    select: { id: true, accountNumber: true },
  });

  let successCount = 0;

  for (const account of accountsToConvert) {
    try {
      await prisma.virtualAccount.update({
        where: { id: account.id },
        data: { purpose: 'FAN_CREDIT' },
      });
      console.log(`✅ Converted: ${account.accountNumber}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${account.accountNumber}`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Successfully converted: ${successCount} accounts`);
  console.log('='.repeat(60) + '\n');

  // Show current inventory
  const creatorCount = await prisma.virtualAccount.count({
    where: { purpose: 'CREATOR_PLAN', fanId: null, creatorId: null },
  });
  const fanCount = await prisma.virtualAccount.count({
    where: { purpose: 'FAN_CREDIT', fanId: null },
  });

  console.log('Current Inventory:');
  console.log(`  CREATOR_PLAN available: ${creatorCount}`);
  console.log(`  FAN_CREDIT available:   ${fanCount}\n`);
}

updatePurpose()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
