import { ThemeSelector } from "@/components/ThemeSelector";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";

export default async function ThemeSettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    // Get user
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) {
        redirect("/creators/login");
    }

    // Get creator profile with theme and subscription plan
    const creatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId: user.id },
        select: {
            theme: true,
            themeConfig: true,
            creatorSubscription: {
                select: {
                    plan: {
                        select: { type: true }
                    },
                    status: true,
                },
            },
        },
    });

    if (!creatorProfile) {
        redirect("/creators/signup");
    }

    const currentTheme = creatorProfile.theme || "creator-pro";
    const currentThemeConfig = creatorProfile.themeConfig as any;

    // サブスクリプションがACTIVEの場合のみプランタイプを反映
    const creatorPlanType = (
        creatorProfile.creatorSubscription?.status === "ACTIVE"
            ? creatorProfile.creatorSubscription.plan.type
            : "FREE"
    ) as "FREE" | "LITE" | "BUSINESS";

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-semibold">テーマ設定</h1>
                <p className="mt-2 text-gray-600">
                    サイトのデザインを選択してください。変更は即座に反映されます。
                </p>
            </header>

            <ThemeSelector currentTheme={currentTheme} creatorPlanType={creatorPlanType} />
        </div>
    );
}
