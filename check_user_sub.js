const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const profile = await prisma.creatorProfile.findFirst({
        where: { handle: 'pkf61023' },
        include: {
            creatorSubscription: {
                include: { plan: true }
            },
            virtualAccounts: true
        }
    });

    console.dir(profile, { depth: null });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
