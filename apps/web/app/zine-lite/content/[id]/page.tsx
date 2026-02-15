"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useCredits, useInvalidateCredits } from "@/components/hooks/useCredits";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";

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
    isLocked: boolean;
    price: number | null;
    createdAt: string;
    media: Media[];
    requiredPlan: Plan | null;
}

interface Creator {
    id: string;
    handle: string;
    displayName: string;
    bio: string | null;
    theme: string;
}

export default function ZineLiteContentDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
    const [showInsufficientModal, setShowInsufficientModal] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { data: creditsData } = useCredits();
    const invalidateCredits = useInvalidateCredits();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["content-detail", "zine-lite", id],
        queryFn: async () => {
            const response = await fetch(`/api/posts/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch content");
            }
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-neutral-500">読み込み中...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-neutral-500">コンテンツが見つかりません</p>
            </div>
        );
    }

    const post: Post = data.post;
    const creator: Creator = data.post.creator;
    const sampleMedia = post.media.filter((m) => m.isSample);
    const mainMedia = post.media.filter((m) => !m.isSample);
    const hasAccess: boolean = data.hasAccess || false;

    const handlePurchase = async () => {
        if (!post?.price) return;
        const currentCredits = creditsData?.credits || 0;
        if (currentCredits < post.price) {
            setShowInsufficientModal(true);
            return;
        }
        setIsPurchasing(true);
        try {
            const response = await fetch("/api/fans/content/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId: post.id }),
            });
            if (response.ok) {
                invalidateCredits();
                await refetch();
            } else {
                const error = await response.json();
                if (error.shortage) {
                    setShowInsufficientModal(true);
                } else {
                    alert(error.error || "購入に失敗しました");
                }
            }
        } catch (error) {
            console.error("Purchase error:", error);
            alert("購入処理に失敗しました");
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* ヘッダー */}
            <header className="border-b border-neutral-200 px-6 py-4">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/zine-lite/content"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        一覧に戻る
                    </Link>
                    <div className="mt-4">
                        <p className="text-sm text-neutral-500">{creator.displayName}</p>
                        <h1 className="text-3xl font-bold text-neutral-900 mt-1">{post.title}</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
                    {/* メインエリア */}
                    <div className="space-y-6">
                        {/* サンプルメディア */}
                        {sampleMedia.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-neutral-900">
                                        プレビュー（無料サンプル）
                                    </h2>
                                    {sampleMedia.length > 1 && (
                                        <p className="text-sm text-neutral-500">
                                            {selectedSampleIndex + 1} / {sampleMedia.length}
                                        </p>
                                    )}
                                </div>

                                {/* メディア表示 */}
                                <div className="rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                                    {sampleMedia[selectedSampleIndex].type === "VIDEO" ? (
                                        <video
                                            src={sampleMedia[selectedSampleIndex].url}
                                            controls
                                            className="w-full aspect-video object-contain bg-black"
                                        />
                                    ) : (
                                        <img
                                            src={sampleMedia[selectedSampleIndex].url}
                                            alt={`Sample ${selectedSampleIndex + 1}`}
                                            className="w-full aspect-video object-contain bg-neutral-50"
                                        />
                                    )}
                                </div>

                                {/* サムネイル選択 */}
                                {sampleMedia.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {sampleMedia.map((media, index) => (
                                            <button
                                                key={media.id}
                                                onClick={() => setSelectedSampleIndex(index)}
                                                className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition ${selectedSampleIndex === index
                                                    ? "border-blue-500"
                                                    : "border-neutral-200 hover:border-neutral-300"
                                                    }`}
                                            >
                                                {media.type === "VIDEO" ? (
                                                    <video src={media.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={media.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 本編アクセスCTA */}
                        {mainMedia.length > 0 && !hasAccess && (
                            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                                    <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                                    本編を視聴するには
                                </h3>
                                <p className="text-neutral-600 mb-6">
                                    {post.requiredPlan
                                        ? `${post.requiredPlan.name}プランに加入すると本編を視聴できます`
                                        : post.price
                                            ? `¥${post.price.toLocaleString()}で本編を購入できます`
                                            : "本編を視聴するにはアクセス権が必要です"}
                                </p>
                                {post.requiredPlan ? (
                                    <Link
                                        href="/zine-lite/content"
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-semibold text-white hover:from-amber-600 hover:to-orange-600 transition"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                        </svg>
                                        {post.requiredPlan.name}プランに加入（月額¥{post.requiredPlan.price.toLocaleString()}）
                                    </Link>
                                ) : post.price ? (
                                    <button
                                        onClick={handlePurchase}
                                        disabled={isPurchasing}
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-semibold text-white hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                        </svg>
                                        {isPurchasing ? "処理中..." : `¥${post.price.toLocaleString()}で購入`}
                                    </button>
                                ) : null}
                            </div>
                        )}

                        {/* 本編メディア（アクセス権がある場合） */}
                        {mainMedia.length > 0 && hasAccess && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-neutral-900">
                                    本編コンテンツ（{mainMedia.length}ファイル）
                                </h2>
                                <div className="grid gap-4">
                                    {mainMedia.map((media, index) => (
                                        <div key={media.id} className="rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                                            {media.type === "VIDEO" ? (
                                                <video
                                                    src={media.url}
                                                    controls
                                                    className="w-full aspect-video object-contain bg-black"
                                                />
                                            ) : (
                                                <img
                                                    src={media.url}
                                                    alt={`Content ${index + 1}`}
                                                    className="w-full object-contain bg-neutral-50"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 説明文 */}
                        {post.content && (
                            <div className="prose prose-neutral max-w-none">
                                <p className="text-neutral-700 whitespace-pre-wrap">{post.content}</p>
                            </div>
                        )}
                    </div>

                    {/* サイドバー */}
                    <aside className="space-y-6">

                        {/* 投稿情報 */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">

                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-neutral-500">公開日</dt>
                                    <dd className="text-neutral-900 font-medium">
                                        {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </dd>
                                </div>
                                {(() => {
                                    const allMedia = [...sampleMedia, ...mainMedia];
                                    const images = allMedia.filter(m => m.type === "IMAGE");
                                    return images.length > 0 && (
                                        <div>
                                            <dt className="text-neutral-500">画像</dt>
                                            <dd className="text-neutral-900 font-medium">{images.length}枚</dd>
                                        </div>
                                    );
                                })()}
                            </dl>
                        </div>
                    </aside>
                </div>
            </main>

            <InsufficientCreditsModal
                isOpen={showInsufficientModal}
                onClose={() => setShowInsufficientModal(false)}
                currentCredits={creditsData?.credits || 0}
                requiredAmount={post?.price || 0}
                contentTitle={post?.title}
            />
        </div>
    );
}
