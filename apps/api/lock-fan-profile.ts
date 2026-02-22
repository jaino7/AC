import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function lockFanProfile() {
  try {
    const fanProfileId = 'cml4kxsdm000fvjbsp6xbjbt1';

    // First, check if the fan profile exists
    const existingProfile = await prisma.fanProfile.findUnique({
      where: { id: fanProfileId },
      include: {
        user: { select: { email: true } },
        creator: { select: { handle: true } }
      }
    });

    if (!existingProfile) {
      console.error('❌ FanProfile not found with ID:', fanProfileId);
      return;
    }

    console.log('Found FanProfile:');
    console.log('User Email:', existingProfile.user.email);
    console.log('Creator:', existingProfile.creator.handle);
    console.log('Current Lock Status:', existingProfile.isLocked);

    // Update to locked
    const fanProfile = await prisma.fanProfile.update({
      where: { id: fanProfileId },
      data: {
        isLocked: true,
        lockedReason: '振込申告と実際の入金額が一致しなかったため、不正利用の可能性があると判断されました。',
        lockedAt: new Date(),
      },
    });

    console.log('\n✅ FanProfile locked successfully!');
    console.log('Fan ID:', fanProfile.id);
    console.log('Tier:', fanProfile.tier);
    console.log('Trust Score:', fanProfile.trustScore);
    console.log('Is Locked:', fanProfile.isLocked);
    console.log('Locked Reason:', fanProfile.lockedReason);
    console.log('Locked At:', fanProfile.lockedAt);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

lockFanProfile();
