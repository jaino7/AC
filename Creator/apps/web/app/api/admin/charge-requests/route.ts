import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

// GET - Get all charge requests (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "認証が必要です" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true },
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "管理者権限が必要です" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        // Build where clause
        const where: any = {};
        if (status && status !== "all") {
            where.status = status.toUpperCase();
        }

        // Get charge requests
        const chargeRequests = await prisma.chargeRequest.findMany({
            where,
            include: {
                fan: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({
            chargeRequests
        });
    } catch (error) {
        console.error("Error fetching charge requests:", error);
        return NextResponse.json(
            { error: "チャージ申請の取得に失敗しました" },
            { status: 500 }
        );
    }
}
