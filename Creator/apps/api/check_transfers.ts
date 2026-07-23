import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const transfers = await prisma.bankTransfer.findMany({
        where: {
            creatorSubscriptionId: "cmm6bf8v00001vjl838ypbj35"
        }
    });

    console.log(JSON.stringify(transfers, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
