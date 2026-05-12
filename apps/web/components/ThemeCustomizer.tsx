"use client";

import { useEffect, useState } from "react";
import { ThemeConfig, brandThemeOverrideCSS, getThemeConfig } from "@/lib/theme-config";

interface ThemeCustomizerProps {
    theme: string;
    initialConfig?: Partial<ThemeConfig>;
    onSave: (config: ThemeConfig) => Promise<void>;
}

const colorFields: Array<{ key: keyof ThemeConfig["colors"]; label: string; help: string }> = [
    { key: "primary", label: "メインカラー", help: "主要ボタンや強いCTAに使います" },
    { key: "accent", label: "アクセントカラー", help: "リンク、ラベル、強調表示に使います" },
    { key: "background", label: "背景色", help: "サイト全体のベース色です" },
    { key: "text", label: "文字色", help: "本文と見出しの基本色です" },
];

const fontOptions = [
    { value: "Inter, sans-serif", label: "Inter / モダン" },
    { value: "Roboto, sans-serif", label: "Roboto / ニュートラル" },
    { value: "Outfit, sans-serif", label: "Outfit / 個性的" },
    { value: "Noto Sans JP, sans-serif", label: "Noto Sans JP / 日本語重視" },
    { value: "Playfair Display, serif", label: "Playfair / 上品" },
    { value: "Merriweather, serif", label: "Merriweather / 読み物向け" },
];

const buttonRadiusOptions = [
    { value: "6px", label: "シャープ" },
    { value: "12px", label: "標準" },
    { value: "20px", label: "やわらかい" },
    { value: "999px", label: "丸い" },
];

const cardRadiusOptions = [
    { value: "6px", label: "シャープ" },
    { value: "10px", label: "控えめ" },
    { value: "16px", label: "標準" },
    { value: "24px", label: "大きめ" },
];

const spacingOptions = [
    { value: "0.75rem", label: "コンパクト" },
    { value: "1rem", label: "標準" },
    { value: "1.25rem", label: "ゆったり" },
    { value: "1.5rem", label: "広め" },
];

const patternOptions: Array<{ value: ThemeConfig["background"]["pattern"]; label: string }> = [
    { value: "none", label: "なし" },
    { value: "dots", label: "ドット" },
    { value: "grid", label: "グリッド" },
    { value: "diagonal", label: "斜線" },
    { value: "soft", label: "ソフト光彩" },
];

