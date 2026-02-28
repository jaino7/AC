/**
 * アナリティクス用テストデータ投入スクリプト
 * Handle: ownstage3m4249
 * 過去30日分のSubscription, Purchase, Transactionデータを作成します
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const HANDLE = "ownstage3m4249";

    // クリエイターを取得
    const creator = await prisma.creatorProfile.findUnique({
        where: { handle: HANDLE },
        include: { plans: true, posts: true },
    });

    if (!creator) {
        console.error(`Creator with handle "${HANDLE}" not found.`);
        process.exit(1);
    }

    console.log(`Creator found: ${creator.displayName || HANDLE} (id: ${creator.id})`);

    // プランを取得（なければ作成）
    let plans = creator.plans;
    if (plans.length === 0) {
        console.log("No plans found. Creating test plans...");
        const plan1 = await prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: "ベーシック",
                description: "基本プラン",
                price: 500,
            },
        });
        const plan2 = await prisma.subscriptionPlan.create({
            data: {
                creatorId: creator.id,
                name: "プレミアム",
                description: "プレミアムプラン",
                price: 1500,
            },
        });
        plans = [plan1, plan2];
    }
    console.log(`Plans: ${plans.map((p) => p.name).join(", ")}`);

    // 投稿を取得（なければ作成）
    let posts = creator.posts;
    if (posts.length === 0) {
        console.log("No posts found. Creating test posts...");
        for (let i = 1; i <= 3; i++) {
            const post = await prisma.post.create({
                data: {
                    creatorId: creator.id,
                    title: `テスト記事 ${i}`,
                    content: `テスト記事 ${i} の内容`,
                    accessType: "PAID",
                    singlePurchasePrice: 300 + i * 100,
                    status: "PUBLISHED",
                    publishedAt: new Date(),
                },
            });
            posts.push(post as any);
        }
    }
    console.log(`Posts: ${posts.length} posts available`);

    // テスト用ダミーファンを作成（5人）
    const fanUsers = [];
    for (let i = 1; i <= 5; i++) {
        const email = `test-fan-${i}@example.com`;
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: `テストファン${i}`,
                    password: "dummy-not-used",
                },
            });
        }

        let fanProfile = await prisma.fanProfile.findFirst({
            where: { userId: user.id, creatorId: creator.id },
        });
        if (!fanProfile) {
            fanProfile = await prisma.fanProfile.create({
                data: {
                    userId: user.id,
                    creatorId: creator.id,
                    credits: 10000,
                },
            });
        }
        fanUsers.push({ user, fanProfile });
    }
    console.log(`Fans: ${fanUsers.length} test fans ready`);

    const now = new Date();

    // --- Subscription テストデータ（過去30日分） ---
    console.log("Creating subscription data...");
    let subCount = 0;
    for (let day = 0; day < 30; day++) {
        // 日によって 0〜2 件のサブスクリプション
        const count = day % 5 === 0 ? 2 : day % 3 === 0 ? 1 : 0;
        for (let j = 0; j < count; j++) {
            const fan = fanUsers[(day + j) % fanUsers.length];
            const plan = plans[(day + j) % plans.length];
            const startDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
            startDate.setHours(10 + j, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            const sub = await prisma.subscription.create({
                data: {
                    fanId: fan.fanProfile.id,
                    planId: plan.id,
                    status: "ACTIVE",
                    startDate,
                    endDate,
                },
            });

            // Transaction も作成
            await prisma.transaction.create({
                data: {
                    creatorId: creator.id,
                    subscriptionId: sub.id,
                    amount: plan.price,
                    status: "PAID",
                    paidAt: startDate,
                },
            });

            subCount++;
        }
    }
    console.log(`Created ${subCount} subscriptions with transactions`);

    // --- Purchase テストデータ（過去30日分） ---
    console.log("Creating purchase data...");
    let purchaseCount = 0;
    for (let day = 0; day < 30; day++) {
        // 日によって 0〜3 件の購入
        const count = day % 2 === 0 ? (day % 7 === 0 ? 3 : 1) : 0;
        for (let j = 0; j < count; j++) {
            const fan = fanUsers[(day + j + 2) % fanUsers.length];
            const post = posts[(day + j) % posts.length];
            const purchasedAt = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
            purchasedAt.setHours(14 + j, 30, 0, 0);

            await prisma.purchase.create({
                data: {
                    fanId: fan.fanProfile.id,
                    postId: post.id,
                    amount: (post as any).singlePurchasePrice || 500,
                    purchasedAt,
                },
            });

            purchaseCount++;
        }
    }
    console.log(`Created ${purchaseCount} purchases`);

    console.log("\n✅ Analytics test data seeding complete!");
    console.log(`  Subscriptions: ${subCount}`);
    console.log(`  Purchases: ${purchaseCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
