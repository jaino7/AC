import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - Reject a charge request
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true },
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "管理者権限が必要です" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { rejectionReason } = body;

        if (!rejectionReason) {
            return NextResponse.json(
                { error: "却下理由は必須です" },
                { status: 400 }
            );
        }

        const chargeRequestId = params.id;

        // Update charge request
        const chargeRequest = await prisma.chargeRequest.update({
            where: { id: chargeRequestId },
            data: {
                status: "REJECTED",
                rejectionReason,
            }
        });

        return NextResponse.json({
            success: true,
            chargeRequest
        });
    } catch (error) {
        console.error("Error rejecting charge request:", error);
        return NextResponse.json(
            { error: "チャージ申請の却下に失敗しました" },
            { status: 500 }
        );
    }
}
