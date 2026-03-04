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
      feeRate: 8.0,
      storageLimitBytes: BigInt(15 * 1024 * 1024 * 1024), // 15GB
    },
    {
      type: 'LITE',
      name: 'Lite Plan',
      monthlyPrice: 2980,
      yearlyPrice: 29800,
      feeRate: 5.0,
      storageLimitBytes: BigInt(200 * 1024 * 1024 * 1024), // 200GB
    },
    {
      type: 'BUSINESS',
      name: 'Business Plan',
      monthlyPrice: 19800,
      yearlyPrice: 198000,
      feeRate: 2.8,
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
      },
      create: {
        type: plan.type,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        feeRate: plan.feeRate,
      } as any,
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