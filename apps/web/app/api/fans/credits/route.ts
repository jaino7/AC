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

        // Find user and fan profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                fanProfile: {
                    select: {
                        id: true,
                        credits: true,
                        creditHistory: {
                            orderBy: {
                                createdAt: "desc"
                            },
                            take: 50 // Latest 50 records
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
            credits: user.fanProfile.credits,
            history: user.fanProfile.creditHistory
        });
    } catch (error) {
        console.error("Error fetching credits:", error);
        return NextResponse.json(
            { error: "クレジット情報の取得に失敗しました" },
            { status: 500 }
        );
    }
}
