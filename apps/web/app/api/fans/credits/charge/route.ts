import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - Create a credit charge request
export async function POST(request: NextRequest) {
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
                    select: { id: true },
                },
            },
        });

        if (!user?.fanProfile) {
            return NextResponse.json(
                { error: "ファンプロフィールが見つかりません" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { amount } = body;

        // Validate amount
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

        // Generate unique identifier code
        const identifierCode = `CR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Calculate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create charge request
        const chargeRequest = await prisma.chargeRequest.create({
            data: {
                fanId: user.fanProfile.id,
                amount,
                identifierCode,
                expiresAt,
            },
        });

        // Bank information (TODO: Get from config or database)
        const bankInfo = {
            bankName: "三菱UFJ銀行",
            branchName: "渋谷支店",
            accountType: "普通",
            accountNumber: "1234567",
            accountHolder: "カ)サンプル"
        };

        return NextResponse.json({
            chargeRequest: {
                id: chargeRequest.id,
                amount: chargeRequest.amount,
                identifierCode: chargeRequest.identifierCode,
                status: chargeRequest.status,
                expiresAt: chargeRequest.expiresAt,
                bankInfo,
                instructions: `振込名義人の前に識別コード「${chargeRequest.identifierCode}」を付けてください。\n例: ${chargeRequest.identifierCode} ヤマダタロウ`
            }
        });
    } catch (error) {
        console.error("Error creating charge request:", error);
        return NextResponse.json(
            { error: "チャージ申請の作成に失敗しました" },
            { status: 500 }
        );
    }
}
