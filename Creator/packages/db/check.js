const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { fanProfile: true }
    });
    console.log(JSON.stringify(users, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
