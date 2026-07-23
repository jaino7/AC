import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Get creator ID from session
        const creator = await prisma.creatorProfile.findFirst({
            where: { user: { email: session.user.email } },
            select: { id: true },
        });

        if (!creator) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        // Get domain for this creator
        const domain = await prisma.domain.findFirst({
            where: { creatorId: creator.id },
        });

        if (!domain) {
            return NextResponse.json(null);
        }

        return NextResponse.json(domain);
    } catch (error) {
        console.error("Error fetching domain:", error);
        return NextResponse.json(
            { error: "ドメインの取得に失敗しました" },
            { status: 500 }
        );
    }
}
