import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const categoryLabels: Record<string, string> = {
    BUG: "問題・不具合",
    IMPROVEMENT: "改善",
    FEATURE_REQUEST: "機能リクエスト",
};

async function sendDiscordNotification(data: {
    userName: string;
    userEmail: string;
    category: string;
    body: string;
    imageUrls: string[];
}) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_CONTACT;

    if (!webhookUrl) {
        console.error("DISCORD_WEBHOOK_CONTACT is not configured");
        return;
    }

    const categoryLabel = categoryLabels[data.category] || data.category;

    const fields = [
        { name: "ユーザー", value: data.userName || "不明", inline: true },
        { name: "メールアドレス", value: data.userEmail, inline: true },
        { name: "種別", value: categoryLabel, inline: false },
        {
            name: "内容",
            value: data.body.length > 1000 ? data.body.substring(0, 1000) + "..." : data.body,
            inline: false,
        },
    ];

    if (data.imageUrls.length > 0) {
        fields.push({
            name: "添付画像",
            value: data.imageUrls.map((url, i) => `[画像${i + 1}](${url})`).join(" | "),
            inline: false,
        });
    }

    const embed = {
        title: "💬 クリエイターからのフィードバック",
        color: 0x8b5cf6, // Purple
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: "CocoBa フィードバック" },
    };

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Discord webhook error:", response.status, errorText);
        }
    } catch (error) {
        console.error("Failed to send Discord notification:", error);
    }
}

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
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const formData = await request.formData();
        const category = formData.get("category") as string;
        const body = formData.get("body") as string;
        const files = formData.getAll("files") as File[];

        if (!category || !body) {
            return NextResponse.json(
                { error: "カテゴリと内容は必須です" },
                { status: 400 }
            );
        }

        const validCategories = ["BUG", "IMPROVEMENT", "FEATURE_REQUEST"];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { error: "無効なカテゴリです" },
                { status: 400 }
            );
        }

        // Upload images
        const imageUrls: string[] = [];
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        const maxSize = 10 * 1024 * 1024; // 10MB per file

        const hasR2Config =
            process.env.R2_ACCOUNT_ID &&
            process.env.R2_ACCESS_KEY_ID &&
            process.env.R2_SECRET_ACCESS_KEY &&
            process.env.R2_CONTENT_BUCKET_NAME &&
            process.env.R2_CONTENT_PUBLIC_URL;

        for (const file of files) {
            if (!validTypes.includes(file.type)) continue;
            if (file.size > maxSize) continue;
            if (file.size === 0) continue;

            const timestamp = Date.now();
            const ext = file.name.split(".").pop();
            const filename = `feedback-${user.id}-${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const r2Key = `uploads/feedback/${filename}`;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            if (hasR2Config) {
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
                imageUrls.push(`${publicUrl}/${r2Key}`);
            } else {
                const uploadDir = join(process.cwd(), "public", "uploads", "feedback");
                if (!existsSync(uploadDir)) {
                    await mkdir(uploadDir, { recursive: true });
                }
                await writeFile(join(uploadDir, filename), buffer);
                imageUrls.push(`/uploads/feedback/${filename}`);
            }
        }

        // Discord通知（DB保存とは独立して送信）
        sendDiscordNotification({
            userName: user.name || "不明",
            userEmail: user.email || "不明",
            category,
            body,
            imageUrls,
        }).catch((err) => console.error("Discord notification failed:", err));

        // DB保存
        let feedback = null;
        try {
            feedback = await prisma.feedback.create({
                data: {
                    userId: user.id,
                    category,
                    body,
                    imageUrls,
                },
            });
        } catch (dbError) {
            console.error("Feedback DB save failed (Discord notification still sent):", dbError);
        }

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error("Feedback submission error:", error);
        return NextResponse.json(
            { error: "フィードバックの送信に失敗しました" },
            { status: 500 }
        );
    }
}
