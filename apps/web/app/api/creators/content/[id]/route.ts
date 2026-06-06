import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

type MediaInput = {
    url: string;
    duration: number | null;
    size?: number;
};

const STORAGE_LIMITS: Record<string, bigint> = {
    FREE: BigInt(15 * 1024 * 1024 * 1024),
    LITE: BigInt(200 * 1024 * 1024 * 1024),
    BUSINESS: BigInt(1024 * 1024 * 1024 * 1024),
};

function normalizeMediaSize(size: unknown): bigint {
    const value = Number(size);
    return Number.isSafeInteger(value) && value > 0 ? BigInt(value) : BigInt(0);
}

function parseByteTotal(total: unknown): bigint {
    if (typeof total === "bigint") return total;
    if (typeof total === "number") return BigInt(total);
    if (typeof total === "string") return BigInt(total || "0");
    return BigInt(0);
}

function sumMediaSizes(media: unknown): bigint {
    if (!Array.isArray(media)) return BigInt(0);
    return media.reduce((total, item) => total + normalizeMediaSize((item as MediaInput).size), BigInt(0));
}

async function checkStorageLimit(creatorId: string, incomingBytes: bigint, excludedPostId: string) {
    const planResult = await prisma.$queryRaw<Array<{ type: string; status: string }>>`
        SELECT cp."type", cs."status"
        FROM "CreatorSubscription" cs
        INNER JOIN "CreatorPlan" cp ON cs."planId" = cp."id"
        WHERE cs."creatorId" = ${creatorId}
        LIMIT 1
    `;
    const planType = (planResult.length > 0 && planResult[0].status === "ACTIVE")
        ? planResult[0].type
        : "FREE";
    const limitBytes = STORAGE_LIMITS[planType] || STORAGE_LIMITS.FREE;
    const sizeResult = await prisma.$queryRaw<Array<{ total: bigint | number | string }>>`
        SELECT COALESCE(SUM(m."size"), 0)::bigint as total
        FROM "Media" m
        INNER JOIN "Post" p ON m."postId" = p."id"
        WHERE p."creatorId" = ${creatorId}
        AND p."id" <> ${excludedPostId}
    `;
    const usedBytes = parseByteTotal(sizeResult[0]?.total);

    return usedBytes + incomingBytes <= limitBytes;
}

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
                        duration: true,
                        size: true,
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

        const serializedPost = {
            ...post,
            media: post.media.map((media) => ({
                ...media,
                size: Number(media.size),
            })),
        };

        return NextResponse.json({ post: serializedPost, creator });
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

        const { visibility, title, content, thumbnailUrl, sampleMedia, mainMedia, folderId, tagIds, isLocked, requiredPlanId } = await request.json();

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

        if (sampleMedia !== undefined || mainMedia !== undefined) {
            const incomingBytes = sumMediaSizes(sampleMedia) + sumMediaSizes(mainMedia);
            if (!(await checkStorageLimit(creatorProfile.id, incomingBytes, params.id))) {
                return NextResponse.json(
                    { error: "ストレージ容量の上限に達しました。プランをアップグレードしてください。" },
                    { status: 403 }
                );
            }
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
        updateData.price = null;

        // Update post
        const updatedPost = await prisma.post.update({
            where: { id: params.id },
            data: updateData,
        });

        // 既存のメディアを削除して再作成（送信された場合のみ）
        if (sampleMedia !== undefined || mainMedia !== undefined) {
            await prisma.media.deleteMany({
                where: { postId: params.id },
            });
        }

        // サンプルメディアを保存
        if (sampleMedia && Array.isArray(sampleMedia) && sampleMedia.length > 0) {
            await prisma.media.createMany({
                data: sampleMedia.map((media: MediaInput) => ({
                    postId: params.id,
                    url: media.url,
                    type: media.url.match(/\.(mp4|mov|webm|mkv)$/i) ? "VIDEO" : "IMAGE",
                    size: normalizeMediaSize(media.size),
                    isSample: true,
                    duration: media.duration ?? null,
                })),
            });
        }

        // 限定コンテンツメディアを保存
        if (mainMedia && Array.isArray(mainMedia) && mainMedia.length > 0) {
            await prisma.media.createMany({
                data: mainMedia.map((media: MediaInput) => ({
                    postId: params.id,
                    url: media.url,
                    type: media.url.match(/\.(mp4|mov|webm|mkv)$/i) ? "VIDEO" : "IMAGE",
                    size: normalizeMediaSize(media.size),
                    isSample: false,
                    duration: media.duration ?? null,
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
