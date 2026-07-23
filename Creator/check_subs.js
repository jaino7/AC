const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const subs = await prisma.creatorSubscription.findMany({
        include: { plan: true, creator: { select: { handle: true } } }
    });
    console.log("Creator Subscriptions:");
    subs.forEach(sub => {
        console.log(`\nCreator: ${sub.creator?.handle}`);
        console.log(`  SubID: ${sub.id}, Status: ${sub.status}, Plan: ${sub.plan.name} (${sub.plan.type})`);
        console.log(`  startDate: ${sub.startDate}`);
        console.log(`  endDate: ${sub.endDate}`);
        console.log(`  nextBillingDate: ${sub.nextBillingDate}`);
        console.log(`  billingBalance: ${sub.billingBalance}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
