import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - Save a post
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        if (!user?.fanProfile) {
            return NextResponse.json(
                { error: "ファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const postId = params.id;

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return NextResponse.json(
                { error: "投稿が見つかりません" },
                { status: 404 }
            );
        }

        // Create or find existing saved post (upsert behavior)
        const savedPost = await prisma.savedPost.upsert({
            where: {
                fanId_postId: {
                    fanId: user.fanProfile.id,
                    postId: postId,
                },
            },
            create: {
                fanId: user.fanProfile.id,
                postId: postId,
            },
            update: {}, // No update needed if it already exists
        });

        return NextResponse.json({
            success: true,
            saved: true,
            savedPost
        });
    } catch (error) {
        console.error("Error saving post:", error);
        return NextResponse.json(
            { error: "投稿の保存に失敗しました" },
            { status: 500 }
        );
    }
}

// DELETE - Unsave a post
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        if (!user?.fanProfile) {
            return NextResponse.json(
                { error: "ファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const postId = params.id;

        // Delete saved post if it exists
        await prisma.savedPost.deleteMany({
            where: {
                fanId: user.fanProfile.id,
                postId: postId,
            },
        });

        return NextResponse.json({
            success: true,
            saved: false
        });
    } catch (error) {
        console.error("Error unsaving post:", error);
        return NextResponse.json(
            { error: "保存の解除に失敗しました" },
            { status: 500 }
        );
    }
}
