import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST /api/fans/ensure-profile?handle=xxx
// 認証済みユーザーに対して、指定クリエイターの FanProfile が存在しない場合に自動作成する
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const handle = searchParams.get("handle");

        if (!handle) {
            return NextResponse.json({ error: "handle が必要です" }, { status: 400 });
        }

        const [user, creator] = await Promise.all([
            prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true, name: true, email: true },
            }),
            prisma.creatorProfile.findUnique({
                where: { handle },
                select: { id: true },
            }),
        ]);

        if (!user) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }
        if (!creator) {
            return NextResponse.json({ error: "クリエイターが見つかりません" }, { status: 404 });
        }

        // FanProfile が既に存在すればそのまま返す
        const existing = await prisma.fanProfile.findUnique({
            where: { userId_creatorId: { userId: user.id, creatorId: creator.id } },
            select: { id: true },
        });

        if (existing) {
            return NextResponse.json({ created: false, fanProfileId: existing.id });
        }

        // 存在しない場合は作成
        const fanProfile = await prisma.fanProfile.create({
            data: {
                userId: user.id,
                creatorId: creator.id,
                displayName: user.name || user.email!.split("@")[0],
                credits: 0,
            },
            select: { id: true },
        });

        return NextResponse.json({ created: true, fanProfileId: fanProfile.id });
    } catch (error) {
        console.error("ensure-profile error:", error);
        return NextResponse.json({ error: "FanProfileの作成に失敗しました" }, { status: 500 });
    }
}
