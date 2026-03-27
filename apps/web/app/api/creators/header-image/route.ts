import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

function getCleanEnvUrl(envValue: string | undefined): string {
    if (!envValue) return '';
    let cleaned = envValue;
    const markdownMatch = cleaned.match(/\[([^\]]*)\]\(([^)]*)\)/);
    if (markdownMatch) cleaned = markdownMatch[2];
    cleaned = cleaned.replace(/^(https?):\/([^\/])/, '$1://$2');
    cleaned = cleaned.replace(/\/+$/, '');
    return cleaned;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("headerImage") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB." },
                { status: 400 }
            );
        }

        // Get user's creator profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { creatorProfile: true }
        });

        if (!user?.creatorProfile) {
            return NextResponse.json(
                { error: "Creator profile not found" },
                { status: 404 }
            );
        }

        // Create unique filename
        const timestamp = Date.now();
        const ext = file.name.split(".").pop();
        const filename = `header-${user.creatorProfile.id}-${timestamp}.${ext}`;
        const r2Key = `uploads/headers/${filename}`;

        // Read file bytes
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // R2環境変数の確認
        const hasR2Config =
            process.env.R2_ACCOUNT_ID &&
            process.env.R2_ACCESS_KEY_ID &&
            process.env.R2_SECRET_ACCESS_KEY &&
            process.env.R2_CONTENT_BUCKET_NAME &&
            process.env.R2_CONTENT_PUBLIC_URL;

        let headerUrl: string;

        if (hasR2Config) {
            // 本番環境: R2にアップロード
            const r2Client = new S3Client({
                region: "auto",
                endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
                },
            });

            await r2Client.send(new PutObjectCommand({
                Bucket: process.env.R2_CONTENT_BUCKET_NAME!,
                Key: r2Key,
                Body: buffer,
                ContentType: file.type,
            }));

            const publicUrl = getCleanEnvUrl(process.env.R2_CONTENT_PUBLIC_URL);
            headerUrl = `${publicUrl}/${r2Key}`;
            console.log("[R2 HEADER] Uploaded to R2:", headerUrl);
        } else {
            // 開発環境: ローカルファイルシステムに保存
            const uploadDir = join(process.cwd(), "public", "uploads", "headers");
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }
            const filepath = join(uploadDir, filename);
            await writeFile(filepath, buffer);
            headerUrl = `/uploads/headers/${filename}`;
            console.log("[LOCAL HEADER] Saved locally:", headerUrl);
        }

        // Update creator profile
        await prisma.creatorProfile.update({
            where: { id: user.creatorProfile.id },
            data: { headerUrl }
        });

        return NextResponse.json({
            success: true,
            headerUrl
        });
    } catch (error) {
        console.error("Header image upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload header image" },
            { status: 500 }
        );
    }
}
