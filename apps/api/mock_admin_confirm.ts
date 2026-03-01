import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const id = "cmm6bf8v00001vjl838ypbj35";
    const subscription = await prisma.creatorSubscription.findUnique({
        where: { id },
        include: { plan: true },
    });

    if (!subscription) throw new Error("not found");

    const now = new Date();
    const endDate = new Date(now);
    if (subscription.isYearly) {
        endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
        endDate.setMonth(endDate.getMonth() + 1);
    }

    const amount = subscription.isYearly
        ? subscription.plan.yearlyPrice
        : subscription.plan.monthlyPrice;

    const updated = await prisma.creatorSubscription.update({
        where: { id },
        data: {
            status: "ACTIVE",
            startDate: now,
            endDate: endDate,
            nextBillingDate: endDate,
            billingBalance: amount,
        },
    });

    console.log("Updated:", updated);
}

main().finally(() => prisma.$disconnect());
