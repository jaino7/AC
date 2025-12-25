const { PrismaClient } = require('@prisma/client');

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

    // 既存のサブスクリプションを削除
    await prisma.subscription.deleteMany({
        where: { plan: { creatorId: creator.id } }
    });

    // 既存のプランを削除
    await prisma.subscriptionPlan.deleteMany({
        where: { creatorId: creator.id }
    });

    console.log('Cleaned up existing data');

    // サブスクリプションプランを作成
    const plans = await Promise.all([
        prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: 'ベーシック',
                description: '基本プラン',
                price: 500
            }
        }),
        prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: 'スタンダード',
                description: '標準プラン',
                price: 1000
            }
        }),
        prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: 'プレミアム',
                description: 'プレミアムプラン',
                price: 2000
            }
        })
    ]);

    console.log(`Created ${plans.length} subscription plans`);

    // テストユーザーとFanProfileを作成/取得（150人に増加）
    const testFans = [];
    for (let i = 0; i < 150; i++) {
        const user = await prisma.user.upsert({
            where: { email: `testfan${i}@example.com` },
            update: {},
            create: {
                email: `testfan${i}@example.com`,
                name: `テストファン${i}`,
                role: 'USER'
            }
        });

        // FanProfileを作成
        const fanProfile = await prisma.fanProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                displayName: `テストファン${i}`
            }
        });

        testFans.push(fanProfile);
    }

    console.log(`Created/found ${testFans.length} test fans with FanProfiles`);

    const now = new Date();
    let fanIndex = 0;

    // プラン別の配分（アクティブな古いファン）- 合計90人に削減
    const planDistribution = [
        { plan: plans[0], count: 40 },  // ベーシック: 40人
        { plan: plans[1], count: 35 },  // スタンダード: 35人
        { plan: plans[2], count: 15 }   // プレミアム: 15人（合計90人）
    ];

    // アクティブなサブスクリプションを作成（過去30-90日に開始）
    for (const { plan, count } of planDistribution) {
        for (let i = 0; i < count; i++) {
            if (fanIndex >= testFans.length) break;

            const fan = testFans[fanIndex++];

            // 30-90日前のランダムな日に開始
            const daysAgo = 30 + Math.floor(Math.random() * 60);
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() - daysAgo);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);

            await prisma.subscription.create({
                data: {
                    fanId: fan.id,  // userIdではなくfanId
                    planId: plan.id,
                    status: 'ACTIVE',
                    startDate: startDate,
                    endDate: endDate,
                    createdAt: startDate
                }
            });
        }
    }

    console.log(`Created active subscriptions (fanIndex now at: ${fanIndex})`);


    // 新規ファン（過去7日間: 10人）
    console.log(`Creating new fans (past 7 days), starting from fanIndex: ${fanIndex}`);
    for (let i = 0; i < 10; i++) {
        if (fanIndex >= testFans.length) {
            console.log(`  Ran out of fans at index ${fanIndex}`);
            break;
        }
        const fan = testFans[fanIndex++];
        const daysAgo = Math.floor(Math.random() * 7);
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysAgo);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                fanId: fan.id,
                planId: randomPlan.id,
                status: 'ACTIVE',
                startDate: startDate,
                endDate: endDate,
                createdAt: startDate
            }
        });
    }
    console.log(`Created 10 new fans (past 7 days), fanIndex now at: ${fanIndex}`);

    // 新規ファン（過去8-28日間: 18人）
    console.log(`Creating new fans (past 8-28 days), starting from fanIndex: ${fanIndex}`);
    for (let i = 0; i < 18; i++) {
        if (fanIndex >= testFans.length) {
            console.log(`  Ran out of fans at index ${fanIndex}`);
            break;
        }
        const fan = testFans[fanIndex++];
        const daysAgo = 8 + Math.floor(Math.random() * 20);
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - daysAgo);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                fanId: fan.id,
                planId: randomPlan.id,
                status: 'ACTIVE',
                startDate: startDate,
                endDate: endDate,
                createdAt: startDate
            }
        });
    }
    console.log(`Created 18 new fans (past 8-28 days), fanIndex now at: ${fanIndex}`);

    console.log('Created new fans');

    // 解約ファン（過去7日間: 2人）- statusをCANCELLEDに
    for (let i = 0; i < 2; i++) {
        if (fanIndex >= testFans.length) break;
        const fan = testFans[fanIndex++];
        const daysAgo = Math.floor(Math.random() * 7);
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - daysAgo);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 45);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                fanId: fan.id,
                planId: randomPlan.id,
                status: 'CANCELLED',
                startDate: startDate,
                endDate: endDate,
                createdAt: startDate,
                updatedAt: endDate
            }
        });
    }

    // 解約ファン（過去8-28日間: 6人）
    for (let i = 0; i < 6; i++) {
        if (fanIndex >= testFans.length) break;
        const fan = testFans[fanIndex++];
        const daysAgo = 8 + Math.floor(Math.random() * 20);
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - daysAgo);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 45);

        const randomPlan = plans[Math.floor(Math.random() * plans.length)];

        await prisma.subscription.create({
            data: {
                fanId: fan.id,
                planId: randomPlan.id,
                status: 'CANCELLED',
                startDate: startDate,
                endDate: endDate,
                createdAt: startDate,
                updatedAt: endDate
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
            status: 'CANCELLED'
        }
    });

    console.log('\n=== Test Data Summary ===');
    console.log(`Creator: ${creator.handle} (${creator.displayName})`);
    console.log(`Active Subscriptions: ${activeCount}`);
    console.log(`Canceled Subscriptions: ${canceledCount}`);
    console.log(`Plans: ${plans.length}`);

    for (const plan of plans) {
        const count = await prisma.subscription.count({
            where: { planId: plan.id, status: 'ACTIVE' }
        });
        console.log(`  - ${plan.name}: ${count} active subscribers (${(count / activeCount * 100).toFixed(1)}%)`);
    }

    console.log('\nTest data created successfully!');
}

createTestData()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
