import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function lockAllFanProfiles(userId: string) {
  try {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      console.error('❌ User not found with ID:', userId);
      return;
    }

    console.log('User Email:', user.email);

    // Get all fan profiles for this user
    const fanProfiles = await prisma.fanProfile.findMany({
      where: { userId },
      include: {
        creator: { select: { handle: true } }
      }
    });

    console.log(`Found ${fanProfiles.length} FanProfile(s)\n`);

    // Lock all fan profiles
    const result = await prisma.fanProfile.updateMany({
      where: { userId },
      data: {
        isLocked: true,
        lockedReason: '振込申告と実際の入金額が一致しなかったため、不正利用の可能性があると判断されました。',
        lockedAt: new Date(),
      },
    });

    console.log(`✅ Locked ${result.count} FanProfile(s) successfully!\n`);

    // Show locked profiles
    fanProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. Creator: ${profile.creator.handle}`);
      console.log(`   Fan ID: ${profile.id}`);
      console.log(`   Tier: ${profile.tier}`);
      console.log(`   Trust Score: ${profile.trustScore}\n`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage: Get userId from the fanProfile
async function lockByFanProfileId(fanProfileId: string) {
  const fanProfile = await prisma.fanProfile.findUnique({
    where: { id: fanProfileId },
    select: { userId: true }
  });

  if (!fanProfile) {
    console.error('❌ FanProfile not found');
    return;
  }

  await lockAllFanProfiles(fanProfile.userId);
}

// Run with the fan profile ID
lockByFanProfileId('cml4kxsdm000fvjbsp6xbjbt1');
