import { prisma } from "@creator/shared";

async function main() {
    const result = await prisma.$executeRaw`
        UPDATE "CreatorSubscription"
        SET "status" = 'ACTIVE'
        WHERE "creatorId" = (
            SELECT id FROM "CreatorProfile" WHERE handle = 'ownstage3m4249'
        )
    `;
    console.log("Updated rows:", result);

    // 確認
    const sub = await prisma.creatorSubscription.findFirst({
        where: { creator: { handle: "ownstage3m4249" } },
        include: { plan: { select: { type: true, name: true } } },
    });
    console.log("Status:", sub?.status, "| Plan:", sub?.plan.type, sub?.plan.name);

    await prisma.$disconnect();
}

main();
