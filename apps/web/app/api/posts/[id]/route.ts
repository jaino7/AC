import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get post details by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;

        // Fetch post with related data
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                creator: {
                    select: {
                        id: true,
                        handle: true,
                        displayName: true,
                        logoUrl: true,
                    },
                },
                folder: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                requiredPlan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
                media: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                    },
                },
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "投稿が見つかりません" },
                { status: 404 }
            );
        }

        // Check visibility - only PUBLIC posts can be accessed without authentication
        if (post.visibility !== "PUBLIC") {
            const session = await getServerSession(authOptions);

            if (!session?.user?.email) {
                return NextResponse.json(
                    { error: "この投稿を閲覧するには認証が必要です" },
                    { status: 401 }
                );
            }

            // TODO: Check if user has access (subscription or purchase)
            // For now, return the post but mark as locked if required
        }

        // Check if user has access to locked content
        let hasAccess = !post.isLocked;

        if (post.isLocked) {
            const session = await getServerSession(authOptions);

            if (session?.user?.email) {
                const user = await prisma.user.findUnique({
                    where: { email: session.user.email },
                    include: {
                        fanProfile: {
                            include: {
                                subscriptions: {
                                    where: {
                                        status: "ACTIVE",
                                        planId: post.requiredPlanId || undefined,
                                    },
                                },
                                purchases: {
                                    where: {
                                        postId: post.id,
                                    },
                                },
                            },
                        },
                    },
                });

                // Check if user has active subscription or purchased this post
                const hasSubscription = user?.fanProfile?.subscriptions.length ?? 0 > 0;
                const hasPurchased = user?.fanProfile?.purchases.length ?? 0 > 0;

                hasAccess = hasSubscription || hasPurchased;
            }
        }

        return NextResponse.json({
            post,
            hasAccess
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { error: "投稿の取得に失敗しました" },
            { status: 500 }
        );
    }
}
