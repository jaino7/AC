import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const subscriptions = await prisma.creatorSubscription.findMany({
        where: {
            creator: {
                user: {
                    email: 'ownstage3m@gmail.com'
                }
            }
        },
        include: {
            plan: true
        }
    });

    console.log(JSON.stringify(subscriptions, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
