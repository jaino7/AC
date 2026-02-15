import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { theme, themeConfig } = body;

        // Get user ID from session
        const userId = (session.user as any).id as string;

        if (!theme) {
            return new NextResponse("Theme is required", { status: 400 });
        }

        // themeConfigのバリデーション（オプション）
        const updateData: any = { theme };
        if (themeConfig) {
            updateData.themeConfig = themeConfig;
        }

        // 現在のテーマを取得
        const currentProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { theme: true }
        });

        console.log("=== Theme Update Debug ===");
        console.log("User ID:", userId);
        console.log("Current theme:", currentProfile?.theme);
        console.log("New theme:", theme);

        const updated = await prisma.creatorProfile.update({
            where: { userId },
            data: updateData,
        });

        console.log("Updated theme:", updated.theme);
        console.log("Update successful");

        // Get creator handle to revalidate fan pages
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { handle: true }
        });

        // Revalidate all theme-related paths
        revalidatePath("/creators/settings/theme");
        revalidatePath("/creators/[handle]/settings/theme", "page");

        // Revalidate fan-facing pages if handle exists
        if (creatorProfile?.handle) {
            const handle = creatorProfile.handle;
            revalidatePath(`/${handle}`, 'layout'); // レイアウト全体を再検証
            revalidatePath(`/${handle}/content`, 'page');
            revalidatePath(`/${handle}/login`, 'page');

            // ルートパス自体も念のため（middlewareによる書き換えがあるため）
            revalidatePath('/', 'layout');
        }

        console.log("Cache invalidated");

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update theme:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
