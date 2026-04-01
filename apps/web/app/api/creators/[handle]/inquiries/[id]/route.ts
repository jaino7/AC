import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/creators/[handle]/inquiries/[id] - ステータス変更
export async function PATCH(
    request: NextRequest,
    { params }: { params: { handle: string; id: string } }
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

        const body = await request.json();
        const { status } = body;

        const validStatuses = ["UNREAD", "READ", "CLOSED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const inquiry = await prisma.inquiry.findFirst({
            where: { id: params.id, creatorId: creator.id }
        });

        if (!inquiry) {
            return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
        }

        const updated = await prisma.inquiry.update({
            where: { id: params.id },
            data: { status },
            select: { id: true, status: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating inquiry:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
