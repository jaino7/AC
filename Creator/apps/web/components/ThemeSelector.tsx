"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const THEMES = [
    {
        id: "creator-pro",
        name: "Creator Pro",
        description: "洗練されたダークトーンのプロ向けテーマ",
        color: "bg-gradient-to-br from-slate-900 to-slate-800",
        previewUrl: "/creator-pro/content",
        tier: "pro" as const,
    },
    {
        id: "neon-pro",
        name: "Neon Pro",
        description: "サイバー感のあるネオンスタイル",
        color: "bg-gradient-to-br from-[#041024] to-[#0a1a3a]",
        previewUrl: "/neon-pro/content",
        tier: "pro" as const,
    },
    {
        id: "studio-pro",
        name: "Studio Pro",
        description: "写真や作品を引き立てるスタジオスタイル",
        color: "bg-gradient-to-br from-slate-100 to-white",
        previewUrl: "/studio-pro/content",
        tier: "pro" as const,
    },
    {
        id: "velvet-pro",
        name: "Velvet Pro",
        description: "上品で落ち着いたベルベットスタイル",
        color: "bg-gradient-to-br from-amber-50 to-white",
        previewUrl: "/velvet-pro/content",
        tier: "pro" as const,
    },
    {
        id: "pure-lite",
        name: "Pure Lite",
        description: "シンプルで明るいライトテーマ",
        color: "bg-gradient-to-br from-pink-50 to-white",
        previewUrl: "/pure-lite/content",
        tier: "lite" as const,
    },
    {
        id: "zine-lite",
        name: "Zine Lite",
        description: "雑誌風のカジュアルなテーマ",
        color: "bg-gradient-to-br from-emerald-50 to-white",
        previewUrl: "/zine-lite/content",
        tier: "lite" as const,
    },
];

interface ThemeSelectorProps {
    currentTheme: string;
    creatorPlanType?: "FREE" | "LITE" | "BUSINESS";
}

export function ThemeSelector({ currentTheme, creatorPlanType = "FREE" }: ThemeSelectorProps) {
    const [activeTheme, setActiveTheme] = useState(currentTheme);
    const [previewTheme, setPreviewTheme] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    const isFreePlan = creatorPlanType === "FREE";

    const updateTheme = async (themeId: string) => {
        const res = await fetch("/api/creators/theme", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ theme: themeId }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "テーマの更新に失敗しました。");
        }
        return themeId;
    };

    const { mutate, isPending } = useMutation({
        mutationFn: updateTheme,
        onSuccess: (themeId) => {
            setActiveTheme(themeId);
            setPreviewTheme(null);
            setErrorMessage(null);
            setSuccessMessage(`${THEMES.find((theme) => theme.id === themeId)?.name} を適用しました。`);
            router.refresh();
        },
        onError: (error: Error) => {
            setErrorMessage(error.message || "テーマの更新に失敗しました。");
        },
    });

    const handleCardClick = (themeId: string) => {
        const theme = THEMES.find((item) => item.id === themeId);
        if (isFreePlan && theme?.tier === "pro") return;
        setPreviewTheme(themeId);
    };

    const handleApplyTheme = () => {
        if (previewTheme && previewTheme !== activeTheme) {
            mutate(previewTheme);
        }
    };

    const selectedForPreview = previewTheme || activeTheme;
    const selectedTheme = THEMES.find((theme) => theme.id === selectedForPreview) || THEMES[0];

    return (
        <div className="space-y-6">
            {errorMessage && (
                <div className="flex items-start justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                    <button onClick={() => setErrorMessage(null)} className="ml-4 text-xs text-red-500 hover:text-red-700">
                        閉じる
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="flex items-start justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-800">{successMessage}</p>
                    <button onClick={() => setSuccessMessage(null)} className="ml-4 text-xs text-green-600 hover:text-green-700">
                        閉じる
                    </button>
                </div>
            )}

            {isFreePlan && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                        <span className="font-semibold">Proテーマを使うにはLiteプラン以上が必要です。</span>
                        <br />
                        無料プランではLiteテーマを選択できます。
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {THEMES.map((theme) => {
                    const isActive = activeTheme === theme.id;
                    const isPreview = previewTheme === theme.id;
                    const isLocked = isFreePlan && theme.tier === "pro";

                    return (
                        <button
                            key={theme.id}
                            type="button"
                            className={`
                                relative rounded-lg border-2 p-4 text-left transition
                                ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                                ${isActive ? "border-green-500 ring-2 ring-green-500/20" : ""}
                                ${isPreview && !isActive ? "border-blue-500 ring-2 ring-blue-500/20" : ""}
                                ${!isActive && !isPreview && !isLocked ? "border-gray-200 hover:border-gray-300" : ""}
                                ${isLocked ? "border-gray-200" : ""}
                            `}
                            onClick={() => handleCardClick(theme.id)}
                            disabled={isLocked}
                        >
                            {isLocked && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-gray-600 px-2 py-1 text-xs font-bold text-white">
                                    Pro
                                </span>
                            )}

                            {isActive && !isLocked && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white">
                                    使用中
                                </span>
                            )}

                            {isPreview && !isActive && !isLocked && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                                    選択中
                                </span>
                            )}

                            <span className={`mb-3 flex h-32 w-full items-center justify-center rounded-md border border-black/10 ${theme.color}`}>
                                <span className="rounded bg-black/25 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                    {theme.name}
                                </span>
                            </span>

                            <span className="block font-medium text-gray-900">{theme.name}</span>
                            <span className="mt-1 block text-sm text-gray-500">{theme.description}</span>
                            {isLocked && (
                                <span className="mt-1 block text-xs font-medium text-amber-600">Liteプラン以上で利用可能</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {previewTheme && previewTheme !== activeTheme && (
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4 md:flex-row md:items-center">
                    <div>
                        <p className="font-medium text-blue-900">{selectedTheme.name} を選択中</p>
                        <p className="text-sm text-blue-700">プレビューを確認してから適用してください。</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => setPreviewTheme(null)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
                        >
                            キャンセル
                        </button>
                        <button
                            type="button"
                            onClick={handleApplyTheme}
                            disabled={isPending}
                            className="w-full rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
                        >
                            {isPending ? "適用中..." : "このテーマを適用"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-8 border-t pt-8">
                <h3 className="mb-4 text-lg font-semibold">プレビュー: {selectedTheme.name}</h3>
                <div className="overflow-hidden rounded-lg border bg-gray-50 shadow-sm">
                    <div className="flex items-center gap-2 border-b bg-white px-4 py-2">
                        <div className="flex gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-red-400" />
                            <div className="h-3 w-3 rounded-full bg-yellow-400" />
                            <div className="h-3 w-3 rounded-full bg-green-400" />
                        </div>
                        <div className="ml-4 flex-1 rounded bg-gray-100 px-3 py-1 text-center text-xs text-gray-500">
                            your-site.com
                        </div>
                    </div>
                    <div className="relative aspect-video w-full">
                        <iframe src={selectedTheme.previewUrl} className="h-full w-full" title="テーマプレビュー" />
                    </div>
                </div>
            </div>
        </div>
    );
}
