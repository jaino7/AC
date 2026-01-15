"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const THEMES = [
    { id: "creator-pro", name: "Creator Pro", description: "洗練されたダークテーマ", color: "bg-gradient-to-br from-slate-900 to-slate-800", previewUrl: "/creator-pro/content" },
    { id: "neon-pro", name: "Neon Pro", description: "サイバーパンクスタイル", color: "bg-gradient-to-br from-[#041024] to-[#0a1a3a]", previewUrl: "/neon-pro/content" },
    { id: "studio-pro", name: "Studio Pro", description: "プロフェッショナル向け", color: "bg-gradient-to-br from-slate-100 to-white", previewUrl: "/studio-pro/content" },
    { id: "velvet-pro", name: "Velvet Pro", description: "エレガントなゴールドアクセント", color: "bg-gradient-to-br from-amber-50 to-white", previewUrl: "/velvet-pro/content" },
    { id: "pure-lite", name: "Pure Lite", description: "ピンク系ライトテーマ", color: "bg-gradient-to-br from-pink-50 to-white", previewUrl: "/pure-lite/content" },
    { id: "zine-lite", name: "Zine Lite", description: "フレッシュなグリーン", color: "bg-gradient-to-br from-emerald-50 to-white", previewUrl: "/zine-lite/content" },
];

interface ThemeSelectorProps {
    currentTheme: string;
}

export function ThemeSelector({ currentTheme }: ThemeSelectorProps) {
    const [activeTheme, setActiveTheme] = useState(currentTheme);
    const [previewTheme, setPreviewTheme] = useState<string | null>(null);
    const router = useRouter();

    const updateTheme = async (themeId: string) => {
        const res = await fetch("/api/creators/theme", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme: themeId }),
        });

        if (!res.ok) throw new Error("Failed to update theme");
        return themeId;
    };

    const { mutate, isPending } = useMutation({
        mutationFn: updateTheme,
        onSuccess: (themeId) => {
            setActiveTheme(themeId);
            setPreviewTheme(null);
            router.refresh();
        },
    });

    const handleCardClick = (themeId: string) => {
        // カードクリックでプレビュー選択
        setPreviewTheme(themeId);
    };

    const handleApplyTheme = () => {
        if (previewTheme && previewTheme !== activeTheme) {
            mutate(previewTheme);
        }
    };

    const selectedForPreview = previewTheme || activeTheme;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEMES.map((theme) => {
                    const isActive = activeTheme === theme.id;
                    const isPreview = previewTheme === theme.id;

                    return (
                        <div
                            key={theme.id}
                            className={`
                                relative cursor-pointer rounded-xl border-2 p-4 transition-all
                                ${isActive ? "border-green-500 ring-2 ring-green-500/20" : ""}
                                ${isPreview && !isActive ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                                ${!isActive && !isPreview ? "border-gray-200 hover:border-gray-300" : ""}
                            `}
                            onClick={() => handleCardClick(theme.id)}
                        >
                            {/* アクティブバッジ */}
                            {isActive && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    使用中
                                </div>
                            )}

                            {/* プレビュー選択バッジ */}
                            {isPreview && !isActive && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    プレビュー中
                                </div>
                            )}

                            <div className={`h-32 w-full rounded-lg mb-3 ${theme.color} flex items-center justify-center border border-black/10`}>
                                <span className="text-xs font-medium bg-black/20 text-white px-2 py-1 rounded backdrop-blur-sm">
                                    {theme.name}
                                </span>
                            </div>

                            <div>
                                <h3 className="font-medium text-gray-900">{theme.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* アクションボタン */}
            {previewTheme && previewTheme !== activeTheme && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div>
                        <p className="font-medium text-blue-900">
                            「{THEMES.find(t => t.id === previewTheme)?.name}」を選択中
                        </p>
                        <p className="text-sm text-blue-700">
                            下のプレビューで確認してから適用してください
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPreviewTheme(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleApplyTheme}
                            disabled={isPending}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isPending ? "適用中..." : "このテーマを適用"}
                        </button>
                    </div>
                </div>
            )}

            {/* Live Preview Section */}
            <div className="mt-8 border-t pt-8">
                <h2 className="text-lg font-semibold mb-4">
                    プレビュー: {THEMES.find(t => t.id === selectedForPreview)?.name}
                </h2>
                <div className="border rounded-xl overflow-hidden shadow-sm bg-gray-50">
                    <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                        </div>
                        <div className="ml-4 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500 flex-1 text-center">
                            your-site.com
                        </div>
                    </div>
                    <div className="aspect-video w-full relative">
                        <iframe
                            src={THEMES.find(t => t.id === selectedForPreview)?.previewUrl || "/creator-pro/content"}
                            className="w-full h-full"
                            title="Theme Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
