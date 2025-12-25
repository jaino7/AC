"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Sample data - in a real app this would come from an API
const contentData: Record<string, { title: string; description: string; cover: string; type: "free" | "fan"; likes: number }> = {
    "1": {
        title: "最新ビデオログ #03",
        description: "今回は最新のビデオログをお届けします。撮影の舞台裏や制作過程を詳しく紹介しています。ぜひご覧ください！",
        cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
        type: "free",
        likes: 234
    },
    "2": {
        title: "舞台裏フォトセット",
        description: "撮影現場の舞台裏をフォトセットでお届けします。普段見ることのできない貴重なショットばかりです。",
        cover: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
        type: "fan",
        likes: 567
    },
    "3": {
        title: "限定配信アーカイブ",
        description: "過去の限定配信のアーカイブです。見逃した方もこちらでご視聴いただけます。",
        cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
        type: "free",
        likes: 189
    },
    "4": {
        title: "スペシャルQ&Aセッション",
        description: "ファンの皆さまからの質問にお答えするスペシャルQ&Aセッションです。様々な質問にお答えしています！",
        cover: "https://images.unsplash.com/photo-1475139744895-2d4dbd74c3e0?auto=format&fit=crop&w=1200&q=80",
        type: "fan",
        likes: 412
    },
    "5": {
        title: "月間レポートビデオ",
        description: "今月の活動をまとめたレポートビデオです。イベントやコラボレーションの様子をご紹介します。",
        cover: "https://images.unsplash.com/photo-1469478714370-89768c73a8e0?auto=format&fit=crop&w=1200&q=80",
        type: "free",
        likes: 98
    },
    "6": {
        title: "未公開シーン集",
        description: "これまで公開されていなかった未公開シーンをまとめました。ファンプラン限定のコンテンツです。",
        cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        type: "fan",
        likes: 782
    }
};

// Related content suggestions
const relatedContent = [
    {
        id: "3",
        title: "限定配信アーカイブ",
        cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=60"
    },
    {
        id: "5",
        title: "月間レポートビデオ",
        cover: "https://images.unsplash.com/photo-1469478714370-89768c73a8e0?auto=format&fit=crop&w=600&q=60"
    },
    {
        id: "2",
        title: "舞台裏フォトセット",
        cover: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=60"
    }
];

export default function ContentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const content = contentData[id];

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(content?.likes || 0);

    if (!content) {
        return (
            <div className="min-h-screen bg-[#030506] text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl">コンテンツが見つかりません</p>
                    <Link href="/neon-pro/content" className="mt-4 inline-block text-teal-400 hover:underline">
                        コンテンツ一覧に戻る
                    </Link>
                </div>
            </div>
        );
    }

    const handleLike = () => {
        if (liked) {
            setLiked(false);
            setLikeCount(likeCount - 1);
        } else {
            setLiked(true);
            setLikeCount(likeCount + 1);
        }
    };

    return (
        <div className="min-h-screen bg-[#030506] text-white">
            <div className="mx-auto w-full max-w-4xl px-4 py-10">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-sm text-white/70 transition hover:text-teal-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    戻る
                </button>

                {/* Content Image */}
                <div className="overflow-hidden rounded-3xl">
                    <img
                        src={content.cover}
                        alt={content.title}
                        className="h-96 w-full object-cover"
                    />
                </div>

                {/* Content Info */}
                <div className="mt-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-semibold">{content.title}</h1>
                            <span
                                className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${content.type === "free"
                                        ? "bg-teal-400/20 text-teal-300"
                                        : "bg-purple-400/20 text-purple-300"
                                    }`}
                            >
                                {content.type === "free" ? "無料" : "ファンプラン"}
                            </span>
                        </div>

                        {/* Like Button */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 rounded-2xl border px-6 py-3 font-semibold transition ${liked
                                    ? "border-teal-400 bg-teal-400 text-black"
                                    : "border-white/20 bg-white/5 text-white/80 hover:border-teal-400/50 hover:bg-white/10"
                                }`}
                        >
                            <span className="text-xl">{liked ? "❤️" : "♡"}</span>
                            <span>{likeCount}</span>
                        </button>
                    </div>

                    {/* Description */}
                    <p className="mt-6 text-lg leading-relaxed text-white/80">
                        {content.description}
                    </p>
                </div>

                {/* Related Content */}
                <div className="mt-16">
                    <h2 className="text-xl font-semibold">関連コンテンツ</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                        {relatedContent.map((item) => (
                            <Link
                                key={item.id}
                                href={`/neon-pro/content/${item.id}`}
                                className="group"
                            >
                                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070b0f] transition hover:border-teal-400/60">
                                    <img
                                        src={item.cover}
                                        alt={item.title}
                                        className="h-40 w-full object-cover transition group-hover:scale-105"
                                    />
                                    <p className="p-3 text-sm text-white/80">{item.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/60">
                    <p>©CocoBa</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-teal-300">
                            利用規約
                        </a>
                        <a href="#" className="hover:text-teal-300">
                            プライバシーポリシー
                        </a>
                        <a href="#" className="hover:text-teal-300">
                            特定商取引法に基づく表記
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
