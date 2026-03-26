import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import { sendIdentityVerificationNotification } from "@/lib/discord";


export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // クリエイタープロフィールの取得
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { creatorProfile: true },
        });

        if (!user?.creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const creatorId = user.creatorProfile.id;

        // フォームデータの取得
        const formData = await request.formData();
        const documentType = formData.get("documentType") as string;
        const frontImage = formData.get("frontImage") as File;
        const backImage = formData.get("backImage") as File | null;

        // バリデーション
        if (!documentType || !frontImage) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }

        // 運転免許証の場合は裏面も必須
        if (documentType === "drivers_license" && !backImage) {
            return NextResponse.json(
                { error: "運転免許証の場合、裏面の画像も必要です" },
                { status: 400 }
            );
        }

        // ファイルサイズチェック（10MB）
        const maxSize = 10 * 1024 * 1024;
        if (frontImage.size > maxSize || (backImage && backImage.size > maxSize)) {
            return NextResponse.json(
                { error: "ファイルサイズは10MB以下にしてください" },
                { status: 400 }
            );
        }

        // ファイルタイプチェック
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (
            !allowedTypes.includes(frontImage.type) ||
            (backImage && !allowedTypes.includes(backImage.type))
        ) {
            return NextResponse.json(
                { error: "JPG、PNG、PDFファイルのみアップロード可能です" },
                { status: 400 }
            );
        }

        // R2へのアップロード
        const uploadToR2 = async (file: File, side: "front" | "back") => {
            const fileExtension = file.name.split(".").pop();
            const key = `identity-verification/${creatorId}/${side}.${fileExtension}`;

            const buffer = Buffer.from(await file.arrayBuffer());

            const command = new PutObjectCommand({
                Bucket: process.env.R2_PRIVATE_BUCKET_NAME!,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            });

            await r2Client.send(command);
            return key;
        };

        const frontImageKey = await uploadToR2(frontImage, "front");
        const backImageKey = backImage ? await uploadToR2(backImage, "back") : null;

        // データベースの既存レコードを確認
        const existingVerification = await prisma.identityVerification.findUnique({
            where: { creatorId },
        });

        // データベースへの保存（既存があれば更新、なければ作成）
        const verification = existingVerification
            ? await prisma.identityVerification.update({
                where: { creatorId },
                data: {
                    documentType: documentType.toUpperCase() as any,
                    frontImageKey,
                    backImageKey,
                    status: "PENDING", // 再審査待ち
                    reviewedBy: null,
                    reviewedAt: null,
                    rejectReason: null,
                },
            })
            : await prisma.identityVerification.create({
                data: {
                    creatorId,
                    documentType: documentType.toUpperCase() as any,
                    frontImageKey,
                    backImageKey,
                    status: "PENDING",
                },
            });

        // Discord通知（fire and forget）
        sendIdentityVerificationNotification(
            session.user.email,
            user.creatorProfile.handle,
            documentType.toUpperCase(),
            !!existingVerification,
        ).catch((err) => console.error('Failed to send Discord notification:', err));

        return NextResponse.json({
            success: true,
            message: "本人確認書類をアップロードしました",
            verification,
        });
    } catch (error) {
        console.error("Identity verification upload error:", error);
        return NextResponse.json(
            { error: "アップロードに失敗しました" },
            { status: 500 }
        );
    }
}
