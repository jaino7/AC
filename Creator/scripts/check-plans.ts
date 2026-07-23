import { prisma } from "@creator/shared";

async function main() {
    const plans = await prisma.creatorPlan.findMany({
        select: { id: true, type: true, name: true, monthlyPrice: true, feeRate: true },
    });
    console.log("=== CreatorPlan ===");
    console.table(plans);

    const subs = await prisma.creatorSubscription.findMany({
        include: { plan: { select: { type: true, name: true } }, creator: { select: { handle: true } } },
    });
    console.log("\n=== CreatorSubscription ===");
    for (const s of subs) {
        console.log(`handle: ${s.creator.handle}, plan: ${s.plan.type} (${s.plan.name}), status: ${s.status}`);
    }

    await prisma.$disconnect();
}

main();
