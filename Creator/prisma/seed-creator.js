const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Creating test creator profile...");

    // テストユーザーを作成
    const user = await prisma.user.upsert({
        where: { email: "test@creator.com" },
        update: {},
        create: {
            email: "test@creator.com",
            name: "テストクリエイター",
            password: "$2a$10$YourHashedPasswordHere"
        }
    });

    console.log("User created:", user.email);

    // クリエイタープロフィールを作成
    const creator = await prisma.creatorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            handle: "testcreator",
            displayName: "テストクリエイター",
            bio: "これはテスト用のクリエイタープロフィールです。",
            theme: "creator-pro"
        }
    });

    console.log("Creator profile created:", creator.handle);

    // サンプルプランを作成
    const plan = await prisma.subscriptionPlan.create({
        data: {
            creatorId: creator.id,
            name: "ベーシックプラン",
            description: "月額1,000円のベーシックプラン",
            price: 1000
        }
    });

    console.log("Subscription plan created:", plan.name);

    // サンプル取引を作成（過去30日分）
    const transactions = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 3); // 3日ごと

        transactions.push({
            creatorId: creator.id,
            userId: user.id,
            amount: 1000 + Math.floor(Math.random() * 500),
            status: "PAID",
            paymentMethod: "CREDIT_CARD",
            paidAt: date,
            createdAt: date
        });
    }

    await prisma.transaction.createMany({
        data: transactions
    });

    console.log(`Created ${transactions.length} sample transactions`);

    // サンプルサブスクリプションを作成
    const subscription = await prisma.subscription.create({
        data: {
            userId: user.id,
            planId: plan.id,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日後
        }
    });

    console.log("Subscription created:", subscription.id);

    console.log("\n✅ Test data created successfully!");
    console.log("\nLogin credentials:");
    console.log("Email: test@creator.com");
    console.log("Password: (set your own password)");
    console.log("\nCreator ID:", creator.id);
    console.log("\nYou can now login and view the dashboard!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
