import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get saved posts for the authenticated fan
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Find user and fan profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                fanProfile: {
                    select: { id: true },
                },
            },
        });

        const fanProfile = user?.fanProfile?.[0];
        if (!fanProfile) {
            return NextResponse.json(
                { error: "ファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // Fetch saved posts
        const savedPosts = await prisma.savedPost.findMany({
            where: {
                fanId: fanProfile.id,
            },
            include: {
                post: {
                    include: {
                        folder: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        tags: {
                            select: {
                                tagId: true,
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
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Transform to match the expected post format
        const posts = savedPosts.map((savedPost: any) => savedPost.post);

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Error fetching saved posts:", error);
        return NextResponse.json(
            { error: "保存済み投稿の取得に失敗しました" },
            { status: 500 }
        );
    }
}
