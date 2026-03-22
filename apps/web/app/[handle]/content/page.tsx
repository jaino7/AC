"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Media {
    id: string;
    url: string;
    type: string;
    isSample: boolean;
}

interface Plan {
    id: string;
    name: string;
    price: number;
}

interface Post {
    id: string;
    title: string;
    content: string | null;
    thumbnailUrl: string | null;
    mediaUrl: string | null;
    price: number | null;
    isLocked: boolean;
    createdAt: string;
    media: Media[];
    requiredPlan: Plan | null;
}

interface CreatorProfile {
    handle: string;
    displayName: string;
    bio: string | null;
    logoUrl: string | null;
    avatarUrl: string | null;
    headerUrl: string | null;
    twitterUrl: string | null;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    discordUrl: string | null;
    otherUrl: string | null;
    otherUrlName: string | null;
}

const resolveAssetUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('/uploads/')) {
        return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`;
    }
    return url;
};

const getTimeAgo = (date: Date): string => {
    const seconds = (Date.now() - date.getTime()) / 1000;
    if (seconds < 60) return Math.floor(seconds) + "秒前";
    const minutes = seconds / 60;
    if (minutes < 60) return Math.floor(minutes) + "分前";
    const hours = minutes / 60;
    if (hours < 24) return Math.floor(hours) + "時間前";
    const days = hours / 24;
    if (days < 30) return Math.floor(days) + "日前";
    const months = days / 30;
    if (months < 12) return Math.floor(months) + "ヶ月前";
    return Math.floor(months / 12) + "年前";
};

export default function ContentListPage() {
    const params = useParams();
    const handle = params.handle as string;
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
    // Fetch creator profile
    const { data: profileData } = useQuery({
        queryKey: ["creator-profile", handle],
        queryFn: async () => {
            const res = await fetch(`/api/creators/profile?handle=${handle}`);
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        },
        enabled: !!handle,
    });

    // Fetch posts
    const { data: postsData, isLoading: loadingPosts } = useQuery({
        queryKey: ["public-posts", handle],
        queryFn: async () => {
            const res = await fetch(`/api/creators/content/public?handle=${handle}`);
            if (!res.ok) throw new Error("Failed to fetch posts");
            return res.json();
        },
        enabled: !!handle,
    });

    // Fetch plans
    const { data: plansData } = useQuery({
        queryKey: ["subscription-plans", handle],
        queryFn: async () => {
            const res = await fetch(`/api/creators/subscription-plans?handle=${handle}`);
            if (!res.ok) throw new Error("Failed to fetch plans");
            return res.json();
        },
        enabled: !!handle,
    });

    // Fetch saved posts
    const { data: savedData, isLoading: loadingSaved } = useQuery({
        queryKey: ["saved-posts", handle],
        queryFn: async () => {
            const res = await fetch(`/api/fans/saved`);
            if (!res.ok) throw new Error("Failed to fetch saved");
            return res.json();
        },
        enabled: !!handle && !!session?.user && activeTab === "saved",
    });

    const creator: CreatorProfile | null = profileData?.profile || null;
    const posts: Post[] = postsData?.posts || [];
    const plans: Plan[] = plansData?.plans || [];
    const savedPosts: Post[] = savedData?.posts || [];
    const displayPosts = activeTab === "saved" ? savedPosts : posts;

    if (!handle) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-neutral-500">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* ヘッダー */}
            {creator && (
                <header className="border-b border-neutral-200">
                    {/* ヘッダー画像 */}
                    {creator.headerUrl && (
                        <div className="h-48 sm:h-64 w-full overflow-hidden">
                            <img
                                src={resolveAssetUrl(creator.headerUrl) || ""}
                                alt="Header"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}
                    <div className="mx-auto max-w-5xl px-6 py-6">
                        <div className="flex items-start gap-4">
                            {/* アバター */}
                            {creator.avatarUrl && (
                                <img
                                    src={resolveAssetUrl(creator.avatarUrl) || ""}
                                    alt={creator.displayName}
                                    className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-neutral-900">
                                    {creator.displayName}
                                </h1>
                                {creator.bio && (
                                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                                        {creator.bio}
                                    </p>
                                )}
                                {/* SNSリンク */}
                                <div className="mt-3 flex gap-3">
                                    {creator.twitterUrl && (
                                        <a href={creator.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-600">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                        </a>
                                    )}
                                    {creator.instagramUrl && (
                                        <a href={creator.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-600">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                        </a>
                                    )}
                                    {creator.tiktokUrl && (
                                        <a href={creator.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-600">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.06l-.38-.04z" /></svg>
                                        </a>
                                    )}
                                    {creator.discordUrl && (
                                        <a href={creator.discordUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-600">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" /></svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                            {/* ログイン/アカウント */}
                            <div className="flex gap-2">
                                {session?.user ? (
                                    <Link
                                        href={`/${handle}/account`}
                                        className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                                    >
                                        マイページ
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={`/${handle}/login`}
                                            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                                        >
                                            ログイン
                                        </Link>
                                        <Link
                                            href={`/${handle}/signup`}
                                            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                                        >
                                            新規登録
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* プラン表示 */}
            {plans.length > 0 && (
                <div className="mx-auto max-w-5xl px-6 py-6 border-b border-neutral-100">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="flex-shrink-0 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-3 text-center"
                            >
                                <p className="text-sm font-semibold text-neutral-900">{plan.name}</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    月額 {plan.price.toLocaleString()}クレジット
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* タブ */}
            <div className="mx-auto max-w-5xl px-6 pt-6">
                <div className="flex gap-1 border-b border-neutral-200">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "all"
                                ? "border-neutral-900 text-neutral-900"
                                : "border-transparent text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        すべて
                    </button>
                    {session?.user && (
                        <button
                            onClick={() => setActiveTab("saved")}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "saved"
                                    ? "border-neutral-900 text-neutral-900"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                            }`}
                        >
                            保存済み
                        </button>
                    )}
                </div>
            </div>

            {/* コンテンツ一覧 */}
            <main className="mx-auto max-w-5xl px-6 py-8">
                {(activeTab === "all" ? loadingPosts : loadingSaved) ? (
                    <div className="text-center py-12 text-neutral-500">読み込み中...</div>
                ) : displayPosts.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {activeTab === "saved" ? "保存済みのコンテンツはありません" : "コンテンツがまだありません"}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {displayPosts.map((post) => {
                            const coverUrl = resolveAssetUrl(post.thumbnailUrl) || resolveAssetUrl(post.mediaUrl);
                            const sampleMedia = post.media?.filter(m => m.isSample) || [];
                            const firstSample = sampleMedia[0];

                            return (
                                <Link
                                    key={post.id}
                                    href={`/${handle}/content/${post.id}`}
                                    className="group block rounded-2xl border border-neutral-200 bg-white overflow-hidden transition hover:shadow-lg"
                                >
                                    {/* サムネイル */}
                                    <div className="aspect-video overflow-hidden bg-neutral-100">
                                        {coverUrl ? (
                                            <img
                                                src={coverUrl}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition group-hover:scale-105"
                                            />
                                        ) : firstSample ? (
                                            firstSample.type === "VIDEO" ? (
                                                <video src={firstSample.url} className="h-full w-full object-cover" />
                                            ) : (
                                                <img src={firstSample.url} alt={post.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                                            )
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-neutral-300">
                                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* コンテンツ情報 */}
                                    <div className="p-4 space-y-2">
                                        <h2 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-neutral-700">
                                            {post.title}
                                        </h2>
                                        {post.content && (
                                            <p className="text-sm text-neutral-500 line-clamp-2">
                                                {post.content}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-xs text-neutral-400">
                                                {getTimeAgo(new Date(post.createdAt))}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {post.requiredPlan && (
                                                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                                        {post.requiredPlan.name}
                                                    </span>
                                                )}
                                                {post.price && !post.requiredPlan && (
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                        {post.price.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
