import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET /api/creators/notifications - 通知一覧を取得
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") ?? "10", 10);

        const creator = await prisma.creatorProfile.findFirst({
            where: { user: { email: session.user.email } },
            select: { id: true },
        });

        if (!creator) {
            return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
        }

        const notifications = await prisma.notification.findMany({
            where: { creatorId: creator.id },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
