const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDataRelationships() {
    const creatorHandle = 'peepfff52512';

    console.log('=== データ紐付け確認 ===\n');

    try {
        // 1. クリエイターを確認
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: creatorHandle },
            include: { user: true }
        });

        if (!creator) {
            console.log('❌ クリエイターが見つかりません');
            return;
        }

        console.log(`✅ クリエイター: ${creator.displayName} (${creator.handle})`);
        console.log(`   Creator ID: ${creator.id}`);
        console.log(`   User ID: ${creator.userId}\n`);

        // 2. このクリエイターのプランを確認
        const plans = await prisma.subscriptionPlan.findMany({
            where: { creatorId: creator.id }
        });

        console.log(`📋 プラン数: ${plans.length}`);
        plans.forEach(plan => {
            console.log(`   - ${plan.name} (¥${plan.price}) - ID: ${plan.id}`);
        });
        console.log();

        if (plans.length === 0) {
            console.log('⚠️  プランが0件です！\n');
            return;
        }

        // 3. 各プランのサブスクリプション数を確認
        console.log('📊 プラン別サブスクリプション:');
        for (const plan of plans) {
            const subs = await prisma.subscription.findMany({
                where: { planId: plan.id },
                include: {
                    fan: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            console.log(`   ${plan.name}:`);
            console.log(`     - 総サブスクリプション: ${subs.length}件`);

            const active = subs.filter(s => s.status === 'ACTIVE').length;
            const cancelled = subs.filter(s => s.status === 'CANCELLED').length;

            console.log(`     - ACTIVE: ${active}件`);
            console.log(`     - CANCELLED: ${cancelled}件`);

            if (subs.length > 0) {
                const sample = subs[0];
                console.log(`     - サンプル: Fan ${sample.fan.displayName} (${sample.fan.user.email})`);
            }
        }
        console.log();

        // 4. 総ファン数（重複なし）
        const allSubs = await prisma.subscription.findMany({
            where: {
                plan: { creatorId: creator.id }
            },
            include: {
                fan: true
            }
        });

        const uniqueFanIds = new Set(allSubs.map(s => s.fanId));
        console.log(`👥 総ファン数（ユニーク）: ${uniqueFanIds.size}人`);
        console.log(`📝 総サブスクリプション数: ${allSubs.length}件`);
        console.log(`   - ACTIVE: ${allSubs.filter(s => s.status === 'ACTIVE').length}件`);
        console.log(`   - CANCELLED: ${allSubs.filter(s => s.status === 'CANCELLED').length}件`);
        console.log();

        // 5. 新規ファン数（過去7日、28日）
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const twentyEightDaysAgo = new Date(now);
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

        const newFans7 = await prisma.subscription.count({
            where: {
                plan: { creatorId: creator.id },
                status: 'ACTIVE',
                createdAt: { gte: sevenDaysAgo }
            }
        });

        const newFans28 = await prisma.subscription.count({
            where: {
                plan: { creatorId: creator.id },
                status: 'ACTIVE',
                createdAt: { gte: twentyEightDaysAgo }
            }
        });

        console.log('📈 新規ファン:');
        console.log(`   - 過去7日間: ${newFans7}人`);
        console.log(`   - 過去28日間: ${newFans28}人`);
        console.log();

        // 6. 解約ファン数
        const churned7 = await prisma.subscription.count({
            where: {
                plan: { creatorId: creator.id },
                status: 'CANCELLED',
                updatedAt: { gte: sevenDaysAgo }
            }
        });

        const churned28 = await prisma.subscription.count({
            where: {
                plan: { creatorId: creator.id },
                status: 'CANCELLED',
                updatedAt: { gte: twentyEightDaysAgo }
            }
        });

        console.log('📉 解約ファン:');
        console.log(`   - 過去7日間: ${churned7}人`);
        console.log(`   - 過去28日間: ${churned28}人`);
        console.log();

        // 7. サンプルデータを表示
        console.log('🔍 サンプルデータ（最初の3件）:');
        const samples = await prisma.subscription.findMany({
            where: {
                plan: { creatorId: creator.id }
            },
            include: {
                plan: true,
                fan: {
                    include: { user: true }
                }
            },
            take: 3
        });

        samples.forEach((sub, i) => {
            console.log(`\n   ${i + 1}. Subscription ID: ${sub.id}`);
            console.log(`      Fan: ${sub.fan.displayName} (${sub.fan.user.email})`);
            console.log(`      Plan: ${sub.plan.name} (Creator ID: ${sub.plan.creatorId})`);
            console.log(`      Status: ${sub.status}`);
            console.log(`      Created: ${sub.createdAt}`);
        });

        console.log('\n✅ データ紐付け確認完了！');

    } catch (error) {
        console.error('\n❌ エラー:', error.message);
        console.error(error);
    }
}

verifyDataRelationships()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
