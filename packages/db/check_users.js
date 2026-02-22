const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const users = await prisma.user.findMany({
        where: { name: 'ユーザー' }
    });
    console.log(`Users with name 'ユーザー':`, users.length);
    if (users.length > 0) {
        console.log(users.map(u => ({ id: u.id, email: u.email, name: u.name })));
    }

    const fanProfiles = await prisma.fanProfile.findMany({
        where: { displayName: 'ユーザー' }
    });
    console.log(`FanProfiles with displayName 'ユーザー':`, fanProfiles.length);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
