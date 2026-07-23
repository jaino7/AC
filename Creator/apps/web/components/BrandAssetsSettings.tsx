"use client";

import { useState } from "react";

interface BrandAssetsSettingsProps {
    creatorId: string;
    initialDisplayName?: string;
    initialAvatarUrl?: string | null;
    initialLogoUrl?: string | null;
    initialFaviconUrl?: string | null;
    initialShowNameInHeader?: boolean;
    showAvatar?: boolean;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function assetSrc(url: string | null) {
    if (!url) return null;
    return url.startsWith("http") ? url : `${apiBaseUrl}${url}`;
}

export default function BrandAssetsSettings({
    creatorId,
    initialDisplayName = "",
    initialAvatarUrl,
    initialLogoUrl,
    initialFaviconUrl,
    initialShowNameInHeader = true,
    showAvatar = true,
}: BrandAssetsSettingsProps) {
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [savedDisplayName, setSavedDisplayName] = useState(initialDisplayName);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(initialFaviconUrl || null);
    const [showNameInHeader, setShowNameInHeader] = useState(initialShowNameInHeader);
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingName, setIsSavingName] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileUpload = async (file: File, type: "avatar" | "logo" | "favicon") => {
        setIsUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${apiBaseUrl}/creators/brand-assets/upload?creatorId=${creatorId}&type=${type}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(error?.message || "アップロードに失敗しました。");
            }

            const data = await response.json();

            if (type === "avatar") setAvatarUrl(data.url);
            if (type === "logo") setLogoUrl(data.url);
            if (type === "favicon") setFaviconUrl(data.url);

            setMessage("画像を更新しました。");
        } catch (error) {
            console.error("Upload error:", error);
            setMessage(error instanceof Error ? error.message : "アップロードに失敗しました。");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (type: "avatar" | "logo" | "favicon") => {
        const label = type === "avatar" ? "プロフィール画像" : type === "logo" ? "ロゴ" : "ファビコン";
        if (!confirm(`${label}を削除しますか？`)) return;

        setMessage(null);
        try {
            const response = await fetch(`${apiBaseUrl}/creators/brand-assets?creatorId=${creatorId}&type=${type}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("削除に失敗しました。");
            }

            if (type === "avatar") setAvatarUrl(null);
            if (type === "logo") setLogoUrl(null);
            if (type === "favicon") setFaviconUrl(null);

            setMessage(`${label}を削除しました。`);
        } catch (error) {
            console.error("Delete error:", error);
            setMessage(error instanceof Error ? error.message : "削除に失敗しました。");
        }
    };

    const handleSaveDisplayName = async () => {
        const nextName = displayName.trim();
        if (!nextName) {
            setMessage("サイト名を入力してください。");
            return;
        }

        setIsSavingName(true);
        setMessage(null);
        try {
            const response = await fetch("/api/creators/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ displayName: nextName }),
            });

            if (!response.ok) throw new Error("サイト名の保存に失敗しました。");

            setSavedDisplayName(nextName);
            setMessage("サイト名を保存しました。");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "サイト名の保存に失敗しました。");
        } finally {
            setIsSavingName(false);
        }
    };

    const handleToggleShowName = async (value: boolean) => {
        setShowNameInHeader(value);
        setMessage(null);
        try {
            const response = await fetch("/api/creators/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ showNameInHeader: value }),
            });
            if (!response.ok) throw new Error("表示設定の保存に失敗しました。");
        } catch (error) {
            setShowNameInHeader(!value);
            setMessage(error instanceof Error ? error.message : "表示設定の保存に失敗しました。");
        }
    };

    const uploadControl = (type: "avatar" | "logo" | "favicon", label: string, accept: string) => (
        <div>
            <label
                htmlFor={`${type}-upload`}
                className="inline-block cursor-pointer rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
                {isUploading ? "アップロード中..." : `${label}をアップロード`}
            </label>
            <input
                id={`${type}-upload`}
                type="file"
                accept={accept}
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, type);
                }}
            />
        </div>
    );

    return (
        <div className="space-y-6">
            {message && (
                <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-neutral-700">
                    {message}
                </div>
            )}

            <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-neutral-950">サイト名</h2>
                    <p className="mt-1 text-sm text-neutral-600">ブラウザタイトル、ヘッダー、OGPのブランド名として使われます。</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
                        placeholder="サイト名"
                    />
                    <button
                        type="button"
                        onClick={handleSaveDisplayName}
                        disabled={isSavingName || displayName.trim() === savedDisplayName}
                        className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
                    >
                        {isSavingName ? "保存中..." : "保存"}
                    </button>
                </div>
            </section>

            {showAvatar && (
                <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold text-neutral-950">プロフィール画像</h2>
                        <p className="mt-1 text-sm text-neutral-600">クリエイタープロフィールで使う正方形画像です。推奨: 400x400px。</p>
                    </div>
                    <AssetPreview
                        url={avatarUrl}
                        label="現在のプロフィール画像"
                        imageClassName="h-20 w-20 rounded-full object-cover"
                        onDelete={() => handleDelete("avatar")}
                    />
                    {uploadControl("avatar", "プロフィール画像", "image/*")}
                </section>
            )}

            <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-neutral-950">ロゴ</h2>
                    <p className="mt-1 text-sm text-neutral-600">ファン向けサイトのヘッダーに表示されます。横長ロゴも使えます。</p>
                </div>
                <AssetPreview
                    url={logoUrl}
                    label="現在のロゴ"
                    imageClassName="h-16 max-w-[180px] rounded-md object-contain"
                    onDelete={() => handleDelete("logo")}
                />
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {uploadControl("logo", "ロゴ", "image/*")}
                    <button
                        type="button"
                        onClick={() => handleToggleShowName(!showNameInHeader)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showNameInHeader ? "bg-neutral-950" : "bg-neutral-300"}`}
                        aria-pressed={showNameInHeader}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showNameInHeader ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                </div>
                <p className="mt-2 text-xs text-neutral-500">オンにするとロゴの横にサイト名も表示します。</p>
            </section>

            <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-neutral-950">ファビコン</h2>
                    <p className="mt-1 text-sm text-neutral-600">ブラウザタブに表示される小さなアイコンです。推奨: 32x32px。</p>
                </div>
                <AssetPreview
                    url={faviconUrl}
                    label="現在のファビコン"
                    imageClassName="h-10 w-10 rounded-md object-contain"
                    onDelete={() => handleDelete("favicon")}
                />
                {uploadControl("favicon", "ファビコン", "image/*,.ico")}
            </section>
        </div>
    );
}

function AssetPreview({
    url,
    label,
    imageClassName,
    onDelete,
}: {
    url: string | null;
    label: string;
    imageClassName: string;
    onDelete: () => void;
}) {
    if (!url) return null;

    return (
        <div className="mb-4 flex items-center gap-4 rounded-lg border border-black/10 bg-neutral-50 p-4">
            <div className="flex h-20 w-24 items-center justify-center rounded-md bg-white">
                <img src={assetSrc(url) ?? ""} alt={label} className={imageClassName} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900">{label}</p>
                <p className="truncate text-xs text-neutral-500">{url}</p>
            </div>
            <button
                type="button"
                onClick={onDelete}
                className="text-sm font-semibold text-red-600 transition hover:text-red-700"
            >
                削除
            </button>
        </div>
    );
}
