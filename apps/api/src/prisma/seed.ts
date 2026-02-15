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
      feeRate: 12.0,
    },
    {
      type: 'LITE',
      name: 'Lite Plan',
      monthlyPrice: 4980,
      yearlyPrice: 49800,
      feeRate: 7.0,
    },
    {
      type: 'BUSINESS',
      name: 'Business Plan',
      monthlyPrice: 29800,
      yearlyPrice: 298000,
      feeRate: 3.0,
    },
  ]

  for (const plan of plans) {
    await prisma.creatorPlan.upsert({
      where: { type: plan.type as any },
      update: {},
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