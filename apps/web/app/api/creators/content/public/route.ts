import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";

// GET - Get PUBLIC posts by creator handle
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const handle = searchParams.get("handle");

        if (!handle) {
            return NextResponse.json(
                { error: "Handle parameter is required" },
                { status: 400 }
            );
        }

        // Find creator by handle
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { handle },
            select: { id: true },
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: "Creator not found" },
                { status: 404 }
            );
        }

        // Fetch PUBLIC posts only
        const posts = await prisma.post.findMany({
            where: {
                creatorId: creatorProfile.id,
                visibility: "PUBLIC",
            },
            include: {
                folder: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tags: {
                    select: {
                        tagId: true,
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                requiredPlan: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Error fetching public posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch public posts" },
            { status: 500 }
        );
    }
}
