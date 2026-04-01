import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get user's charge requests
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const handle = url.searchParams.get("handle");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        let fanProfile;

        if (handle) {
            const creator = await prisma.creatorProfile.findUnique({
                where: { handle },
                select: { id: true },
            });

            if (!creator) {
                return NextResponse.json(
                    { error: "クリエイターが見つかりません" },
                    { status: 404 }
                );
            }

            fanProfile = await prisma.fanProfile.findUnique({
                where: {
                    userId_creatorId: {
                        userId: user.id,
                        creatorId: creator.id,
                    },
                },
                select: {
                    id: true,
                    chargeRequests: {
                        orderBy: { createdAt: "desc" },
                    },
                },
            });
        } else {
            const fanProfiles = await prisma.fanProfile.findMany({
                where: { userId: user.id },
                select: {
                    id: true,
                    chargeRequests: {
                        orderBy: { createdAt: "desc" },
                    },
                },
                take: 1,
            });
            fanProfile = fanProfiles[0];
        }

        if (!fanProfile) {
            return NextResponse.json({ chargeRequests: [] });
        }

        return NextResponse.json({
            chargeRequests: fanProfile.chargeRequests,
        });
    } catch (error) {
        console.error("Error fetching charge requests:", error);
        return NextResponse.json(
            { error: "チャージ申請の取得に失敗しました" },
            { status: 500 }
        );
    }
}
