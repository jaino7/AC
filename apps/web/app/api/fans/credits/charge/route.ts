import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - Create a credit charge request with virtual account assignment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Find user
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
        const { amount, creatorId } = body;

        // Validate inputs
        if (!creatorId || typeof creatorId !== "string") {
            return NextResponse.json(
                { error: "クリエイターIDが必要です" },
                { status: 400 }
            );
        }

        if (!amount || typeof amount !== "number" || amount < 1000) {
            return NextResponse.json(
                { error: "チャージ金額は1,000円以上である必要があります" },
                { status: 400 }
            );
        }

        if (amount > 100000) {
            return NextResponse.json(
                { error: "チャージ金額は100,000円以下である必要があります" },
                { status: 400 }
            );
        }

        // Call backend API to create ChargeRequest and assign virtual account
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

        const response = await fetch(`${API_BASE_URL}/payments/charge`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": user.id, // Pass user ID for authentication
            },
            body: JSON.stringify({
                creatorId,
                amount,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            // NestJS returns error in 'message' field, not 'error.message'
            const errorMessage = error.message || error.error || "";
            const isInventoryError = errorMessage.toLowerCase().includes("inventory");

            return NextResponse.json(
                {
                    error: isInventoryError
                        ? "現在、入金窓口が大変混み合っております。数時間後にもう一度お試しください"
                        : errorMessage || "チャージ申請の作成に失敗しました"
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        // Return formatted response
        return NextResponse.json({
            chargeRequest: {
                id: result.chargeRequestId,
                amount: result.amount,
                identifierCode: result.identifierCode,
                expiresAt: result.expiresAt,
                bankInfo: {
                    bankName: "GMOあおぞらネット銀行",
                    branchName: result.virtualAccount.branchName || "法人第一営業部",
                    branchCode: result.virtualAccount.branchCode,
                    accountType: "普通",
                    accountNumber: result.virtualAccount.accountNumber,
                    accountHolder: result.virtualAccount.accountName,
                },
                instructions: `この口座に振り込んだ金額が自動的にクレジットとしてチャージされます。\n振込期限: ${new Date(result.expiresAt).toLocaleDateString("ja-JP")}まで`,
            },
        });
    } catch (error) {
        console.error("Error creating charge request:", error);
        return NextResponse.json(
            { error: "チャージ申請の作成に失敗しました" },
            { status: 500 }
        );
    }
}
