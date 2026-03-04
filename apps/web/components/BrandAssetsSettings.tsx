"use client";

import { useState } from "react";


interface BrandAssetsSettingsProps {
    creatorId: string;
    initialAvatarUrl?: string | null;
    initialLogoUrl?: string | null;
    initialFaviconUrl?: string | null;
    initialShowNameInHeader?: boolean;
    showAvatar?: boolean;
}

export default function BrandAssetsSettings({
    creatorId,
    initialAvatarUrl,
    initialLogoUrl,
    initialFaviconUrl,
    initialShowNameInHeader = true,
    showAvatar = true,
}: BrandAssetsSettingsProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(initialFaviconUrl || null);
    const [showNameInHeader, setShowNameInHeader] = useState(initialShowNameInHeader);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (
        file: File,
        type: "avatar" | "logo" | "favicon"
    ) => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const response = await fetch(
                `${apiUrl}/creators/brand-assets/upload?creatorId=${creatorId}&type=${type}`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "アップロードに失敗しました");
            }

            const data = await response.json();

            if (type === "avatar") {
                setAvatarUrl(data.url);
            } else if (type === "logo") {
                setLogoUrl(data.url);
            } else {
                setFaviconUrl(data.url);
            }

            alert(data.message);
        } catch (error) {
            console.error("Upload error:", error);
            alert(error instanceof Error ? error.message : "アップロードに失敗しました");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (type: "avatar" | "logo" | "favicon") => {
        const typeLabel = type === "avatar" ? "プロフィール画像" : type === "logo" ? "ロゴ" : "ファビコン";
        if (!confirm(`${typeLabel}を削除しますか？`)) {
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const response = await fetch(
                `${apiUrl}/creators/brand-assets?creatorId=${creatorId}&type=${type}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("削除に失敗しました");
            }

            const data = await response.json();

            if (type === "avatar") {
                setAvatarUrl(null);
            } else if (type === "logo") {
                setLogoUrl(null);
            } else {
                setFaviconUrl(null);
            }

            alert(data.message);
        } catch (error) {
            console.error("Delete error:", error);
            alert("削除に失敗しました");
        }
    };

    const handleToggleShowName = async (value: boolean) => {
        setShowNameInHeader(value);
        try {
            const response = await fetch("/api/creators/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ showNameInHeader: value }),
            });
            if (!response.ok) throw new Error("保存に失敗しました");
        } catch (error) {
            setShowNameInHeader(!value);
            alert("設定の保存に失敗しました");
        }
    };

    return (
        <div className="space-y-8">
            {/* プロフィール画像設定 */}
            {showAvatar && (
                <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    <h2 className="mb-2 text-2xl font-semibold">プロフィール画像</h2>
                    <p className="mb-6 text-sm text-gray-600">
                        テーマページのプロフィールセクションに表示される画像です。推奨サイズ: 400x400px
                    </p>

                    <div className="space-y-4">
                        {avatarUrl && (
                            <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${avatarUrl}`}
                                        alt="プロフィール画像プレビュー"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">現在のプロフィール画像</p>
                                    <p className="text-xs text-gray-500">{avatarUrl}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete("avatar")}
                                    className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                                >
                                    削除
                                </button>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="avatar-upload"
                                className="inline-block cursor-pointer rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                {isUploading ? "アップロード中..." : "プロフィール画像をアップロード"}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, "avatar");
                                }}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                JPG、PNG、GIF形式に対応（最大5MB）
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ロゴ設定 */}
            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <h2 className="mb-6 text-2xl font-semibold">ロゴ設定</h2>

                <div className="space-y-4">
                    {/* プレビュー */}
                    {logoUrl && (
                        <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                            <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-white">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${logoUrl}`}
                                    alt="ロゴプレビュー"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div className="flex-1"></div>
                            <button
                                onClick={() => handleDelete("logo")}
                                className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                            >
                                削除
                            </button>
                        </div>
                    )}

                    {/* アップロードフォーム */}
                    <div>
                        <label
                            htmlFor="logo-upload"
                            className="inline-block cursor-pointer rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            {isUploading ? "アップロード中..." : "ロゴをアップロード"}
                        </label>
                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFileUpload(file, "logo");
                                }
                            }}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            JPG、PNG、GIF、SVG形式に対応（最大5MB）
                        </p>
                    </div>

                    {/* サイト名表示トグル */}
                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-neutral-50 px-6 py-4">
                        <div>
                            <p className="text-sm font-semibold">ロゴの横にサイト名を表示する</p>
                            <p className="text-xs text-gray-500 mt-0.5">オフにするとロゴのみが表示されます</p>
                        </div>
                        <button
                            onClick={() => handleToggleShowName(!showNameInHeader)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showNameInHeader ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showNameInHeader ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ファビコン設定 */}
            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <h2 className="mb-2 text-2xl font-semibold">ファビコン設定</h2>
                <p className="mb-6 text-sm text-gray-600">
                    ブラウザのタブに表示されるファビコンをアップロードできます。推奨サイズ: 32x32px
                </p>

                <div className="space-y-4">
                    {/* プレビュー */}
                    {faviconUrl && (
                        <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                            <div className="relative h-8 w-8 overflow-hidden rounded bg-white">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${faviconUrl}`}
                                    alt="ファビコンプレビュー"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div className="flex-1"></div>
                            <button
                                onClick={() => handleDelete("favicon")}
                                className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                            >
                                削除
                            </button>
                        </div>
                    )}

                    {/* アップロードフォーム */}
                    <div>
                        <label
                            htmlFor="favicon-upload"
                            className="inline-block cursor-pointer rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                            {isUploading ? "アップロード中..." : "ファビコンをアップロード"}
                        </label>
                        <input
                            id="favicon-upload"
                            type="file"
                            accept="image/*,.ico"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFileUpload(file, "favicon");
                                }
                            }}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            ICO、PNG形式に対応（最大5MB）
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
