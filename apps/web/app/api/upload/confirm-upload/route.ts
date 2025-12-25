import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { key, fileUrl, filename, contentType, size } = body;

        // バリデーション
        if (!key || !fileUrl || !filename || !contentType) {
            return NextResponse.json(
                { error: "必須フィールドが不足しています" },
                { status: 400 }
            );
        }

        // 注意: Mediaテーブルへの保存はPostと紐付けて行うため、
        // ここでは単にアップロード完了を確認するだけ
        // 実際のMedia作成は投稿作成時に行う

        return NextResponse.json({
            success: true,
            fileUrl,
        });
    } catch (error) {
        console.error("Upload confirmation error:", error);
        return NextResponse.json(
            { error: "アップロード確認に失敗しました" },
            { status: 500 }
        );
    }
}
