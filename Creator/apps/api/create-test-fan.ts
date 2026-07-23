// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestFan() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error('No users found. Please create a user first.');
      return;
    }

    console.log('Found user:', user.email);

    // Check if FanProfile already exists
    const existingFan = await prisma.fanProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingFan) {
      console.log('FanProfile already exists for this user');
      console.log('FanProfile ID:', existingFan.id);
      console.log('Tier:', existingFan.tier);
      console.log('Trust Score:', existingFan.trustScore);
      console.log('Is Locked:', existingFan.isLocked);
      return;
    }

    // Create FanProfile
    const fanProfile = await prisma.fanProfile.create({
      data: {
        userId: user.id,
        tier: 0,
        trustScore: 0,
        isLocked: true, // Set to true to test ban inquiry
      },
    });

    console.log('Created FanProfile:');
    console.log('ID:', fanProfile.id);
    console.log('User ID:', fanProfile.userId);
    console.log('Tier:', fanProfile.tier);
    console.log('Trust Score:', fanProfile.trustScore);
    console.log('Is Locked:', fanProfile.isLocked);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestFan();
