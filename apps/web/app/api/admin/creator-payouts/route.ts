import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// PENDING の CreatorPayout 一覧を返す
export async function GET(request: NextRequest) {
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

    const payouts = await prisma.creatorPayout.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        include: {
            creator: {
                select: {
                    displayName: true,
                    handle: true,
                    user: { select: { email: true } },
                },
            },
            bankAccount: true,
        },
    });

    return NextResponse.json({ payouts });
}
