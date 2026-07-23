import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'ownstage3m@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log(`User not found: ${email}`);
        process.exit(1);
    }

    console.log(`Current role for ${email}: ${user.role}`);

    if (user.role !== 'ADMIN') {
        console.log(`Updating role to ADMIN...`);
        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`Role updated successfully.`);
    } else {
        console.log(`User is already an ADMIN.`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
