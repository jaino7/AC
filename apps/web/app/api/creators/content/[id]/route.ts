import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Retrieve single post
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "Creator profile not found" },
                { status: 404 }
            );
        }

        // Get post with tags, folder, and media
        const post = await prisma.post.findFirst({
            where: {
                id: params.id,
                creatorId: creatorProfile.id,
            },
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
                media: {
                    select: {
                        id: true,
                        url: true,
                        type: true,
                        isSample: true,
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
                { error: "Post not found or access denied" },
                { status: 404 }
            );
        }

        // Get creator profile details
        const creator = await prisma.creatorProfile.findUnique({
            where: { id: creatorProfile.id },
            select: {
                id: true,
                handle: true,
                displayName: true,
                bio: true,
                theme: true,
            },
        });

        return NextResponse.json({ post, creator });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { error: "Failed to fetch post" },
            { status: 500 }
        );
    }
}


// PATCH - Update post
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { visibility, title, content, thumbnailUrl, sampleMediaUrls, mediaUrls, folderId, tagIds, isLocked, requiredPlanId, singleSalePrice } = await request.json();

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "Creator profile not found" },
                { status: 404 }
            );
        }

        // Check ownership
        const post = await prisma.post.findFirst({
            where: {
                id: params.id,
                creatorId: creatorProfile.id,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found or access denied" },
                { status: 404 }
            );
        }

        // Prepare update data
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (visibility !== undefined) updateData.visibility = visibility;
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
        if (folderId !== undefined) updateData.folderId = folderId || null;
        if (isLocked !== undefined) updateData.isLocked = isLocked;
        if (requiredPlanId !== undefined) updateData.requiredPlanId = requiredPlanId || null;
        if (singleSalePrice !== undefined) updateData.price = singleSalePrice;

        // Update post
        const updatedPost = await prisma.post.update({
            where: { id: params.id },
            data: updateData,
        });

        // 既存のメディアを削除
        if (sampleMediaUrls !== undefined || mediaUrls !== undefined) {
            await prisma.media.deleteMany({
                where: { postId: params.id },
            });
        }

        // サンプルメディアを保存
        if (sampleMediaUrls && Array.isArray(sampleMediaUrls) && sampleMediaUrls.length > 0) {
            await prisma.media.createMany({
                data: sampleMediaUrls.map((url: string) => ({
                    postId: params.id,
                    url,
                    type: url.match(/\.(mp4|mov|webm|mkv)$/i) ? "VIDEO" : "IMAGE",
                    isSample: true,
                })),
            });
        }

        // 限定コンテンツメディアを保存
        if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
            await prisma.media.createMany({
                data: mediaUrls.map((url: string) => ({
                    postId: params.id,
                    url,
                    type: url.match(/\.(mp4|mov|webm|mkv)$/i) ? "VIDEO" : "IMAGE",
                    isSample: false,
                })),
            });
        }

        // Handle tags if provided
        if (tagIds !== undefined) {
            // Delete existing tags
            await prisma.postTag.deleteMany({
                where: { postId: params.id },
            });

            // Add new tags
            if (tagIds && tagIds.length > 0) {
                await prisma.postTag.createMany({
                    data: tagIds.map((tagId: string) => ({
                        postId: params.id,
                        tagId,
                    })),
                });
            }
        }

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json(
            { error: "Failed to update post" },
            { status: 500 }
        );
    }
}

// DELETE - Delete single post
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "Creator profile not found" },
                { status: 404 }
            );
        }

        // Check ownership
        const post = await prisma.post.findFirst({
            where: {
                id: params.id,
                creatorId: creatorProfile.id,
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found or access denied" },
                { status: 404 }
            );
        }

        // Delete post (PostTag will be cascade deleted)
        await prisma.post.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
