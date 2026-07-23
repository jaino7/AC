import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET /api/creators/subscription-plans
// ?handle=xxx → public access (fan-facing)
// no handle   → authenticated access (preview by creator)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const handle = searchParams.get("handle");

        let creatorId: string;

        if (handle) {
            const creator = await prisma.creatorProfile.findUnique({
                where: { handle },
                select: { id: true },
            });
            if (!creator) {
                return NextResponse.json({ error: "Creator not found" }, { status: 404 });
            }
            creatorId = creator.id;
        } else {
            const session = await getServerSession(authOptions);
            if (!session?.user?.email) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const creator = await prisma.creatorProfile.findFirst({
                where: { user: { email: session.user.email } },
                select: { id: true },
            });
            if (!creator) {
                return NextResponse.json({ error: "Creator not found" }, { status: 404 });
            }
            creatorId = creator.id;
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where: { creatorId },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
            },
        });

        return NextResponse.json({ plans });
    } catch (error) {
        console.error("Error fetching subscription plans:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
