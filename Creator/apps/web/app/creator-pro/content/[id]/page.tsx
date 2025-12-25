"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const LockIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg
        viewBox="0 0 20 20"
        fill="none"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect
            x="3.5"
            y="8.75"
            width="13"
            height="8.75"
            rx="2"
            className="stroke-[#89a0c2]"
            strokeWidth="1.4"
        />
        <path
            d="M6.5 8.5V6.75C6.5 4.67893 8.17893 3 10.25 3C12.3211 3 14 4.67893 14 6.75V8.5"
            className="stroke-[#89a0c2]"
            strokeWidth="1.4"
            strokeLinecap="round"
        />
    </svg>
);

const HeartIcon = ({
    filled = false,
    className = "h-6 w-6"
}: {
    filled?: boolean;
    className?: string;
}) => (
    <svg
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            className="stroke-current"
            strokeWidth={filled ? "0" : "1.5"}
        />
    </svg>
);

const Badge = ({
    variant,
    children
}: {
    variant?: "new" | "tier" | "fan";
    children: React.ReactNode;
}) => {
    const palette =
        variant === "new"
            ? "bg-emerald-400/20 text-emerald-200"
            : variant === "tier"
                ? "bg-sky-400/20 text-sky-200"
                : variant === "fan"
                    ? "bg-purple-400/20 text-purple-200"
                    : "bg-white/10 text-white";

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${palette}`}
        >
            {children}
        </span>
    );
};

type ContentItem = {
    id: string;
    title: string;
    description: string;
    meta: string;
    cover: string;
    locked?: boolean;
    highlight?: "new" | "tier" | "fan";
    likes: number;
    tierLabel?: string;
    priceLabel?: string;
};

const contentItems: ContentItem[] = [
    {
        id: "summer",
        title: "Summer Beach Day!",
        description: "Sun, sea, and a brand new photo drop.",
        meta: "Images • 24 photos",
        cover:
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=60",
        highlight: "new",
        likes: 1234
    },
    {
        id: "behind-scenes",
        title: "Behind the Scenes Video",
        description: "A cinematic look at how I plan shoots.",
        meta: "Video • 6 min",
        cover:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=60",
        likes: 856
    },
    {
        id: "premium-photoset",
        title: "Locked: Premium Photoset",
        description: "High-res edits from the latest session.",
        meta: "Images • 15 photos",
        cover:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60",
        locked: true,
        priceLabel: "Unlock for ¥500",
        likes: 2103
    },
    {
        id: "gold-tier",
        title: 'Join the "Gold" Tier',
        description: "Unlock studio diaries, polls, and more.",
        meta: "Membership • Monthly",
        cover:
            "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=60",
        locked: true,
        highlight: "tier",
        tierLabel: "Gold Tier",
        likes: 567
    },
    {
        id: "art-stream",
        title: "Locked: Art Process Stream",
        description: "Replay of last week's coloring session.",
        meta: "Live Stream • 54 min",
        cover:
            "https://images.unsplash.com/photo-1464850264646-5d0a4a1edc05?auto=format&fit=crop&w=600&q=60",
        locked: true,
        priceLabel: "Unlock for ¥500",
        likes: 923
    },
    {
        id: "podcast",
        title: "Early Access Podcast Ep. 5",
        description: "Answering your latest Q&A submissions.",
        meta: "Audio • 32 min",
        cover:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=60",
        likes: 445
    },
    {
        id: "qa",
        title: "Monthly Q&A Recording",
        description: "Members-only Q&A recording archive.",
        meta: "Video • 28 min",
        cover:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=60",
        likes: 678
    },
    {
        id: "fan-gallery",
        title: "Locked: Fan-Only Gallery",
        description: "Alternate edits voted by the community.",
        meta: "Images • 18 photos",
        cover:
            "https://images.unsplash.com/photo-1433360405326-e50f909805b3?auto=format&fit=crop&w=600&q=60",
        locked: true,
        highlight: "fan",
        tierLabel: "Fan-only Access",
        likes: 1567
    },
    {
        id: "newest",
        title: "Newest Photoset",
        description: "Fresh edits landing later this week.",
        meta: "Images • Coming Soon",
        cover:
            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=60",
        locked: true,
        likes: 234
    }
];

export default function ContentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [liked, setLiked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const contentId = params.id as string;
    const content = contentItems.find((item) => item.id === contentId);

    if (!content) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050c17] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">コンテンツが見つかりません</h1>
                    <button
                        onClick={() => router.push("/creator-pro/content")}
                        className="mt-4 text-cyan-400 hover:text-cyan-300"
                    >
                        一覧に戻る
                    </button>
                </div>
            </div>
        );
    }

    const currentLikes = liked ? content.likes + 1 : content.likes;

    return (
        <div className="min-h-screen bg-[#050c17] text-white">
            <header className="border-b border-white/10 bg-[#060f1c]/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 lg:px-6">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                            <span className="grid h-8 w-8 place-items-center rounded-md bg-cyan-400 text-black">
                                L
                            </span>
                            Creator Pro
                        </div>
                        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
                            <a className="hover:text-white" href="#">
                                ホーム
                            </a>
                            <a className="hover:text-white" href="#">
                                関連まとめ
                            </a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isLoggedIn ? (
                            <>
                                <button className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/5">
                                    ログイン
                                </button>
                                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-300">
                                    新規登録
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-300">
                                    登録して視聴する
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-semibold text-black hover:opacity-90"
                                    >
                                        JP
                                    </button>
                                    {showDropdown && (
                                        <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-white/10 bg-[#060f1c] py-2 shadow-xl">
                                            <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white">
                                                設定
                                            </button>
                                            <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white">
                                                ログアウト
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-6">
                <button
                    onClick={() => router.push("/creator-pro/content")}
                    className="mb-6 flex items-center gap-2 text-sm text-white/70 hover:text-white"
                >
                    <span>←</span>
                    <span>コンテンツ一覧に戻る</span>
                </button>

                <div className="space-y-6">
                    {/* Content Image/Video */}
                    <div className="relative overflow-hidden rounded-3xl bg-black">
                        <img
                            src={content.cover}
                            alt={content.title}
                            className="w-full object-cover"
                            style={{ maxHeight: "600px" }}
                        />
                        {content.locked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
                                <div className="text-center">
                                    <LockIcon className="mx-auto mb-4 h-16 w-16" />
                                    <p className="mb-4 text-xl font-semibold">このコンテンツはロックされています</p>
                                    {content.priceLabel && (
                                        <button className="rounded-full bg-cyan-400 px-8 py-3 text-base font-semibold text-black shadow-[0_15px_40px_rgba(34,211,238,0.4)] hover:bg-cyan-300">
                                            {content.priceLabel}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {content.highlight && (
                            <div className="absolute left-6 top-6">
                                <Badge variant={content.highlight}>
                                    {content.highlight === "new"
                                        ? "NEW"
                                        : content.highlight === "tier"
                                            ? content.tierLabel ?? "Tier"
                                            : "Fan-only"}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Content Info */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/50">
                                    {content.meta}
                                </p>
                                <h1 className="text-3xl font-bold">{content.title}</h1>
                            </div>

                            <button
                                onClick={() => setLiked(!liked)}
                                className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${liked
                                        ? "border-pink-400/50 bg-pink-400/10 text-pink-400"
                                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                                    }`}
                            >
                                <HeartIcon filled={liked} className="h-5 w-5" />
                                <span className="font-semibold">{currentLikes.toLocaleString()}</span>
                            </button>
                        </div>

                        <p className="text-lg text-white/80">{content.description}</p>

                        <div className="flex items-center gap-4">
                            <span
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${content.locked
                                        ? "bg-sky-400/20 text-sky-300"
                                        : "bg-emerald-400/20 text-emerald-300"
                                    }`}
                            >
                                {content.locked ? "ファンプラン" : "無料"}
                            </span>
                        </div>
                    </div>

                    {/* Related Content Section (Optional) */}
                    <div className="mt-12 border-t border-white/10 pt-8">
                        <h2 className="mb-6 text-xl font-semibold">関連コンテンツ</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {contentItems
                                .filter((item) => item.id !== contentId)
                                .slice(0, 3)
                                .map((item) => (
                                    <a
                                        key={item.id}
                                        href={`/creator-pro/content/${item.id}`}
                                        className="group block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-400/40"
                                    >
                                        <div className="relative overflow-hidden rounded-xl">
                                            <img
                                                src={item.cover}
                                                alt={item.title}
                                                className="h-32 w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                            {item.locked && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                                            )}
                                        </div>
                                        <div className="mt-3">
                                            <p className="font-semibold text-white/90">{item.title}</p>
                                            <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                                                <span className="flex items-center gap-1">
                                                    <HeartIcon className="h-3 w-3" />
                                                    {item.likes.toLocaleString()}
                                                </span>
                                                <span className={item.locked ? "text-sky-300" : "text-emerald-300"}>
                                                    {item.locked ? "ファンプラン" : "無料"}
                                                </span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                        </div>
                    </div>
                </div>

                <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/60">
                    <p>©CocoBa</p>
                    <div className="flex items-center gap-6">
                        <a className="hover:text-white" href="#">
                            利用規約
                        </a>
                        <a className="hover:text-white" href="#">
                            プライバシーポリシー
                        </a>
                        <a className="hover:text-white" href="#">
                            特商法
                        </a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
