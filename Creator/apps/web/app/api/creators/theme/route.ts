import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Pro系テーマのリスト
const PRO_THEMES = ["creator-pro", "neon-pro", "studio-pro", "velvet-pro"];

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

        // プラン制限チェック: Pro系テーマの場合、Lite以上のプランが必要
        if (PRO_THEMES.includes(theme)) {
            const creatorProfile = await prisma.creatorProfile.findUnique({
                where: { userId },
                select: {
                    creatorSubscription: {
                        select: {
                            plan: { select: { type: true } },
                            status: true,
                        },
                    },
                },
            });

            const planType = creatorProfile?.creatorSubscription?.status === "ACTIVE"
                ? creatorProfile.creatorSubscription.plan.type
                : "FREE";

            if (planType === "FREE") {
                return new NextResponse(
                    "Proテーマを使用するにはLiteプラン以上へのアップグレードが必要です",
                    { status: 403 }
                );
            }
        }

        const updated = await prisma.creatorProfile.update({
            where: { userId },
            data: updateData,
        });

        // Get creator handle to revalidate fan pages
        const creatorForRevalidation = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { handle: true }
        });

        // Revalidate all theme-related paths
        revalidatePath("/creators/settings/theme");
        revalidatePath("/creators/[handle]/settings/theme", "page");

        // Revalidate fan-facing pages if handle exists
        if (creatorForRevalidation?.handle) {
            const handle = creatorForRevalidation.handle;
            revalidatePath(`/${handle}`, 'layout'); // レイアウト全体を再検証
            revalidatePath(`/${handle}/content`, 'page');
            revalidatePath(`/${handle}/login`, 'page');

            // ルートパス自体も念のため（middlewareによる書き換えがあるため）
            revalidatePath('/', 'layout');
        }

        console.log("Cache invalidated");

        return NextResponse.json({ theme: updated.theme });
    } catch (error) {
        console.error("Failed to update theme:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
