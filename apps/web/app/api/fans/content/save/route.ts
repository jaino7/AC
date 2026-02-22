import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - 保存・保存解除を切り替える
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証されていません" }, { status: 401 });
        }

        const body = await request.json();
        const { contentId, handle } = body;

        if (!contentId || !handle) {
            return NextResponse.json({ error: "投稿IDとクリエイターのハンドルは必須です" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }

        // クリエイターをハンドル名から探す
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { handle },
        });

        if (!creatorProfile) {
            return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
        }

        // 該当のクリエイターに対するファンプロフィールを取得
        const fanProfile = await prisma.fanProfile.findUnique({
            where: {
                userId_creatorId: {
                    userId: user.id,
                    creatorId: creatorProfile.id,
                },
            },
        });

        if (!fanProfile) {
            return NextResponse.json({ error: "ファンプロフィールが見つかりません" }, { status: 404 });
        }

        // 既に保存されているかチェック
        const existingSavedPost = await prisma.savedPost.findUnique({
            where: {
                fanId_postId: {
                    fanId: fanProfile.id,
                    postId: contentId,
                },
            },
        });

        let isSaved = false;

        if (existingSavedPost) {
            // 既に保存されていれば解除
            await prisma.savedPost.delete({
                where: {
                    id: existingSavedPost.id,
                },
            });
            isSaved = false;
        } else {
            // 保存されていなければ新規保存
            await prisma.savedPost.create({
                data: {
                    fanId: fanProfile.id,
                    postId: contentId,
                },
            });
            isSaved = true;
        }

        return NextResponse.json({ success: true, isSaved });
    } catch (error) {
        console.error("Error toggling save post:", error);
        return NextResponse.json(
            { error: "投稿の保存処理に失敗しました" },
            { status: 500 }
        );
    }
}
