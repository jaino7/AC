import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

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

async function checkStorageLimit(creatorId: string, incomingBytes: bigint) {
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
    `;
    const usedBytes = parseByteTotal(sizeResult[0]?.total);

    return usedBytes + incomingBytes <= limitBytes;
}

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
        const { title, content, mediaUrl, thumbnailUrl, visibility, isLocked, requiredPlanId, folderId, tagIds, sampleMedia, mainMedia, singleSalePrice, isAdultContent } = body;

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
            select: {
                id: true,
                identityVerification: {
                    select: { status: true }
                }
            }
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // アダルトコンテンツの場合、本人確認済みかチェック
        if (isAdultContent) {
            const verificationStatus = creatorProfile.identityVerification?.status;
            if (verificationStatus !== "APPROVED") {
                return NextResponse.json(
                    { error: "アダルトコンテンツの投稿には本人確認が必要です。設定ページから本人確認を申請してください。" },
                    { status: 403 }
                );
            }
        }

        const incomingBytes = sumMediaSizes(sampleMedia) + sumMediaSizes(mainMedia);
        if (!(await checkStorageLimit(creatorProfile.id, incomingBytes))) {
            return NextResponse.json(
                { error: "ストレージ容量の上限に達しました。プランをアップグレードしてください。" },
                { status: 403 }
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
                requiredPlanId: requiredPlanId || null,
                price: singleSalePrice ? Math.round(singleSalePrice) : null,
                isAdultContent: isAdultContent || false
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

        // サンプルメディアを保存
        if (sampleMedia && Array.isArray(sampleMedia) && sampleMedia.length > 0) {
            await prisma.media.createMany({
                data: sampleMedia.map((media: MediaInput) => ({
                    postId: post.id,
                    url: media.url,
                    type: media.url.match(/\.(mp4|mov|webm|mkv)$/i) ? "VIDEO" : "IMAGE",
                    size: normalizeMediaSize(media.size),
                    isSample: true,
                    duration: media.duration
                }))
            });
        }

        // 限定コンテンツメディアを保存
        if (mainMedia && Array.isArray(mainMedia) && mainMedia.length > 0) {
            await prisma.media.createMany({
                data: mainMedia.map((media: MediaInput) => ({
                    postId: post.id,
                    url: media.url,
                    type: media.url.match(/\.(mp4|mov|webm|mkv)$/i) ? "VIDEO" : "IMAGE",
                    size: normalizeMediaSize(media.size),
                    isSample: false,
                    duration: media.duration
                }))
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
        const type = searchParams.get("type"); // "free", "plan", "single"

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

        // タイプでフィルター (無料, プラン限定, 単体販売)
        if (type === "free") {
            // 無料: サブスクリプション必須でもなく、単体販売価格もないもの（isLockedの挙動にも依存するがSchemaを見る限り）
            where.requiredPlanId = null;
            // AND price is null or 0 (Prisma doesn't easily support IS NULL OR = 0 without an OR array, but price is Int?)
            where.OR = [
                { price: null },
                { price: 0 }
            ];
            where.isLocked = false;
        } else if (type === "plan") {
            // プラン限定: requiredPlanId が設定されている
            where.requiredPlanId = { not: null };
        } else if (type === "single") {
            // 単体販売: price が 0 より大きく設定されている
            where.price = { gt: 0 };
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
