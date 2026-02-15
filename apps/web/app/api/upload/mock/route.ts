import { NextResponse } from "next/server";

/**
 * 開発環境用のモックアップロードエンドポイント
 * ファイルを受け取るが実際には保存しない
 */
export async function PUT(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    console.log(`[MOCK] File upload simulated for key: ${key}`);

    // 成功レスポンスを返す
    return new NextResponse(null, { status: 200 });
}
