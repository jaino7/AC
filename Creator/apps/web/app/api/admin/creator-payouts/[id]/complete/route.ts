import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// CreatorPayout を COMPLETED に更新する
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
    });
    if (user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const note: string | undefined = body.note;

    const payout = await prisma.creatorPayout.findUnique({ where: { id } });
    if (!payout) {
        return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }
    if (payout.status !== "PENDING") {
        return NextResponse.json(
            { error: "This payout is not in PENDING status" },
            { status: 400 }
        );
    }

    const updated = await prisma.creatorPayout.update({
        where: { id },
        data: {
            status: "COMPLETED",
            processedAt: new Date(),
            ...(note ? { note } : {}),
        },
    });

    return NextResponse.json({ success: true, payout: updated });
}
