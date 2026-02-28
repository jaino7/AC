// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creatorProfile.findMany({
    select: { id: true, displayName: true, handle: true },
  });

  console.log(`🔄 ${creators.length} 人のクリエイターのストレージを再計算します...\n`);

  let totalProcessed = 0;
  let totalBytes = BigInt(0);

  for (const creator of creators) {
    const media = await prisma.media.findMany({
      where: {
        post: {
          creatorId: creator.id,
        },
      },
      select: {
        fileSize: true,
      },
    });

    const creatorTotalBytes = media.reduce((sum, m) => {
      return sum + (m.fileSize || BigInt(0));
    }, BigInt(0));

    await prisma.creatorProfile.update({
      where: { id: creator.id },
      data: {
        storageUsedBytes: creatorTotalBytes,
      },
    });

    const sizeInGB = Number(creatorTotalBytes) / (1024 * 1024 * 1024);
    console.log(
      `✅ ${creator.displayName} (@${creator.handle}): ${sizeInGB.toFixed(2)} GB (${media.length} ファイル)`,
    );

    totalProcessed++;
    totalBytes += creatorTotalBytes;
  }

  const totalGB = Number(totalBytes) / (1024 * 1024 * 1024);
  console.log(`\n📊 完了しました！`);
  console.log(`   処理済みクリエイター: ${totalProcessed}`);
  console.log(`   合計使用量: ${totalGB.toFixed(2)} GB`);
}

main()
  .catch((error) => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
