import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedViewUrlPrivate } from "@/lib/r2";

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

        // TODO: 管理者権限チェック（実装に応じて調整）
        // const user = await prisma.user.findUnique({
        //     where: { email: session.user.email },
        // });
        // if (user?.role !== "ADMIN") {
        //     return NextResponse.json(
        //         { error: "管理者権限が必要です" },
        //         { status: 403 }
        //     );
        // }

        const { key } = await request.json();

        if (!key) {
            return NextResponse.json(
                { error: "キーが指定されていません" },
                { status: 400 }
            );
        }

        // presigned URLを生成（1時間有効）
        const presignedUrl = await generatePresignedViewUrlPrivate(key, 3600);

        return NextResponse.json({
            success: true,
            url: presignedUrl,
        });
    } catch (error) {
        console.error("Presigned URL generation error:", error);
        return NextResponse.json(
            { error: "URL生成に失敗しました" },
            { status: 500 }
        );
    }
}
