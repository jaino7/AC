"use client";

import { useState } from "react";
import Image from "next/image";

interface BrandAssetsSettingsProps {
    creatorId: string;
    initialLogoUrl?: string | null;
    initialFaviconUrl?: string | null;
}

export default function BrandAssetsSettings({
    creatorId,
    initialLogoUrl,
    initialFaviconUrl
}: BrandAssetsSettingsProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(initialFaviconUrl || null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (
        file: File,
        type: "logo" | "favicon"
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

            if (type === "logo") {
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

    const handleDelete = async (type: "logo" | "favicon") => {
        if (!confirm(`${type === "logo" ? "ロゴ" : "ファビコン"}を削除しますか？`)) {
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

            if (type === "logo") {
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

    return (
        <div className="space-y-8">
            {/* ロゴ設定 */}
            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                <h2 className="mb-2 text-2xl font-semibold">ロゴ設定</h2>
                <p className="mb-6 text-sm text-gray-600">
                    サイトに表示されるロゴ画像をアップロードできます。推奨サイズ: 200x200px
                </p>

                <div className="space-y-4">
                    {/* プレビュー */}
                    {logoUrl && (
                        <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                            <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-white">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${logoUrl}`}
                                    alt="ロゴプレビュー"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">現在のロゴ</p>
                                <p className="text-xs text-gray-500">{logoUrl}</p>
                            </div>
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
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${faviconUrl}`}
                                    alt="ファビコンプレビュー"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">現在のファビコン</p>
                                <p className="text-xs text-gray-500">{faviconUrl}</p>
                            </div>
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
