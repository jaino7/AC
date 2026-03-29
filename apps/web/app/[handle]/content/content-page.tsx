"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useHandlePath } from "@/lib/hooks/use-custom-domain";

// テーマに応じたスタイルマッピング
const themeStyles: Record<string, {
    bg: string;
    card: string;
    text: string;
    subtext: string;
    accent: string;
    button: string;
    cardHover: string;
}> = {
    "neon-pro": {
        bg: "bg-[#041024]",
        card: "bg-[#0a1a3a]/80 border-cyan-500/20",
        text: "text-white",
        subtext: "text-white/60",
        accent: "text-cyan-400",
        button: "bg-cyan-400 text-[#041024] hover:bg-cyan-300",
        cardHover: "hover:border-cyan-400/50"
    },
    "pure-lite": {
        bg: "bg-gradient-to-br from-pink-50 to-white",
        card: "bg-white border-pink-200",
        text: "text-gray-800",
        subtext: "text-gray-500",
        accent: "text-pink-500",
        button: "bg-pink-500 text-white hover:bg-pink-600",
        cardHover: "hover:border-pink-400"
    },
    "zine-lite": {
        bg: "bg-gradient-to-br from-emerald-50 to-white",
        card: "bg-white border-emerald-200",
        text: "text-gray-800",
        subtext: "text-gray-500",
        accent: "text-emerald-500",
        button: "bg-emerald-500 text-white hover:bg-emerald-600",
        cardHover: "hover:border-emerald-400"
    },
    "creator-pro": {
        bg: "bg-gradient-to-br from-slate-900 to-slate-800",
        card: "bg-slate-800/80 border-cyan-500/30",
        text: "text-white",
        subtext: "text-slate-400",
        accent: "text-cyan-400",
        button: "bg-cyan-500 text-slate-900 hover:bg-cyan-400",
        cardHover: "hover:border-cyan-400/50"
    },
    "velvet-pro": {
        bg: "bg-gradient-to-br from-amber-50 to-white",
        card: "bg-white border-amber-200",
        text: "text-gray-800",
        subtext: "text-gray-500",
        accent: "text-amber-600",
        button: "bg-amber-500 text-white hover:bg-amber-600",
        cardHover: "hover:border-amber-400"
    },
    "studio-pro": {
        bg: "bg-gradient-to-br from-slate-100 to-white",
        card: "bg-white border-blue-200",
        text: "text-gray-800",
        subtext: "text-gray-500",
        accent: "text-blue-600",
        button: "bg-blue-600 text-white hover:bg-blue-700",
        cardHover: "hover:border-blue-400"
    }
};

interface Creator {
    id: string;
    handle: string;
    displayName: string;
    bio: string | null;
    theme: string;
    logoUrl: string | null;
    twitterUrl: string | null;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    discordUrl: string | null;
    otherUrl: string | null;
    otherUrlName?: string | null;
}

interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number;
}

interface Media {
    id: string;
    url: string;
    type: string;
    isSample: boolean;
}

interface Post {
    id: string;
    title: string;
    content: string | null;
    thumbnailUrl: string | null;
    price: number | null;
    createdAt: string;
    requiredPlan: { id: string; name: string } | null;
    media?: Media[];
}

interface ContentPageProps {
    creator: Creator;
    plans: Plan[];
    posts: Post[];
}

