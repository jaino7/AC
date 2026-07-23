import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - クリエイター自身の本人確認ステータスを取得
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                creatorProfile: {
                    include: {
                        identityVerification: true,
                    },
                },
            },
        });

        if (!user?.creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const verification = user.creatorProfile.identityVerification;

        if (!verification) {
            return NextResponse.json({
                status: "NONE",
            });
        }

        return NextResponse.json({
            status: verification.status,
            rejectReason: verification.rejectReason || null,
            submittedAt: verification.createdAt.toISOString(),
            reviewedAt: verification.reviewedAt?.toISOString() || null,
        });
    } catch (error) {
        console.error("Failed to get verification status:", error);
        return NextResponse.json(
            { error: "ステータスの取得に失敗しました" },
            { status: 500 }
        );
    }
}
