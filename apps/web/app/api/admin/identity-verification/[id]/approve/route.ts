import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - 本人確認申請を承認
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // 本人確認レコードの存在確認
        const verification = await prisma.identityVerification.findUnique({
            where: { id },
        });

        if (!verification) {
            return NextResponse.json(
                { error: "本人確認申請が見つかりません" },
                { status: 404 }
            );
        }

        if (verification.status !== "PENDING") {
            return NextResponse.json(
                { error: "この申請は既に処理済みです" },
                { status: 400 }
            );
        }

        // ステータスをAPPROVEDに更新
        const updatedVerification = await prisma.identityVerification.update({
            where: { id },
            data: {
                status: "APPROVED",
                reviewedBy: session.user.email,
                reviewedAt: new Date(),
                verifiedAt: new Date(),
                rejectReason: null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "本人確認を承認しました",
            verification: updatedVerification,
        });
    } catch (error) {
        console.error("Failed to approve verification:", error);
        return NextResponse.json(
            { error: "承認に失敗しました" },
            { status: 500 }
        );
    }
}
