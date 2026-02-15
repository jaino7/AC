import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * 開発環境用のローカルファイルアップロードエンドポイント
 * publicディレクトリにファイルを保存
 */
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");

        if (!key) {
            return NextResponse.json(
                { error: "Key is required" },
                { status: 400 }
            );
        }

        // リクエストボディからファイルを取得
        const buffer = Buffer.from(await request.arrayBuffer());

        // public/uploadsディレクトリを作成（存在しない場合）
        const uploadsDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // ファイル名をkeyから取得（uploads/xxx.jpg -> xxx.jpg）
        const filename = key.split("/").pop() || "file";
        const filepath = join(uploadsDir, filename);

        // ファイルを保存
        await writeFile(filepath, buffer);

        console.log(`[LOCAL STORAGE] File saved: ${filepath}`);

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[LOCAL STORAGE] Upload error:", error);
        return NextResponse.json(
            { error: "File upload failed" },
            { status: 500 }
        );
    }
}
