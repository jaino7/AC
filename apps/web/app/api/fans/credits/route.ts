import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get user's credits and history
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Get handle from query params
        const url = new URL(request.url);
        const handle = url.searchParams.get("handle");

        // Find user
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
            // Find creator by handle
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

            // Find fan profile for this creator
            fanProfile = await prisma.fanProfile.findUnique({
                where: {
                    userId_creatorId: {
                        userId: user.id,
                        creatorId: creator.id,
                    },
                },
                select: {
                    id: true,
                    credits: true,
                    tier: true,
                    trustScore: true,
                    isLocked: true,
                    creditHistory: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 50,
                    },
                },
            });
        } else {
            // Legacy: Use first fan profile
            const fanProfiles = await prisma.fanProfile.findMany({
                where: { userId: user.id },
                select: {
                    id: true,
                    credits: true,
                    tier: true,
                    trustScore: true,
                    isLocked: true,
                    creditHistory: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 50,
                    },
                },
                take: 1,
            });

            fanProfile = fanProfiles[0];
        }

        if (!fanProfile) {
            return NextResponse.json(
                { error: "ファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            credits: fanProfile.credits,
            tier: fanProfile.tier,
            trustScore: fanProfile.trustScore,
            isLocked: fanProfile.isLocked,
            history: fanProfile.creditHistory,
        });
    } catch (error) {
        console.error("Error fetching credits:", error);
        return NextResponse.json(
            { error: "クレジット情報の取得に失敗しました" },
            { status: 500 }
        );
    }
}
