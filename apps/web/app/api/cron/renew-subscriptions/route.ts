import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";

/**
 * Subscription renewal cron job
 * This endpoint should be called daily to renew expiring subscriptions
 *
 * In production, use a service like:
 * - Vercel Cron Jobs
 * - AWS EventBridge
 * - GitHub Actions
 *
 * For security, add authorization header check in production
 */
export async function POST(request: NextRequest) {
    try {
        // Security check - verify cron secret in production
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find all active subscriptions expiring within the next day
        const expiringSubscriptions = await prisma.subscription.findMany({
            where: {
                status: "ACTIVE",
                endDate: {
                    gte: now,
                    lte: tomorrow,
                },
            },
            include: {
                fan: {
                    select: {
                        id: true,
                        credits: true,
                        userId: true,
                        creatorId: true,
                    },
                },
                plan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        creatorId: true,
                    },
                },
            },
        });

        const results = {
            total: expiringSubscriptions.length,
            renewed: 0,
            cancelled: 0,
            errors: 0,
            details: [] as any[],
        };

        for (const subscription of expiringSubscriptions) {
            try {
                // Check if fan has enough credits
                if (subscription.fan.credits >= subscription.plan.price) {
                    // Renew subscription
                    await prisma.$transaction(async (tx) => {
                        // Deduct credits
                        const updatedFan = await tx.fanProfile.update({
                            where: { id: subscription.fan.id },
                            data: {
                                credits: {
                                    decrement: subscription.plan.price,
                                },
                            },
                        });

                        // Extend subscription by 30 days
                        const newEndDate = new Date(subscription.endDate!);
                        newEndDate.setDate(newEndDate.getDate() + 30);

                        await tx.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                endDate: newEndDate,
                            },
                        });

                        // Record credit history
                        await tx.creditHistory.create({
                            data: {
                                fanId: subscription.fan.id,
                                type: "SUBSCRIBE",
                                amount: -subscription.plan.price,
                                balance: updatedFan.credits,
                                description: `${subscription.plan.name}プラン更新（自動）`,
                            },
                        });
                    });

                    results.renewed++;
                    results.details.push({
                        subscriptionId: subscription.id,
                        planName: subscription.plan.name,
                        status: "renewed",
                        creditsDeducted: subscription.plan.price,
                    });
                } else {
                    // Insufficient credits - cancel subscription
                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: "CANCELLED",
                        },
                    });

                    results.cancelled++;
                    results.details.push({
                        subscriptionId: subscription.id,
                        planName: subscription.plan.name,
                        status: "cancelled",
                        reason: "insufficient_credits",
                        requiredCredits: subscription.plan.price,
                        availableCredits: subscription.fan.credits,
                    });

                    // TODO: Send notification email to fan about cancellation
                }
            } catch (error) {
                console.error(`Error processing subscription ${subscription.id}:`, error);
                results.errors++;
                results.details.push({
                    subscriptionId: subscription.id,
                    planName: subscription.plan.name,
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }

        console.log("Subscription renewal completed:", results);

        return NextResponse.json({
            success: true,
            message: "Subscription renewal completed",
            results,
        });
    } catch (error) {
        console.error("Subscription renewal error:", error);
        return NextResponse.json(
            { error: "Failed to renew subscriptions" },
            { status: 500 }
        );
    }
}

// Allow GET for testing in development
export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "This endpoint is only available in development" },
            { status: 403 }
        );
    }

    return POST(request);
}
