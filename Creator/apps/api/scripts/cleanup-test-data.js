const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupTestData() {
    console.log('Cleaning up test data...\n');

    try {
        // Subscriptionを削除
        const deletedSubs = await prisma.subscription.deleteMany({});
        console.log(`✓ Deleted ${deletedSubs.count} subscriptions`);

        // SubscriptionPlanを削除
        const deletedPlans = await prisma.subscriptionPlan.deleteMany({});
        console.log(`✓ Deleted ${deletedPlans.count} subscription plans`);

        // テストユーザーを削除
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                email: {
                    contains: 'testfan'
                }
            }
        });
        console.log(`✓ Deleted ${deletedUsers.count} test users`);

        console.log('\n✅ Cleanup completed!');
        console.log('You can now run: npx prisma migrate dev --name add_fan_profile');

    } catch (error) {
        console.error('\n❌ Cleanup failed:', error);
        throw error;
    }
}

cleanupTestData()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
