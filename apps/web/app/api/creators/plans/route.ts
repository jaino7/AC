import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

export async function GET(request: Request) {
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
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: {
                id: true,
                plans: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                    },
                    orderBy: {
                        price: "asc",
                    },
                },
            },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            plans: creatorProfile.plans,
        });
    } catch (error) {
        console.error("Plans fetch error:", error);
        return NextResponse.json(
            { error: "プランの取得に失敗しました" },
            { status: 500 }
        );
    }
}
