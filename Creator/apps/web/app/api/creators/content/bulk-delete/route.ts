import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// 一括削除
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { postIds } = body;

        // バリデーション
        if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
            return NextResponse.json(
                { error: "削除する投稿IDを指定してください" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // 削除対象の投稿が全て自分のものか確認
        const postsToDelete = await prisma.post.findMany({
            where: {
                id: { in: postIds },
                creatorId: creatorProfile.id
            },
            select: { id: true }
        });

        if (postsToDelete.length !== postIds.length) {
            return NextResponse.json(
                { error: "削除権限のない投稿が含まれています" },
                { status: 403 }
            );
        }

        // 一括削除実行（PostTagは自動的にカスケード削除される）
        const result = await prisma.post.deleteMany({
            where: {
                id: { in: postIds },
                creatorId: creatorProfile.id
            }
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
            message: `${result.count}件の投稿を削除しました`
        });
    } catch (error) {
        console.error("Bulk delete error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}
