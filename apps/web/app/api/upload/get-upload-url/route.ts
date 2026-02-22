import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedUrl } from "@/lib/r2";
import { generatePresignedUrlMock } from "@/lib/r2-mock";
import { prisma } from "@creator/shared";
import { STORAGE_LIMITS } from "@/app/api/creators/storage/route";

export async function POST(request: Request) {
    // 認証チェック（セッションの存在確認のみ）
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { filename, contentType, fileSize } = body;

        // ストレージ容量チェック
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user) {
            const creatorProfile = await prisma.creatorProfile.findUnique({
                where: { userId: user.id },
            });

            if (creatorProfile) {
                const sizeResult = await prisma.$queryRaw<Array<{ total: number }>>`
                    SELECT COALESCE(SUM(m."size"), 0)::int as total
                    FROM "Media" m
                    INNER JOIN "Post" p ON m."postId" = p."id"
                    WHERE p."creatorId" = ${creatorProfile.id}
                `;
                const planResult = await prisma.$queryRaw<Array<{ storagePlan: string }>>`
                    SELECT "storagePlan" FROM "CreatorProfile" WHERE "id" = ${creatorProfile.id}
                `;

                const usedBytes = sizeResult[0]?.total || 0;
                const plan = planResult[0]?.storagePlan || "FREE";
                const limitBytes = STORAGE_LIMITS[plan] || STORAGE_LIMITS.FREE;
                const uploadSize = fileSize || 0;

                if (usedBytes + uploadSize > limitBytes) {
                    return NextResponse.json(
                        { error: "ストレージ容量の上限に達しました。プランをアップグレードしてください。" },
                        { status: 403 }
                    );
                }
            }
        }

        // バリデーション
        if (!filename || !contentType) {
            return NextResponse.json(
                { error: "filenameとcontentTypeは必須です" },
                { status: 400 }
            );
        }

        // サポートされるファイルタイプのチェック
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
            "video/webm",
            "video/quicktime",      // MOV
            "video/x-matroska",     // MKV
        ];

        if (!allowedTypes.includes(contentType)) {
            return NextResponse.json(
                { error: "サポートされていないファイルタイプです" },
                { status: 400 }
            );
        }

        // R2環境変数の確認
        const hasR2Config =
            process.env.R2_ACCOUNT_ID &&
            process.env.R2_ACCESS_KEY_ID &&
            process.env.R2_SECRET_ACCESS_KEY &&
            process.env.R2_CONTENT_BUCKET_NAME &&
            process.env.R2_CONTENT_PUBLIC_URL;

        let result;

        if (hasR2Config) {
            // 本番環境: 実際のR2を使用
            result = await generatePresignedUrl({
                filename,
                contentType,
            });
        } else {
            // 開発環境: モック実装を使用
            console.warn("[DEV MODE] R2 credentials not configured, using mock upload");
            result = await generatePresignedUrlMock({
                filename,
                contentType,
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Presigned URL generation error:", error);
        return NextResponse.json(
            { error: "署名付きURLの生成に失敗しました" },
            { status: 500 }
        );
    }
}
