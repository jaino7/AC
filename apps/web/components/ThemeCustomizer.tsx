"use client";

import { useState, useEffect } from "react";
import { ThemeConfig, getThemeConfig, themeConfigToCSS } from "@/lib/theme-config";

interface ThemeCustomizerProps {
    theme: string;
    initialConfig?: Partial<ThemeConfig>;
    onSave: (config: ThemeConfig) => Promise<void>;
}

export function ThemeCustomizer({ theme, initialConfig, onSave }: ThemeCustomizerProps) {
    const [config, setConfig] = useState<ThemeConfig>(() =>
        getThemeConfig(theme, initialConfig)
    );
    const [isSaving, setIsSaving] = useState(false);

    // CSS変数を動的に適用
    useEffect(() => {
        const style = document.createElement("style");
        style.id = "theme-customizer-preview";
        style.textContent = `:root { ${themeConfigToCSS(config)} }`;
        document.head.appendChild(style);

        return () => {
            style.remove();
        };
    }, [config]);

    const handleColorChange = (key: keyof ThemeConfig["colors"], value: string) => {
        setConfig(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value }
        }));
    };

    const handleFontChange = (key: keyof ThemeConfig["fonts"], value: string) => {
        setConfig(prev => ({
            ...prev,
            fonts: { ...prev.fonts, [key]: value }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(config);
            alert("テーマ設定を保存しました");
        } catch (error) {
            alert("保存に失敗しました");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* カラー設定 */}
            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-xl font-semibold">カラー設定</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    {(Object.keys(config.colors) as Array<keyof ThemeConfig["colors"]>).map(key => (
                        <div key={key}>
                            <label className="mb-2 block text-sm font-medium capitalize">
                                {key}
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config.colors[key]}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="h-12 w-20 cursor-pointer rounded-lg border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={config.colors[key]}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* フォント設定 */}
            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-xl font-semibold">フォント設定</h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            見出しフォント
                        </label>
                        <select
                            value={config.fonts.heading}
                            onChange={(e) => handleFontChange("heading", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Outfit, sans-serif">Outfit</option>
                            <option value="Playfair Display, serif">Playfair Display</option>
                            <option value="Merriweather, serif">Merriweather</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            本文フォント
                        </label>
                        <select
                            value={config.fonts.body}
                            onChange={(e) => handleFontChange("body", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                        >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Outfit, sans-serif">Outfit</option>
                            <option value="Open Sans, sans-serif">Open Sans</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* プレビュー */}
            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
                <h3 className="mb-6 text-xl font-semibold">プレビュー</h3>
                <div
                    className="rounded-xl border-2 p-8"
                    style={{
                        backgroundColor: config.colors.background,
                        color: config.colors.text,
                        fontFamily: config.fonts.body
                    }}
                >
                    <h1
                        className="mb-4 text-4xl font-bold"
                        style={{
                            color: config.colors.primary,
                            fontFamily: config.fonts.heading
                        }}
                    >
                        サンプル見出し
                    </h1>
                    <p className="mb-4 text-lg">
                        これはプレビューです。フォントとカラーを確認できます。
                    </p>
                    <button
                        type="button"
                        className="rounded-lg px-6 py-3 font-semibold text-white transition-colors"
                        style={{ backgroundColor: config.colors.primary }}
                    >
                        サンプルボタン
                    </button>
                </div>
            </section>

            {/* 保存ボタン */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {isSaving ? "保存中..." : "テーマ設定を保存"}
                </button>
            </div>
        </div>
    );
}
