import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// プランごとのストレージ上限（バイト）
const STORAGE_LIMITS: Record<string, number> = {
  FREE: 15 * 1024 * 1024 * 1024,           // 15 GB
  LITE: 200 * 1024 * 1024 * 1024,          // 200 GB
  BUSINESS: 1 * 1024 * 1024 * 1024 * 1024, // 1 TB
};

function parseByteTotal(total: unknown): number {
  if (typeof total === "bigint") return Number(total);
  if (typeof total === "number") return total;
  if (typeof total === "string") return Number(total);
  return 0;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: user.id },
    });

    if (!creatorProfile) {
      return NextResponse.json({ error: "クリエイタープロフィールが見つかりません" }, { status: 404 });
    }

    // クリエイターの契約プランを取得
    const planResult = await prisma.$queryRaw<Array<{ type: string; status: string }>>`
            SELECT cp."type", cs."status"
            FROM "CreatorSubscription" cs
            INNER JOIN "CreatorPlan" cp ON cs."planId" = cp."id"
            WHERE cs."creatorId" = ${creatorProfile.id}
            LIMIT 1
        `;

    // アクティブなプランがあればそのtype、なければFREE
    const planType = (planResult.length > 0 && planResult[0].status === "ACTIVE")
      ? planResult[0].type
      : "FREE";

    // Mediaのサイズ合計を取得
    const sizeResult = await prisma.$queryRaw<Array<{ total: bigint | number | string }>>`
            SELECT COALESCE(SUM(m."size"), 0)::bigint as total
            FROM "Media" m
            INNER JOIN "Post" p ON m."postId" = p."id"
            WHERE p."creatorId" = ${creatorProfile.id}
        `;

    const usedBytes = parseByteTotal(sizeResult[0]?.total);
    const limitBytes = STORAGE_LIMITS[planType] || STORAGE_LIMITS.FREE;

    return NextResponse.json({
      usedBytes,
      limitBytes,
      storagePlan: planType,
    });
  } catch (error) {
    console.error("Storage API error:", error);
    return NextResponse.json(
      { error: "ストレージ情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
