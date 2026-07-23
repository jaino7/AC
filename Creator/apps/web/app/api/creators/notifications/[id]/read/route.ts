import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// PUT /api/creators/notifications/[id]/read - 通知を既読にする
export async function PUT(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        // 自分の通知のみ既読にできるよう確認
        const notification = await prisma.notification.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                creator: { select: { user: { select: { email: true } } } },
            },
        });

        if (!notification) {
            return NextResponse.json({ error: "通知が見つかりません" }, { status: 404 });
        }

        if (notification.creator.user.email !== session.user.email) {
            return NextResponse.json({ error: "権限がありません" }, { status: 403 });
        }

        const updated = await prisma.notification.update({
            where: { id: params.id },
            data: { isRead: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Notification read error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
