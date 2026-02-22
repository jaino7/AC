import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        const { handle } = params;

        // Get creator by handle
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle },
            select: { id: true, userId: true },
        });

        if (!creator) {
            return NextResponse.json(
                { error: "クリエイターが見つかりません" },
                { status: 404 }
            );
        }

        // Verify ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user || user.id !== creator.userId) {
            return NextResponse.json(
                { error: "アクセス権限がありません" },
                { status: 403 }
            );
        }

        // CreatorPayoutから実際の振込記録を取得（COMPLETED のもののみ）
        const payouts = await prisma.creatorPayout.findMany({
            where: {
                creatorId: creator.id,
                status: "COMPLETED",
            },
            orderBy: { processedAt: "desc" },
            take: 24,
        });

        const paymentHistory = payouts.map((p: any) => {
            const d = p.processedAt || p.createdAt;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return {
                date: `${year}/${month}/${day}`,
                amount: p.amount,
            };
        });

        return NextResponse.json({
            paymentHistory,
        });
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return NextResponse.json(
            { error: "支払い履歴の取得に失敗しました" },
            { status: 500 }
        );
    }
}
