import { NextResponse } from "next/server";
import { prisma } from "@creator/shared";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "メールアドレスが必要です" },
                { status: 400 }
            );
        }

        // メールアドレスの形式を簡易的にチェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "有効なメールアドレスを入力してください" },
                { status: 400 }
            );
        }

        // タイミング攻撃対策: 常に一定時間待機
        const startTime = Date.now();

        // データベースでユーザーを検索
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { id: true }
        });

        // 最低100ms待機してタイミング攻撃を防ぐ
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 100) {
            await new Promise(resolve => setTimeout(resolve, 100 - elapsedTime));
        }

        return NextResponse.json({
            exists: !!user
        });
    } catch (error) {
        console.error("Email check error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}
