const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    console.log("Fixing incomplete subscription data...");

    const result = await prisma.creatorSubscription.updateMany({
        where: {
            OR: [
                { startDate: null },
                { endDate: null },
                { nextBillingDate: null }
            ]
        },
        data: {
            startDate: now,
            endDate: nextMonth,
            nextBillingDate: nextMonth
        }
    });

    console.log(`Updated ${result.count} subscriptions with placeholder dates.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
