import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { title, content, mediaUrl, thumbnailUrl, visibility, isLocked, requiredPlanId, folderId, tagIds } = body;

        // バリデーション
        if (!title || title.trim() === "") {
            return NextResponse.json(
                { error: "タイトルは必須です" },
                { status: 400 }
            );
        }

        const validVisibilities = ["PUBLIC", "SUBSCRIBERS_ONLY", "DRAFT"];
        if (visibility && !validVisibilities.includes(visibility)) {
            return NextResponse.json(
                { error: "無効な公開設定です" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // 投稿を作成
        const post = await prisma.post.create({
            data: {
                creatorId: creatorProfile.id,
                title,
                content: content || null,
                thumbnailUrl: thumbnailUrl || null,
                mediaUrl: mediaUrl || null,
                folderId: folderId || null,
                visibility: visibility || "PUBLIC",
                isLocked: isLocked || false,
                requiredPlanId: requiredPlanId || null
            }
        });

        // タグを紐付け
        if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
            await prisma.postTag.createMany({
                data: tagIds.map((tagId: string) => ({
                    postId: post.id,
                    tagId
                })),
                skipDuplicates: true
            });
        }

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Content creation error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");
        const visibility = searchParams.get("visibility");
        const search = searchParams.get("search");
        const folderId = searchParams.get("folderId");
        const tagId = searchParams.get("tagId");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const where: any = { creatorId: creatorProfile.id };

        // 公開状態でフィルター
        if (visibility) {
            where.visibility = visibility;
        }

        // タイトルで検索
        if (search && search.trim() !== "") {
            where.title = {
                contains: search.trim(),
                mode: "insensitive"
            };
        }

        // フォルダでフィルター
        if (folderId) {
            where.folderId = folderId;
        }

        // タグでフィルター
        if (tagId) {
            where.tags = {
                some: {
                    tagId: tagId
                }
            };
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    thumbnailUrl: true,
                    mediaUrl: true,
                    visibility: true,
                    isLocked: true,
                    requiredPlanId: true,
                    folderId: true,
                    publishedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    folder: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    tags: {
                        select: {
                            tag: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.post.count({ where })
        ]);

        return NextResponse.json({
            posts,
            total,
            limit,
            offset
        });
    } catch (error) {
        console.error("Content fetch error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}
