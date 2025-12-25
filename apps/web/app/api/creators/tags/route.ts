import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// タグ一覧取得
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
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

        const tags = await prisma.tag.findMany({
            where: { creatorId: creatorProfile.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { posts: true }
                }
            }
        });

        return NextResponse.json({ tags });
    } catch (error) {
        console.error("Tag fetch error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}

// タグ作成
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { name } = body;

        // バリデーション
        if (!name || name.trim() === "") {
            return NextResponse.json(
                { error: "タグ名は必須です" },
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

        // 同じ名前のタグが既に存在するかチェック
        const existingTag = await prisma.tag.findUnique({
            where: {
                creatorId_name: {
                    creatorId: creatorProfile.id,
                    name: name.trim()
                }
            }
        });

        if (existingTag) {
            return NextResponse.json(
                { error: "同じ名前のタグが既に存在します" },
                { status: 400 }
            );
        }

        const tag = await prisma.tag.create({
            data: {
                creatorId: creatorProfile.id,
                name: name.trim()
            }
        });

        return NextResponse.json(tag, { status: 201 });
    } catch (error) {
        console.error("Tag creation error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}
