import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Get creator ID from session
        const creator = await prisma.creatorProfile.findFirst({
            where: { user: { email: session.user.email } },
            select: { id: true },
        });

        if (!creator) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const body = await request.json();

        // Call NestJS API
        const response = await fetch(`${API_URL}/domains`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-creator-id": creator.id,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { error: errorData.message || "ドメインの登録に失敗しました" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating domain:", error);
        return NextResponse.json(
            { error: "ドメインの登録に失敗しました" },
            { status: 500 }
        );
    }
}
