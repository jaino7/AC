import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/creators/[handle]/inquiries - お問い合わせ一覧取得
export async function GET(
    request: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: { id: true, userId: true }
        });

        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        if (creator.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status"); // UNREAD | READ | CLOSED | all
        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = 20;

        const validStatuses = ["UNREAD", "READ", "CLOSED"] as const;
        type ValidStatus = typeof validStatuses[number];

        const where = {
            creatorId: creator.id,
            ...(status && status !== "all" && (validStatuses as readonly string[]).includes(status)
                ? { status: status as ValidStatus }
                : {}),
        };

        const [inquiries, total] = await Promise.all([
            prisma.inquiry.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    fanName: true,
                    fanEmail: true,
                    message: true,
                    fields: true,
                    status: true,
                    createdAt: true,
                }
            }),
            prisma.inquiry.count({ where }),
        ]);

        const unreadCount = await prisma.inquiry.count({
            where: { creatorId: creator.id, status: "UNREAD" }
        });

        return NextResponse.json({
            inquiries,
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
