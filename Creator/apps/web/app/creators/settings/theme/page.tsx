import { ThemeSelector } from "@/components/ThemeSelector";
import { ThemeCustomizerWrapper } from "@/components/ThemeCustomizerWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ThemeSettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    // TODO: Prisma Clientの再生成後、creatorProfileから実際のテーマを取得
    // 現在はデフォルト値を使用
    const currentTheme = "creator-pro";
    const currentThemeConfig = undefined; // TODO: creator.themeConfig

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-semibold">テーマ設定</h1>
                <p className="mt-2 text-gray-600">
                    サイトのデザインを選択してください。変更は即座に反映されます。
                </p>
            </header>

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
