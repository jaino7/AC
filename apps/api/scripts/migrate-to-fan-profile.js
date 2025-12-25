const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToFanProfile() {
    console.log('Starting migration to FanProfile...\n');

    try {
        // 1. Subscriptionを持つユーザーを取得
        console.log('Step 1: Finding users with subscriptions...');

        // 直接SQLで取得（古いスキーマではuserIdフィールドがある）
        const usersWithSubs = await prisma.$queryRaw`
      SELECT DISTINCT "userId", u.name, u.email
      FROM "Subscription" s
      JOIN "User" u ON s."userId" = u.id
    `;

        console.log(`Found ${usersWithSubs.length} users with subscriptions\n`);

        // 2. 各ユーザーにFanProfileを作成
        console.log('Step 2: Creating FanProfiles...');
        let created = 0;

        for (const user of usersWithSubs) {
            try {
                // FanProfileが既に存在するかチェック
                const existing = await prisma.fanProfile.findUnique({
                    where: { userId: user.userId }
                });

                if (!existing) {
                    await prisma.fanProfile.create({
                        data: {
                            userId: user.userId,
                            displayName: user.name || user.email?.split('@')[0] || 'ファン'
                        }
                    });
                    created++;
                    console.log(`  ✓ Created FanProfile for user: ${user.email}`);
                } else {
                    console.log(`  - FanProfile already exists for: ${user.email}`);
                }
            } catch (error) {
                console.error(`  ✗ Error creating FanProfile for ${user.email}:`, error.message);
            }
        }

        console.log(`\nCreated ${created} new FanProfiles\n`);

        // 3. 統計を表示
        console.log('Step 3: Verification...');
        const totalFanProfiles = await prisma.fanProfile.count();
        const totalSubscriptions = await prisma.subscription.count();

        console.log(`Total FanProfiles: ${totalFanProfiles}`);
        console.log(`Total Subscriptions: ${totalSubscriptions}`);

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    }
}

migrateToFanProfile()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
