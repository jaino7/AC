/**
 * Create test subscriptions for testing renewal functionality
 *
 * Usage:
 *   npx tsx apps/web/scripts/create-test-subscriptions.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestSubscriptions() {
    try {
        console.log("Creating test subscriptions...");

        // Find a test creator and plan
        const creator = await prisma.creatorProfile.findFirst({
            include: {
                plans: true,
            },
        });

        if (!creator || creator.plans.length === 0) {
            console.error("No creator or plans found. Please create a creator and plan first.");
            process.exit(1);
        }

        const plan = creator.plans[0];
        console.log(`Using plan: ${plan.name} (${plan.price} credits)`);

        // Find or create test fan profiles
        const fans = await prisma.fanProfile.findMany({
            where: {
                creatorId: creator.id,
            },
            take: 3,
        });

        if (fans.length === 0) {
            console.error("No fan profiles found. Please create fan profiles first.");
            process.exit(1);
        }

        // Create test subscriptions expiring tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        for (let i = 0; i < Math.min(fans.length, 2); i++) {
            const fan = fans[i];

            // Check if subscription already exists
            const existingSub = await prisma.subscription.findFirst({
                where: {
                    fanId: fan.id,
                    planId: plan.id,
                    status: "ACTIVE",
                },
            });

            if (existingSub) {
                // Update existing subscription to expire tomorrow
                await prisma.subscription.update({
                    where: { id: existingSub.id },
                    data: {
                        endDate: tomorrow,
                    },
                });
                console.log(`Updated subscription for fan ${fan.id} to expire tomorrow`);
            } else {
                // Create new subscription
                await prisma.subscription.create({
                    data: {
                        fanId: fan.id,
                        planId: plan.id,
                        status: "ACTIVE",
                        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                        endDate: tomorrow,
                    },
                });
                console.log(`Created subscription for fan ${fan.id} expiring tomorrow`);
            }

            // Set different credit amounts for testing
            if (i === 0) {
                // Enough credits to renew
                await prisma.fanProfile.update({
                    where: { id: fan.id },
                    data: { credits: plan.price * 2 },
                });
                console.log(`Set fan ${fan.id} credits to ${plan.price * 2} (enough to renew)`);
            } else {
                // Not enough credits
                await prisma.fanProfile.update({
                    where: { id: fan.id },
                    data: { credits: Math.floor(plan.price / 2) },
                });
                console.log(`Set fan ${fan.id} credits to ${Math.floor(plan.price / 2)} (insufficient)`);
            }
        }

        console.log("\nTest subscriptions created successfully!");
        console.log("Run the renewal script to test: npx tsx apps/web/scripts/renew-subscriptions.ts");
    } catch (error) {
        console.error("Error creating test subscriptions:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createTestSubscriptions();
