// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { formatBytes } from './src/constants/storage';

const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.creatorPlan.findMany({
    select: {
      type: true,
      name: true,
      monthlyPrice: true,
      yearlyPrice: true,
      feeRate: true,
      storageLimitBytes: true,
    },
  });

  console.log('\n📊 クリエイタープラン一覧\n');
  console.log('┌─────────────┬──────────────┬──────────┬─────────┬──────────────┐');
  console.log('│ Type        │ Name         │ Monthly  │ Fee (%) │ Storage      │');
  console.log('├─────────────┼──────────────┼──────────┼─────────┼──────────────┤');

  plans.forEach((plan) => {
    const storage = formatBytes(plan.storageLimitBytes);
    console.log(
      `│ ${plan.type.padEnd(11)} │ ${plan.name.padEnd(12)} │ ¥${String(plan.monthlyPrice).padStart(6)} │ ${String(plan.feeRate).padStart(5)}% │ ${storage.padEnd(12)} │`,
    );
  });

  console.log('└─────────────┴──────────────┴──────────┴─────────┴──────────────┘\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
