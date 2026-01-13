import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedUrl } from "@/lib/r2";

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
        const { filename, contentType } = body;

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

        // 署名付きURL生成
        const result = await generatePresignedUrl({
            filename,
            contentType,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Presigned URL generation error:", error);
        return NextResponse.json(
            { error: "署名付きURLの生成に失敗しました" },
            { status: 500 }
        );
    }
}
