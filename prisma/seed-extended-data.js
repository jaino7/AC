const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Creating extended transaction data for 365 days...");

    // クリエイターを取得
    const creator = await prisma.creatorProfile.findFirst({
        where: {
            handle: "testcreator"
        }
    });

    if (!creator) {
        console.error("Creator not found!");
        return;
    }

    console.log("Creator found:", creator.handle);

    // ユーザーを取得
    const user = await prisma.user.findUnique({
        where: { email: "test@creator.com" }
    });

    if (!user) {
        console.error("User not found!");
        return;
    }

    // 過去365日分の取引データを作成
    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 365; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // ランダムに1-3件の取引を生成（全日ではなく、約60%の日に取引）
        if (Math.random() > 0.4) {
            const transactionCount = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < transactionCount; j++) {
                transactions.push({
                    creatorId: creator.id,
                    userId: user.id,
                    amount: 500 + Math.floor(Math.random() * 2000), // ¥500-2500
                    status: "PAID",
                    paymentMethod: "CREDIT_CARD",
                    paidAt: date,
                    createdAt: date
                });
            }
        }
    }

    console.log(`Creating ${transactions.length} transactions over 365 days...`);

    // 既存の取引を削除
    await prisma.transaction.deleteMany({
        where: {
            creatorId: creator.id
        }
    });

    // 新しい取引を作成
    await prisma.transaction.createMany({
        data: transactions
    });

    console.log(`✅ Created ${transactions.length} transactions`);

    // 過去365日分のサブスクリプションデータを作成
    const plan = await prisma.subscriptionPlan.findFirst({
        where: {
            creatorId: creator.id
        }
    });

    if (plan) {
        // 既存のサブスクリプションを削除
        await prisma.subscription.deleteMany({
            where: {
                planId: plan.id
            }
        });

        const subscriptions = [];

        // 過去365日間で徐々に増加するサブスクリプション
        for (let i = 365; i >= 0; i -= 7) { // 週に1人ずつ増加
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            subscriptions.push({
                userId: user.id,
                planId: plan.id,
                status: "ACTIVE",
                startDate: date,
                endDate: new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000), // 1年後
                createdAt: date
            });
        }

        await prisma.subscription.createMany({
            data: subscriptions
        });

        console.log(`✅ Created ${subscriptions.length} subscriptions`);
    }

    console.log("\n✅ Extended data created successfully!");
    console.log("\nYou can now view:");
    console.log("- Past 7 days");
    console.log("- Past 28 days");
    console.log("- Past 90 days");
    console.log("- Past 365 days");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
