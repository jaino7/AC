import { prisma } from "@creator/shared";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { handle: string } }
) {
    try {
        const creator = await prisma.creatorProfile.findUnique({
            where: { handle: params.handle },
            select: { theme: true }
        });

        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        // キャッシュを完全に無効化
        return NextResponse.json(
            { theme: creator.theme },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
    } catch (error) {
        console.error("Error fetching theme:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
