import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - 公開コンテンツの詳細を取得（ファン向け）
export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string; id: string } }
) {
    try {
        const { handle, id } = params;
        const session = await getServerSession(authOptions);

        // クリエイターを取得
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle },
            select: {
                id: true,
                handle: true,
                displayName: true,
                bio: true,
                theme: true,
            },
        });

        if (!creator) {
            return NextResponse.json(
                { error: "Creator not found" },
                { status: 404 }
            );
        }

        // 投稿を取得（公開のみ）
        const post = await prisma.post.findFirst({
            where: {
                id,
                creatorId: creator.id,
                visibility: "PUBLIC",
            },
            include: {
                media: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                        isSample: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                requiredPlan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        // Check if user has access to this content (via purchase or subscription)
        let hasPurchased = false;
        if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (user) {
                // Find fan profile for this creator
                const fanProfile = await prisma.fanProfile.findUnique({
                    where: {
                        userId_creatorId: {
                            userId: user.id,
                            creatorId: creator.id,
                        },
                    },
                    select: { id: true },
                });

                if (fanProfile) {
                    // Check if user has purchased this specific content
                    const purchase = await prisma.purchase.findFirst({
                        where: {
                            fanId: fanProfile.id,
                            postId: id,
                        },
                    });

                    if (purchase) {
                        hasPurchased = true;
                    } else if (post.requiredPlanId) {
                        // Check if user has an active subscription to the required plan
                        const subscription = await prisma.subscription.findFirst({
                            where: {
                                fanId: fanProfile.id,
                                planId: post.requiredPlanId,
                                status: "ACTIVE",
                                endDate: {
                                    gte: new Date(), // Subscription hasn't expired
                                },
                            },
                        });

                        if (subscription) {
                            hasPurchased = true;
                        }
                    }
                }
            }
        }

        return NextResponse.json({ post, creator, hasPurchased });
    } catch (error) {
        console.error("Error fetching public post:", error);
        return NextResponse.json(
            { error: "Failed to fetch post" },
            { status: 500 }
        );
    }
}
