import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
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
            include: {
                plans: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        features: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json(creatorProfile);
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { error: "認証が必要です" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { displayName, bio, theme, themeConfig } = body;

        // バリデーション
        const updateData: any = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (bio !== undefined) updateData.bio = bio;
        if (theme !== undefined) {
            const validThemes = ["creator-pro", "neon-pro", "studio-pro", "velvet-pro", "pure-lite", "zine-lite"];
            if (!validThemes.includes(theme)) {
                return NextResponse.json(
                    { error: "無効なテーマです" },
                    { status: 400 }
                );
            }
            updateData.theme = theme;
        }
        if (themeConfig !== undefined) updateData.themeConfig = themeConfig;

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

        const updatedProfile = await prisma.creatorProfile.update({
            where: { userId: user.id },
            data: updateData
        });

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "サーバーエラーが発生しました" },
            { status: 500 }
        );
    }
}
