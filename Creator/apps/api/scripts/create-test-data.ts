import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
    const creatorHandle = 'peepfff52512';

    console.log(`Creating test data for creator: ${creatorHandle}`);

    // クリエイターを取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: creatorHandle },
        include: { user: true }
    });

    if (!creator) {
        console.error(`Creator with handle ${creatorHandle} not found!`);
        return;
    }

    console.log(`Found creator: ${creator.displayName} (ID: ${creator.id})`);

    // 既存のプランを削除
    await prisma.subscriptionPlan.deleteMany({
        where: { creatorId: creator.id }
    });

    // サブスクリプションプランを作成
    const plans = await Promise.all([
        prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: 'ベーシック',
                description: '基本プラン',
                price: 500,
                interval: 'MONTHLY',
                isActive: true
            }
        }),
        prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: 'スタンダード',
                description: '標準プラン',
                price: 1000,
                interval: 'MONTHLY',
                isActive: true
            }
        }),
        prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: 'プレミアム',
                description: 'プレミアムプラン',
                price: 2000,
                interval: 'MONTHLY',
                isActive: true
            }
        })
    ]);

    console.log(`Created ${plans.length} subscription plans`);

    // テストユーザーを作成
    const testUsers = [];
    for (let i = 0; i < 100; i++) {
        const user = await prisma.user.upsert({
            where: { email: `testfan${i}@example.com` },
            update: {},
            create: {
                email: `testfan${i}@example.com`,
                name: `テストファン${i}`,
                role: 'FAN'
            }
        });
        testUsers.push(user);
    }

    console.log(`Created ${testUsers.length} test users`);

    // プラン別の配分
    const planDistribution = [
        { plan: plans[0], count: 40 }, // ベーシック: 40人
        { plan: plans[1], count: 35 }, // スタンダード: 35人
        { plan: plans[2], count: 25 }  // プレミアム: 25人
    ];

    let userIndex = 0;
    const now = new Date();

    // アクティブなサブスクリプションを作成
    for (const { plan, count } of planDistribution) {
        for (let i = 0; i < count; i++) {
            if (userIndex >= testUsers.length) break;

            const user = testUsers[userIndex++];

            // ランダムな開始日（過去90日以内）
            const daysAgo = Math.floor(Math.random() * 90);
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - daysAgo);

            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    planId: plan.id,
                    status: 'ACTIVE',
                    currentPeriodStart: startDate,
                    currentPeriodEnd: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                    createdAt: startDate
                }
            });
        }
    }

    console.log('Created active subscriptions');

    // 新規ファン（過去7日間: 10人、過去28日間: 追加18人）
    const newFansLast7Days = 10;
    const newFansLast28Days = 28;

    // 過去7日間の新規ファン
    for (let i = 0; i < newFansLast7Days; i++) {
        if (userIndex >= testUsers.length) break;
        const user = testUsers[userIndex++];
        const daysAgo = Math.floor(Math.random() * 7);
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysAgo);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                userId: user.id,
                planId: randomPlan.id,
                status: 'ACTIVE',
                currentPeriodStart: startDate,
                currentPeriodEnd: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                createdAt: startDate
            }
        });
    }

    // 過去28日間の新規ファン（7日以前）
    for (let i = 0; i < (newFansLast28Days - newFansLast7Days); i++) {
        if (userIndex >= testUsers.length) break;
        const user = testUsers[userIndex++];
        const daysAgo = 7 + Math.floor(Math.random() * 21); // 7-28日前
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysAgo);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                userId: user.id,
                planId: randomPlan.id,
                status: 'ACTIVE',
                currentPeriodStart: startDate,
                currentPeriodEnd: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
                createdAt: startDate
            }
        });
    }

    console.log('Created new fans for recent periods');

    // 解約ファン（過去7日間: 2人、過去28日間: 8人）
    const churnedLast7Days = 2;
    const churnedLast28Days = 8;

    // 過去7日間の解約
    for (let i = 0; i < churnedLast7Days; i++) {
        if (userIndex >= testUsers.length) break;
        const user = testUsers[userIndex++];
        const daysAgo = Math.floor(Math.random() * 7);
        const cancelDate = new Date(now);
        cancelDate.setDate(cancelDate.getDate() - daysAgo);

        // 30日前に開始したサブスクリプション
        const startDate = new Date(cancelDate);
        startDate.setDate(startDate.getDate() - 30);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                userId: user.id,
                planId: randomPlan.id,
                status: 'CANCELED',
                currentPeriodStart: startDate,
                currentPeriodEnd: cancelDate,
                canceledAt: cancelDate,
                createdAt: startDate
            }
        });
    }

    // 過去28日間の解約（7日以前）
    for (let i = 0; i < (churnedLast28Days - churnedLast7Days); i++) {
        if (userIndex >= testUsers.length) break;
        const user = testUsers[userIndex++];
        const daysAgo = 7 + Math.floor(Math.random() * 21);
        const cancelDate = new Date(now);
        cancelDate.setDate(cancelDate.getDate() - daysAgo);

        const startDate = new Date(cancelDate);
        startDate.setDate(startDate.getDate() - 30);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                userId: user.id,
                planId: randomPlan.id,
                status: 'CANCELED',
                currentPeriodStart: startDate,
                currentPeriodEnd: cancelDate,
                canceledAt: cancelDate,
                createdAt: startDate
            }
        });
    }

    console.log('Created churned subscriptions');

    // 統計を出力
    const activeCount = await prisma.subscription.count({
        where: {
            plan: { creatorId: creator.id },
            status: 'ACTIVE'
        }
    });

    const canceledCount = await prisma.subscription.count({
        where: {
            plan: { creatorId: creator.id },
            status: 'CANCELED'
        }
    });

    console.log('\n=== Test Data Summary ===');
    console.log(`Active Subscriptions: ${activeCount}`);
    console.log(`Canceled Subscriptions: ${canceledCount}`);
    console.log(`Plans: ${plans.length}`);

    plans.forEach(async (plan) => {
        const count = await prisma.subscription.count({
            where: { planId: plan.id, status: 'ACTIVE' }
        });
        console.log(`  - ${plan.name}: ${count} active subscribers`);
    });
}

createTestData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
