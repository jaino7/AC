"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCredits, useInvalidateCredits } from "@/components/hooks/useCredits";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";

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

type Post = {
    id: string;
    title: string;
    content: string | null;
    thumbnailUrl: string | null;
    mediaUrl: string | null;
    isLocked: boolean;
    visibility: string;
    price: number | null;
    publishedAt: string;
    creator: {
        id: string;
        handle: string;
        displayName: string;
        logoUrl: string | null;
    };
    requiredPlan: {
        id: string;
        name: string;
        price: number;
    } | null;
    media: {
        id: string;
        url: string;
        type: string;
        isSample?: boolean;
    }[];
};

export default function ContentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const handle = searchParams.get("handle");

    const [post, setPost] = useState<Post | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);

    // クレジット情報を取得
    const { data: creditsData } = useCredits(handle || undefined);
    const invalidateCredits = useInvalidateCredits();

    const postId = params.id as string;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`/api/posts/${postId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPost(data.post);
                    setHasAccess(data.hasAccess);
                } else {
                    console.error("Failed to fetch post");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    // 購入処理
    const handlePurchase = async () => {
        if (!post?.price) {
            alert("この投稿には価格が設定されていません");
            return;
        }

        const currentCredits = creditsData?.credits || 0;

        // クレジット不足チェック
        if (currentCredits < post.price) {
            setShowInsufficientModal(true);
            return;
        }

        setIsPurchasing(true);

        try {
            const response = await fetch("/api/fans/content/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contentId: post.id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // 購入成功
                setHasAccess(true);
                // クレジット情報を更新
                invalidateCredits(handle || undefined);
                alert("購入が完了しました");
            } else {
                const error = await response.json();
                if (error.shortage) {
                    // クレジット不足エラー
                    setShowInsufficientModal(true);
                } else {
                    alert(error.error || "購入に失敗しました");
                }
            }
        } catch (error) {
            alert("購入処理に失敗しました");
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-white"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">投稿が見つかりません</h1>
                    <button
                        onClick={() => router.push(`/creator-pro/content${handle ? `?handle=${handle}` : ""}`)}
                        className="mt-4 text-blue-400 hover:text-blue-300"
                    >
                        一覧に戻る
                    </button>
                </div>
            </div>
        );
    }

    // サンプルメディアと本編メディアを分離
    const sampleMedia = post.media?.filter(m => m.isSample) || [];
    const mainMedia = post.media?.filter(m => !m.isSample) || [];

    // 表示するメディアを決定（アクセス権がある場合は本編、ない場合はサンプルまたはサムネイル）
    const displayMedia = hasAccess && mainMedia.length > 0
        ? mainMedia
        : sampleMedia.length > 0
            ? sampleMedia
            : [];

    const primaryMedia = displayMedia[0] || { url: post.mediaUrl || post.thumbnailUrl, type: post.mediaUrl ? "VIDEO" : "IMAGE" };
    const isVideo = primaryMedia?.type === "VIDEO";

    // 動画のMIMEタイプを取得
    const getVideoMimeType = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'mkv': 'video/x-matroska',
            'mov': 'video/quicktime',
            'avi': 'video/x-msvideo',
        };
        return mimeTypes[ext || ''] || 'video/mp4';
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-white">
            <header className="border-b border-gray-800 bg-[#0d1117] px-6 py-4">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                    <Link href={`/creator-pro/content${handle ? `?handle=${handle}` : ""}`} className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-white">
                            {post.creator.logoUrl ? (
                                <img src={post.creator.logoUrl} alt="Logo" className="h-full w-full rounded object-cover" />
                            ) : (
                                post.creator.displayName?.charAt(0) || "C"
                            )}
                        </div>
                        <span className="text-lg font-semibold">{post.creator.displayName}</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
                            ログイン
                        </button>
                        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                            新規登録
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-4xl px-4 py-10 lg:px-6">
                <button
                    onClick={() => router.push(`/creator-pro/content${handle ? `?handle=${handle}` : ""}`)}
                    className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                >
                    <span>←</span>
                    <span>一覧に戻る</span>
                </button>

                <div className="space-y-6">
                    {/* Media Content */}
                    <div className="relative overflow-hidden rounded-xl bg-black">
                        {hasAccess ? (
                            <>
                                {isVideo && primaryMedia?.url ? (
                                    <video
                                        controls
                                        preload="metadata"
                                        playsInline
                                        className="w-full"
                                        style={{ maxHeight: "600px" }}
                                        poster={post.thumbnailUrl || undefined}
                                        key={primaryMedia.url}
                                    >
                                        <source src={primaryMedia.url} type={getVideoMimeType(primaryMedia.url)} />
                                        お使いのブラウザは動画の再生に対応していません。
                                    </video>
                                ) : (
                                    <img
                                        src={primaryMedia?.url || post.thumbnailUrl || "/placeholder.jpg"}
                                        alt={post.title}
                                        className="w-full object-cover"
                                        style={{ maxHeight: "600px" }}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <img
                                    src={post.thumbnailUrl || "/placeholder.jpg"}
                                    alt={post.title}
                                    className="w-full object-cover blur-sm"
                                    style={{ maxHeight: "600px" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
                                    <div className="text-center">
                                        <LockIcon className="mx-auto mb-4 h-16 w-16" />
                                        <p className="mb-4 text-xl font-semibold">このコンテンツはロックされています</p>
                                        {post.requiredPlan ? (
                                            <button className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700">
                                                {post.requiredPlan.name} (¥{post.requiredPlan.price}/月) に登録
                                            </button>
                                        ) : post.price ? (
                                            <button
                                                onClick={handlePurchase}
                                                disabled={isPurchasing}
                                                className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                            >
                                                {isPurchasing ? "処理中..." : `¥${post.price}で購入`}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Post Info */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">{post.title}</h1>
                                <p className="mt-2 text-sm text-gray-400">
                                    {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
                                </p>
                            </div>

                            <button
                                onClick={() => setLiked(!liked)}
                                className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${liked
                                    ? "border-pink-400/50 bg-pink-400/10 text-pink-400"
                                    : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:bg-gray-800"
                                    }`}
                            >
                                <HeartIcon filled={liked} className="h-5 w-5" />
                                <span className="font-semibold">いいね</span>
                            </button>
                        </div>

                        {post.content && (
                            <p className="text-lg text-gray-300 whitespace-pre-wrap">{post.content}</p>
                        )}

                        <div className="flex items-center gap-4">
                            <span
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${post.isLocked
                                    ? "bg-blue-400/20 text-blue-300"
                                    : "bg-green-400/20 text-green-300"
                                    }`}
                            >
                                {post.isLocked ? (post.requiredPlan ? post.requiredPlan.name : "有料") : "無料"}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* クレジット不足モーダル */}
            <InsufficientCreditsModal
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                currentCredits={creditsData?.credits || 0}
                requiredAmount={post?.price || 0}
                handle={handle || undefined}
                contentTitle={post?.title}
            />
        </div>
    );
}
