import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// POST - クリエイターがプラン振込を申告する
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const body = await request.json();
        const { amount, transferorName, transferDate } = body;

        if (!amount || !transferorName || !transferDate) {
            return NextResponse.json({ error: "振込金額・振込人名義・振込日時は必須です" }, { status: 400 });
        }
        if (typeof amount !== "number" || amount <= 0) {
            return NextResponse.json({ error: "振込金額が不正です" }, { status: 400 });
        }

        // クリエイター情報を取得
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { creatorProfile: { select: { id: true } } },
        });

        if (!user?.creatorProfile) {
            return NextResponse.json({ error: "クリエイタープロフィールが見つかりません" }, { status: 404 });
        }

        const creatorId = user.creatorProfile.id;

        // PENDING のサブスクリプションを確認
        const subscription = await prisma.creatorSubscription.findUnique({
            where: { creatorId },
        });

        if (!subscription) {
            return NextResponse.json({ error: "プランが選択されていません" }, { status: 400 });
        }
        if (subscription.status !== "PENDING") {
            return NextResponse.json({ error: "振込申告できるのは入金待ちのプランのみです" }, { status: 400 });
        }

        // 既存の申告を確認（PENDING の重複申告を防ぐ）
        const existingClaim = await (prisma as any).creatorPlanTransferClaim.findFirst({
            where: { subscriptionId: subscription.id, status: "PENDING" },
        });
        if (existingClaim) {
            return NextResponse.json({ error: "既に振込申告済みです。管理者の確認をお待ちください。" }, { status: 400 });
        }

        // 申告を作成
        const claim = await (prisma as any).creatorPlanTransferClaim.create({
            data: {
                creatorId,
                subscriptionId: subscription.id,
                amount,
                transferorName: transferorName.trim(),
                transferDate: new Date(transferDate),
                status: "PENDING",
            },
        });

        return NextResponse.json({ claim, message: "振込申告を受け付けました。管理者が確認後、プランを有効化します。" });
    } catch (error) {
        console.error("Error creating plan transfer claim:", error);
        return NextResponse.json({ error: "振込申告の送信に失敗しました" }, { status: 500 });
    }
}

// GET - クリエイター自身の申告状況を取得
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { creatorProfile: { select: { id: true } } },
        });

        if (!user?.creatorProfile) {
            return NextResponse.json({ claim: null });
        }

        const subscription = await prisma.creatorSubscription.findUnique({
            where: { creatorId: user.creatorProfile.id },
        });

        if (!subscription) {
            return NextResponse.json({ claim: null });
        }

        const claim = await (prisma as any).creatorPlanTransferClaim.findFirst({
            where: { subscriptionId: subscription.id, status: "PENDING" },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ claim });
    } catch (error) {
        console.error("Error fetching plan transfer claim:", error);
        return NextResponse.json({ error: "申告情報の取得に失敗しました" }, { status: 500 });
    }
}
