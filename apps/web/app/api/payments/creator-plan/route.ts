import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - Create payment request for creator plan
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "ログインが必要です" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { planType, isYearly } = body;

        if (!planType) {
            return NextResponse.json(
                { error: "プランタイプが指定されていません" },
                { status: 400 }
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

        // Find creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { id: true, handle: true },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "クリエイタープロフィールが見つかりません。先にクリエイター登録を完了してください。" },
                { status: 404 }
            );
        }

        // Calculate amount based on plan type
        const planPrices: Record<string, { monthly: number; yearly: number }> = {
            LITE: { monthly: 4980, yearly: 49800 },
            BUSINESS: { monthly: 29800, yearly: 298000 },
        };

        const prices = planPrices[planType];
        if (!prices) {
            return NextResponse.json(
                { error: "無効なプランタイプです" },
                { status: 400 }
            );
        }

        // Call backend API to create creator plan purchase and assign virtual account
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

        const response = await fetch(`${API_BASE_URL}/payments/creator-plan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Creator-Id": creatorProfile.id,
            },
            body: JSON.stringify({
                planType,
                isYearly: isYearly ?? false,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));

            // Debug: Log the error response
            console.error("Backend error response:", {
                status: response.status,
                error: error,
                message: error.message,
                errorField: error.error,
            });

            // NestJS returns error in 'message' field, not 'error.message'
            const errorMessage = error.message || error.error || "";
            const isInventoryError = errorMessage.toLowerCase().includes("inventory");

            return NextResponse.json(
                {
                    error: isInventoryError
                        ? "現在、入金窓口が大変混み合っております。数時間後にもう一度お試しください"
                        : errorMessage || "プラン購入リクエストの作成に失敗しました"
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        return NextResponse.json({
            amount: result.amount,
            planType: result.planName,
            isYearly: result.isYearly,
            identifierCode: result.identifierCode,
            expiresAt: result.expiresAt,
            virtualAccount: {
                accountNumber: result.virtualAccount.accountNumber,
                accountName: result.virtualAccount.accountName,
                branchCode: result.virtualAccount.branchCode,
                branchName: result.virtualAccount.branchName,
            },
        });
    } catch (error) {
        console.error("Creator plan payment error:", error);
        return NextResponse.json(
            { error: "支払い情報の取得に失敗しました" },
            { status: 500 }
        );
    }
}
