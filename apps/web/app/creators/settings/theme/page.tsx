import { ThemeSelector } from "@/components/ThemeSelector";
import { ThemeCustomizerWrapper } from "@/components/ThemeCustomizerWrapper";
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

    // Get creator profile with theme
    const creatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId: user.id },
        select: {
            theme: true,
            themeConfig: true,
        },
    });

    if (!creatorProfile) {
        redirect("/creators/signup");
    }

    const currentTheme = creatorProfile.theme || "creator-pro";
    const currentThemeConfig = creatorProfile.themeConfig as any; // TODO: Type properly

    // Debug: Log the current theme
    console.log("[Theme Settings] Current theme from DB:", creatorProfile.theme);
    console.log("[Theme Settings] Final currentTheme:", currentTheme);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-semibold">テーマ設定</h1>
                <p className="mt-2 text-gray-600">
                    サイトのデザインを選択してください。変更は即座に反映されます。
                </p>
            </header>

            {/* デバッグ情報 */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <p className="font-semibold text-yellow-900">デバッグ情報:</p>
                <p className="text-yellow-800">データベースから取得したテーマ: {creatorProfile.theme || "(null)"}</p>
                <p className="text-yellow-800">最終的なcurrentTheme: {currentTheme}</p>
            </div>

            {/* テーマ選択 */}
            <ThemeSelector currentTheme={currentTheme} />

            {/* 高度なカスタマイズ */}
            <div className="mt-12">
                <h2 className="mb-6 text-2xl font-semibold">高度なカスタマイズ</h2>
                <ThemeCustomizerWrapper
                    theme={currentTheme}
                    initialConfig={currentThemeConfig}
                />
            </div>
        </div>
    );
}
