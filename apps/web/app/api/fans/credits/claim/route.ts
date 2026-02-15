import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }

        const body = await request.json();
        const { chargeRequestId, creatorId } = body;

        if (!chargeRequestId || !creatorId) {
            return NextResponse.json(
                { error: "必要なパラメータが不足しています" },
                { status: 400 }
            );
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

        const response = await fetch(`${API_BASE_URL}/payments/claims`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": user.id,
            },
            body: JSON.stringify({ chargeRequestId, creatorId }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: error.message ?? "申告の送信に失敗しました" },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json({
            success: true,
            immediateCredit: result.immediateCredit,
            pendingCredit: result.pendingCredit,
            message: result.message,
        });
    } catch (error) {
        console.error("Error creating claim:", error);
        return NextResponse.json({ error: "申告の送信に失敗しました" }, { status: 500 });
    }
}