export function ThemeCustomizer({ theme, initialConfig, onSave }: ThemeCustomizerProps) {
    const [config, setConfig] = useState<ThemeConfig>(() => getThemeConfig(theme, initialConfig));
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const style = document.createElement("style");
        style.id = "theme-customizer-preview";
        style.textContent = brandThemeOverrideCSS(config);
        document.head.appendChild(style);

        return () => {
            style.remove();
        };
    }, [config]);

    const handleColorChange = (key: keyof ThemeConfig["colors"], value: string) => {
        setConfig((prev) => ({
            ...prev,
            colors: { ...prev.colors, [key]: value },
        }));
    };

    const handleFontChange = (key: keyof ThemeConfig["fonts"], value: string) => {
        setConfig((prev) => ({
            ...prev,
            fonts: { ...prev.fonts, [key]: value },
        }));
    };

    const handleBackgroundChange = <K extends keyof ThemeConfig["background"]>(
        key: K,
        value: ThemeConfig["background"][K],
    ) => {
        setConfig((prev) => ({
            ...prev,
            background: { ...prev.background, [key]: value },
        }));
    };

    const handleAppearanceChange = <K extends keyof ThemeConfig["appearance"]>(
        key: K,
        value: ThemeConfig["appearance"][K],
    ) => {
        setConfig((prev) => ({
            ...prev,
            appearance: { ...prev.appearance, [key]: value },
            layout: key === "spacing" ? { ...prev.layout, spacing: value } : prev.layout,
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await onSave(config);
            setMessage("ブランドデザインを保存しました。");
        } catch (error) {
            setMessage("保存に失敗しました。時間をおいて再度お試しください。");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-neutral-700">
                    {message}
                </div>
            )}

            <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-neutral-950">カラー</h2>
                    <p className="mt-1 text-sm text-neutral-600">ブランドの印象と購入導線に使う基本色です。</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    {colorFields.map(({ key, label, help }) => (
                        <div key={key}>
                            <label className="mb-2 block text-sm font-medium text-neutral-800">{label}</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={config.colors[key]}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="h-11 w-16 cursor-pointer rounded-md border border-neutral-300 bg-white"
                                />
                                <input
                                    type="text"
                                    value={config.colors[key]}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm"
                                    placeholder="#000000"
                                />
                            </div>
                            <p className="mt-1 text-xs text-neutral-500">{help}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-neutral-950">背景</h2>
                    <p className="mt-1 text-sm text-neutral-600">背景色に加えて、画像URLや控えめなパターンを設定できます。</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-800">背景画像URL</label>
                        <input
                            type="url"
                            value={config.background.imageUrl}
                            onChange={(e) => handleBackgroundChange("imageUrl", e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                            placeholder="https://example.com/background.jpg"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-800">背景パターン</label>
                        <select
                            value={config.background.pattern}
                            onChange={(e) => handleBackgroundChange("pattern", e.target.value as ThemeConfig["background"]["pattern"])}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        >
                            {patternOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-neutral-950">フォントと形</h2>
                    <p className="mt-1 text-sm text-neutral-600">文字の雰囲気、ボタン形状、カード角丸、余白感を調整します。</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-800">見出しフォント</label>
                        <select
                            value={config.fonts.heading}
                            onChange={(e) => handleFontChange("heading", e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        >
                            {fontOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-800">本文フォント</label>
                        <select
                            value={config.fonts.body}
                            onChange={(e) => handleFontChange("body", e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        >
                            {fontOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-800">ボタン形状</label>
                        <select
                            value={config.appearance.buttonRadius}
                            onChange={(e) => handleAppearanceChange("buttonRadius", e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        >
                            {buttonRadiusOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-800">カード角丸</label>
                        <select
                            value={config.appearance.cardRadius}
                            onChange={(e) => handleAppearanceChange("cardRadius", e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        >
                            {cardRadiusOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-neutral-800">余白感</label>
                        <select
                            value={config.appearance.spacing}
                            onChange={(e) => handleAppearanceChange("spacing", e.target.value)}
                            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        >
                            {spacingOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-neutral-950">プレビュー</h2>
                    <p className="mt-1 text-sm text-neutral-600">保存前に雰囲気を確認できます。</p>
                </div>
                <div data-brand-theme className="overflow-hidden rounded-lg border border-black/10 p-6">
                    <div className="mx-auto max-w-3xl space-y-5">
                        <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>Creator Site</p>
                            <h3 className="mt-2 text-3xl font-bold">あなたの世界観を伝えるトップ</h3>
                            <p className="mt-2 max-w-xl text-sm opacity-75">
                                カラー、背景、フォント、ボタン、カードの見た目がファン向けページに反映されます。
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="border border-black/10 bg-white/80 p-5 shadow-sm">
                                <h4 className="font-semibold">メンバー限定コンテンツ</h4>
                                <p className="mt-2 text-sm opacity-70">カード角丸と余白感のサンプルです。</p>
                            </div>
                            <div className="border border-black/10 bg-white/80 p-5 shadow-sm">
                                <h4 className="font-semibold">おすすめプラン</h4>
                                <button
                                    type="button"
                                    className="mt-4 px-5 py-2 text-sm font-semibold text-white"
                                    style={{ backgroundColor: "var(--color-primary)" }}
                                >
                                    加入する
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
                >
                    {isSaving ? "保存中..." : "ブランドデザインを保存"}
                </button>
            </div>
        </div>
    );
}
