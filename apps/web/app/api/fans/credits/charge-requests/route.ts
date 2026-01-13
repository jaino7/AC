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

        // Find user and fan profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                fanProfile: {
                    select: {
                        id: true,
                        chargeRequests: {
                            orderBy: {
                                createdAt: "desc"
                            }
                        }
                    },
                },
            },
        });

        if (!user?.fanProfile) {
            return NextResponse.json(
                { error: "ファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            chargeRequests: user.fanProfile.chargeRequests
        });
    } catch (error) {
        console.error("Error fetching charge requests:", error);
        return NextResponse.json(
            { error: "チャージ申請の取得に失敗しました" },
            { status: 500 }
        );
    }
}
