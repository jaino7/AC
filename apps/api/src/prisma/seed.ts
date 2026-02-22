import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 プランデータの登録を開始します...')

  // 1. クリエイタープランの作成
  const plans = [
    {
      type: 'FREE',
      name: 'Free Plan',
      monthlyPrice: 0,
      yearlyPrice: 0,
      feeRate: 10.0,
      storageLimitBytes: BigInt(15 * 1024 * 1024 * 1024), // 15GB
    },
    {
      type: 'LITE',
      name: 'Lite Plan',
      monthlyPrice: 4000,
      yearlyPrice: 40000,
      feeRate: 6.0,
      storageLimitBytes: BigInt(200 * 1024 * 1024 * 1024), // 200GB
    },
    {
      type: 'BUSINESS',
      name: 'Business Plan',
      monthlyPrice: 25000,
      yearlyPrice: 250000,
      feeRate: 3.0,
      storageLimitBytes: BigInt(1024 * 1024 * 1024 * 1024), // 1TB
    },
  ]

  for (const plan of plans) {
    await prisma.creatorPlan.upsert({
      where: { type: plan.type as any },
      update: {
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        feeRate: plan.feeRate,
        storageLimitBytes: plan.storageLimitBytes,
      },
      create: plan as any,
    })
  }

  console.log('✅ プランの登録が完了しました！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })