"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Sample data - in a real app this would come from an API
const contentData: Record<string, { title: string; description: string; cover: string; type: "free" | "fan"; likes: number }> = {
    "1": {
        title: "新作フォトセット",
        description: "最新のフォトセッションから厳選した写真をお届けします。撮影の舞台裏や制作過程の詳細も含まれています。",
        cover: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
        type: "free",
        likes: 234
    },
    "2": {
        title: "舞台裏ビデオ",
        description: "撮影現場の舞台裏をビデオでお届けします。普段見ることのできない貴重なシーンが満載です。",
        cover: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80",
        type: "fan",
        likes: 567
    },
    "3": {
        title: "限定アップデート",
        description: "最新の活動報告とこれからの予定をお知らせします。ファンの皆さまへ特別なメッセージも含まれています。",
        cover: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
        type: "free",
        likes: 189
    },
    "4": {
        title: "プロジェクト公開",
        description: "秘密のプロジェクトの全貌を公開します。これまでの準備過程と今後の展開について詳しく紹介します。",
        cover: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
        type: "fan",
        likes: 412
    },
    "5": {
        title: "最新アート作品",
        description: "新しく制作したアート作品を紹介します。制作意図やインスピレーションの源についても語ります。",
        cover: "https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=1200&q=80",
        type: "free",
        likes: 98
    },
    "6": {
        title: "一日の様子",
        description: "クリエイターの一日を追ったドキュメンタリー形式のコンテンツです。日常の様子をお届けします。",
        cover: "https://images.unsplash.com/photo-1500534310680-2ed1fc4e052f?auto=format&fit=crop&w=1200&q=80",
        type: "fan",
        likes: 782
    }
};

// Related content suggestions
const relatedContent = [
    {
        id: "3",
        title: "限定アップデート",
        cover: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=60"
    },
    {
        id: "5",
        title: "最新アート作品",
        cover: "https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=600&q=60"
    },
    {
        id: "2",
        title: "舞台裏ビデオ",
        cover: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=60"
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
            <div className="min-h-screen bg-[#f4f4f6] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-[#1f1f22]">コンテンツが見つかりません</p>
                    <Link href="/pure-lite/content" className="mt-4 inline-block text-[#7c5dfa] hover:underline">
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
        <div className="min-h-screen bg-[#f4f4f6]">
            <div className="mx-auto w-full max-w-4xl px-4 py-10">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-sm text-[#6c6c78] transition hover:text-[#7c5dfa]"
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
                <div className="overflow-hidden rounded-[28px] border border-black/5 shadow-md">
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
                            <h1 className="text-3xl font-semibold text-[#1f1f22]">{content.title}</h1>
                            <span
                                className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${content.type === "free"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-purple-100 text-purple-700"
                                    }`}
                            >
                                {content.type === "free" ? "無料" : "ファンプラン"}
                            </span>
                        </div>

                        {/* Like Button */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 rounded-full border px-6 py-3 font-semibold transition ${liked
                                    ? "border-[#7c5dfa] bg-[#7c5dfa] text-white"
                                    : "border-black/10 bg-white text-[#6c6c78] hover:border-[#7c5dfa]/50 hover:bg-[#f3f3f5]"
                                }`}
                        >
                            <span className="text-xl">{liked ? "❤️" : "♡"}</span>
                            <span>{likeCount}</span>
                        </button>
                    </div>

                    {/* Description */}
                    <p className="mt-6 text-lg leading-relaxed text-[#6c6c78]">
                        {content.description}
                    </p>
                </div>

                {/* Related Content */}
                <div className="mt-16">
                    <h2 className="text-xl font-semibold text-[#1f1f22]">関連コンテンツ</h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-3">
                        {relatedContent.map((item) => (
                            <Link
                                key={item.id}
                                href={`/pure-lite/content/${item.id}`}
                                className="group"
                            >
                                <div className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-sm transition hover:shadow-md">
                                    <img
                                        src={item.cover}
                                        alt={item.title}
                                        className="h-40 w-full object-cover transition group-hover:scale-105"
                                    />
                                    <p className="p-3 text-sm text-[#6c6c78]">{item.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-8 text-xs text-[#8b8b96]">
                    <p>©CocoBa</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-[#7c5dfa]">
                            利用規約
                        </a>
                        <a href="#" className="hover:text-[#7c5dfa]">
                            プライバシーポリシー
                        </a>
                        <a href="#" className="hover:text-[#7c5dfa]">
                            特定商取引法に基づく表記
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
}
