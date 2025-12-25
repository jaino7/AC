import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { theme, themeConfig } = body;

        if (!theme) {
            return new NextResponse("Theme is required", { status: 400 });
        }

        // themeConfigのバリデーション（オプション）
        const updateData: any = { theme };
        if (themeConfig) {
            updateData.themeConfig = themeConfig;
        }

        const updated = await prisma.creatorProfile.update({
            where: { userId: session.user.id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update theme:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