export function ContentPage({ creator, plans, posts }: ContentPageProps) {
    const styles = themeStyles[creator.theme] || themeStyles["creator-pro"];
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<string>("all");
    const { path } = useHandlePath(creator.handle);

    const filteredPosts = activeTab === "all"
        ? posts
        : posts.filter(post => post.requiredPlan?.id === activeTab);

    return (
        <div className={`min-h-screen ${styles.bg}`}>
            {/* ヘッダー/プロフィール */}
            <header className="border-b border-white/10 px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center gap-6">
                        {creator.logoUrl ? (
                            <img
                                src={creator.logoUrl}
                                alt={creator.displayName}
                                className="h-24 w-24 rounded-full object-cover border-4 border-white/20"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-3xl font-bold text-white">
                                {creator.displayName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className={`text-3xl font-bold ${styles.text}`}>
                                {creator.displayName}
                            </h1>
                            <p className={`mt-1 ${styles.subtext}`}>@{creator.handle}</p>
                            {creator.bio && (
                                <p className={`mt-2 max-w-xl ${styles.subtext}`}>{creator.bio}</p>
                            )}

                            {/* ソーシャルリンク */}
                            <div className="mt-4 flex gap-3">
                                {creator.twitterUrl && (
                                    <a href={creator.twitterUrl} target="_blank" rel="noopener noreferrer" className={`${styles.accent} hover:opacity-80`}>
                                        𝕏
                                    </a>
                                )}
                                {creator.instagramUrl && (
                                    <a href={creator.instagramUrl} target="_blank" rel="noopener noreferrer" className={`${styles.accent} hover:opacity-80`}>
                                        📷
                                    </a>
                                )}
                                {creator.tiktokUrl && (
                                    <a href={creator.tiktokUrl} target="_blank" rel="noopener noreferrer" className={`${styles.accent} hover:opacity-80`}>
                                        🎵
                                    </a>
                                )}
                                {creator.discordUrl && (
                                    <a href={creator.discordUrl} target="_blank" rel="noopener noreferrer" className={`${styles.accent} hover:opacity-80`}>
                                        💬
                                    </a>
                                )}
                                {creator.otherUrl && (
                                    <a href={creator.otherUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 ${styles.accent} hover:opacity-80`}>
                                        <span>🔗</span>
                                        <span className="text-sm border-b border-transparent hover:border-current leading-none whitespace-nowrap">{creator.otherUrlName || "リンク"}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ログイン/登録ボタン（未ログイン時） */}
                    {!session && (
                        <div className="mt-6 flex gap-3">
                            <Link
                                href={path("/login")}
                                className={`rounded-full px-6 py-2 text-sm font-semibold ${styles.button}`}
                            >
                                ログイン
                            </Link>
                            <Link
                                href={path("/signup")}
                                className={`rounded-full border border-white/20 px-6 py-2 text-sm font-semibold ${styles.text} hover:bg-white/5`}
                            >
                                新規登録
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* プラン一覧 */}
            {plans.length > 0 && (
                <section className="border-b border-white/10 px-4 py-8">
                    <div className="mx-auto max-w-4xl">
                        <h2 className={`mb-4 text-xl font-bold ${styles.text}`}>サポートプラン</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`rounded-2xl border p-6 ${styles.card} ${styles.cardHover} transition`}
                                >
                                    <h3 className={`text-lg font-bold ${styles.text}`}>{plan.name}</h3>
                                    <p className={`mt-1 ${styles.subtext}`}>{plan.description}</p>
                                    <p className={`mt-4 text-2xl font-bold ${styles.accent}`}>
                                        ¥{plan.price.toLocaleString()}<span className="text-sm font-normal">/月</span>
                                    </p>
                                    <button className={`mt-4 w-full rounded-full py-2 text-sm font-semibold ${styles.button}`}>
                                        加入する
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* タブメニュー */}
            <div className="border-b border-white/10 px-4">
                <div className="mx-auto max-w-4xl">
                    <nav className="flex gap-4 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-semibold transition ${activeTab === "all"
                                ? `${styles.accent} border-current`
                                : `${styles.subtext} border-transparent hover:border-white/20`
                                }`}
                        >
                            すべて
                        </button>
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setActiveTab(plan.id)}
                                className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-semibold transition ${activeTab === plan.id
                                    ? `${styles.accent} border-current`
                                    : `${styles.subtext} border-transparent hover:border-white/20`
                                    }`}
                            >
                                {plan.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* コンテンツ一覧 */}
            <main className="px-4 py-8">
                <div className="mx-auto max-w-4xl">
                    {filteredPosts.length === 0 ? (
                        <p className={`text-center py-12 ${styles.subtext}`}>
                            まだコンテンツがありません
                        </p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={path(`/content/${post.id}`)}
                                    className={`group rounded-2xl border overflow-hidden ${styles.card} ${styles.cardHover} transition`}
                                >
                                    {post.thumbnailUrl ? (
                                        <div className="relative aspect-video bg-black/20">
                                            <img
                                                src={post.thumbnailUrl}
                                                alt={post.title}
                                                className="h-full w-full object-cover group-hover:scale-105 transition"
                                            />
                                            {/* メディア情報バッジ */}
                                            {post.media && (() => {
                                                const mainMedia = post.media.filter(m => !m.isSample);
                                                const videos = mainMedia.filter(m => m.type === "VIDEO");
                                                const images = mainMedia.filter(m => m.type === "IMAGE");

                                                if (mainMedia.length === 0) return null;

                                                return (
                                                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                                                        {videos.length > 0 && (
                                                            <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                                </svg>
                                                                {videos.length}
                                                            </div>
                                                        )}
                                                        {images.length > 0 && (
                                                            <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                                </svg>
                                                                {images.length}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className={`aspect-video flex items-center justify-center ${styles.bg}`}>
                                            <span className="text-4xl">📹</span>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className={`font-semibold line-clamp-2 ${styles.text}`}>
                                            {post.title}
                                        </h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            {post.requiredPlan && (
                                                <span className={`text-xs ${styles.accent}`}>
                                                    {post.requiredPlan.name}限定
                                                </span>
                                            )}
                                            {post.price && post.price > 0 && (
                                                <span className={`text-sm font-bold ${styles.accent}`}>
                                                    ¥{post.price.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`mt-2 text-xs ${styles.subtext}`}>
                                            {new Date(post.createdAt).toLocaleDateString("ja-JP")}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
