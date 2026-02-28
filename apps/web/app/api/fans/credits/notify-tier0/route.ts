import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - Notify tier 0 claim to Discord via API
export async function POST(request: NextRequest) {
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
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { creatorId } = body;

        if (!creatorId || typeof creatorId !== "string") {
            return NextResponse.json(
                { error: "クリエイターIDが必要です" },
                { status: 400 }
            );
        }

        // Call backend API to notify Discord
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

        const response = await fetch(`${API_BASE_URL}/payments/claims/notify-tier0`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": user.id, // Pass user ID for authentication
            },
            body: JSON.stringify({
                creatorId,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            const errorMessage = error.message || error.error || "";
            return NextResponse.json(
                { error: errorMessage || "通知の送信に失敗しました" },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error notifying tier 0:", error);
        return NextResponse.json(
            { error: "通知の送信に失敗しました" },
            { status: 500 }
        );
    }
}
