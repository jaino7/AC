import BrandAssetsSettings from "@/components/BrandAssetsSettings";
import { ThemeCustomizerWrapper } from "@/components/ThemeCustomizerWrapper";
import { ThemeSelector } from "@/components/ThemeSelector";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ThemeSettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    if (!user) {
        redirect("/creators/login");
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId: user.id },
        select: {
            id: true,
            displayName: true,
            theme: true,
            themeConfig: true,
            logoUrl: true,
            faviconUrl: true,
            creatorSubscription: {
                select: {
                    plan: { select: { type: true } },
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
    const showNameInHeader = currentThemeConfig?.showNameInHeader !== false;

    const creatorPlanType = (
        creatorProfile.creatorSubscription?.status === "ACTIVE"
            ? creatorProfile.creatorSubscription.plan.type
            : "FREE"
    ) as "FREE" | "LITE" | "BUSINESS";

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-semibold">ブランドデザイン</h1>
                <p className="mt-2 text-gray-600">
                    テーマ選択に加えて、サイト名、ロゴ、カラー、背景、フォント、角丸、余白を調整できます。
                </p>
            </header>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-950">ブランド基本設定</h2>
                    <p className="mt-1 text-sm text-neutral-600">サイト名、ロゴ、ファビコンを管理します。</p>
                </div>
                <BrandAssetsSettings
                    creatorId={creatorProfile.id}
                    initialDisplayName={creatorProfile.displayName}
                    initialLogoUrl={creatorProfile.logoUrl}
                    initialFaviconUrl={creatorProfile.faviconUrl}
                    initialShowNameInHeader={showNameInHeader}
                    showAvatar={false}
                />
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-950">テーマを選ぶ</h2>
                    <p className="mt-1 text-sm text-neutral-600">ベースになるレイアウトと雰囲気を選択します。</p>
                </div>
                <ThemeSelector currentTheme={currentTheme} creatorPlanType={creatorPlanType} />
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-neutral-950">見た目をカスタマイズ</h2>
                    <p className="mt-1 text-sm text-neutral-600">選択したテーマの上から、ブランドらしい見た目に調整します。</p>
                </div>
                <ThemeCustomizerWrapper theme={currentTheme} initialConfig={currentThemeConfig} />
            </section>
        </div>
    );
}
