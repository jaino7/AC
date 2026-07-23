import { NextResponse } from "next/server";
import { prisma } from "@creator/shared";

// GET - 全クリエイタープランを取得
export async function GET() {
    try {
        const plans = await prisma.creatorPlan.findMany({
            orderBy: { monthlyPrice: "asc" },
            select: {
                id: true,
                type: true,
                name: true,
                monthlyPrice: true,
                yearlyPrice: true,
                feeRate: true,
                features: true,
            },
        });

        return NextResponse.json({ plans });
    } catch (error) {
        console.error("Error fetching creator plans:", error);
        return NextResponse.json(
            { error: "プラン情報の取得に失敗しました" },
            { status: 500 }
        );
    }
}
