import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - 本人確認申請を却下
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

        const body = await request.json();
        const { reason, customReason } = body;

        // 却下理由の生成
        const rejectionReasonLabels: Record<string, string> = {
            blurry: "画像がぼやけている",
            expired: "書類の有効期限が切れている",
            invalid: "無効な書類",
            incomplete: "書類の一部が欠けている",
        };

        const rejectReason = reason === "other"
            ? customReason || "その他の理由"
            : rejectionReasonLabels[reason] || reason;

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

        // ステータスをREJECTEDに更新
        const updatedVerification = await prisma.identityVerification.update({
            where: { id },
            data: {
                status: "REJECTED",
                reviewedBy: session.user.email,
                reviewedAt: new Date(),
                rejectReason,
            },
        });

        return NextResponse.json({
            success: true,
            message: "本人確認を却下しました",
            verification: updatedVerification,
        });
    } catch (error) {
        console.error("Failed to reject verification:", error);
        return NextResponse.json(
            { error: "却下に失敗しました" },
            { status: 500 }
        );
    }
}
