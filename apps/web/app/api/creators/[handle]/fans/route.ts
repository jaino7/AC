import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const { handle } = params;
        const { searchParams } = new URL(request.url);
        const tab = searchParams.get("tab") || "plans";
        const planFilter = searchParams.get("planFilter") || "全て";

        // Get creator by handle
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle },
            select: { id: true }
        });

        if (!creator) {
            return NextResponse.json(
                { error: "Creator not found" },
                { status: 404 }
            );
        }

        if (tab === "plans") {
            // Get plan members with subscription data
            const subscriptions = await prisma.subscription.findMany({
                where: {
                    plan: {
                        creatorId: creator.id
                    },
                    status: "ACTIVE"
                },
                include: {
                    fan: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    },
                    plan: true,
                    transactions: {
                        where: {
                            status: "PAID"
                        },
                        orderBy: {
                            paidAt: "desc"
                        }
                    }
                },
                orderBy: {
                    updatedAt: "desc"
                }
            });

            // Filter by plan if needed
            let filteredSubscriptions = subscriptions;
            if (planFilter !== "全て") {
                filteredSubscriptions = subscriptions.filter(
                    (sub: any) => sub.plan.name === planFilter
                );
            }

            // Format data for frontend
            const fans = filteredSubscriptions.map((sub: any) => {
                const startDate = new Date(sub.startDate);
                const now = new Date();
                const monthsDiff = Math.floor(
                    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                );

                const totalSupport = sub.transactions.reduce(
                    (sum: number, tx: any) => sum + tx.amount,
                    0
                );

                return {
                    id: sub.fan.id,
                    name: sub.fan.user.name || sub.fan.displayName || "Unknown",
                    avatar: sub.fan.user.image || sub.fan.avatar || `https://i.pravatar.cc/40?img=${sub.fan.id}`,
                    plan: {
                        name: sub.plan.name,
                        id: sub.plan.id
                    },
                    planDurationMonths: monthsDiff,
                    lastUpdated: sub.updatedAt.toISOString().split('T')[0].replace(/-/g, '/'),
                    hasTwitter: false, // TODO: Add Twitter integration
                    totalSupport,
                    status: "active"
                };
            });

            return NextResponse.json({ fans });

        } else {
            // Get single purchasers
            const purchases = await prisma.purchase.findMany({
                where: {
                    post: {
                        creatorId: creator.id
                    }
                },
                include: {
                    fan: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    },
                    post: {
                        select: {
                            title: true
                        }
                    }
                },
                orderBy: {
                    purchasedAt: "desc"
                }
            });

            // Group by fan
            const fanPurchaseMap = new Map<string, {
                fan: any;
                titles: string[];
                count: number;
                lastPurchased: Date;
                totalAmount: number;
            }>();

            purchases.forEach((purchase: any) => {
                const fanId = purchase.fan.id;
                if (!fanPurchaseMap.has(fanId)) {
                    fanPurchaseMap.set(fanId, {
                        fan: purchase.fan,
                        titles: [],
                        count: 0,
                        lastPurchased: purchase.purchasedAt,
                        totalAmount: 0
                    });
                }

                const fanData = fanPurchaseMap.get(fanId)!;
                fanData.titles.push(purchase.post.title);
                fanData.count++;
                fanData.totalAmount += purchase.amount;
                if (purchase.purchasedAt > fanData.lastPurchased) {
                    fanData.lastPurchased = purchase.purchasedAt;
                }
            });

            const fans = Array.from(fanPurchaseMap.values()).map((data: any) => ({
                id: data.fan.id,
                name: data.fan.user.name || data.fan.displayName || "Unknown",
                avatar: data.fan.user.image || data.fan.avatar || `https://i.pravatar.cc/40?img=${data.fan.id}`,
                purchasedTitles: data.titles,
                purchaseCount: data.count,
                lastPurchasedDate: data.lastPurchased.toISOString().split('T')[0].replace(/-/g, '/'),
                hasTwitter: false,
                totalSupport: data.totalAmount,
                status: "active"
            }));

            return NextResponse.json({ fans });
        }

    } catch (error) {
        console.error("Error fetching fans:", error);
        return NextResponse.json(
            { error: "Failed to fetch fans" },
            { status: 500 }
        );
    }
}
