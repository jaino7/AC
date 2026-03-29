"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import { useHandlePath } from "@/lib/hooks/use-custom-domain";

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

export default function ContentDetailPage() {
    const params = useParams();
    const handle = params.handle as string;
    const id = params.id as string;
    const { path } = useHandlePath(handle);
    const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);
    const [subscribeError, setSubscribeError] = useState<string | null>(null);
    const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
    const [showPurchaseConfirmModal, setShowPurchaseConfirmModal] = useState(false);
    const [showSubscribeConfirmModal, setShowSubscribeConfirmModal] = useState(false);
    const [userCredits, setUserCredits] = useState<number>(0);
    const [creditInfo, setCreditInfo] = useState<{
        currentCredits: number;
        requiredAmount: number;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [localIsSaved, setLocalIsSaved] = useState<boolean | null>(null);
    const [showCopied, setShowCopied] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["content-detail", handle, id],
        queryFn: async () => {
            const response = await fetch(`/api/posts/${id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch content");
            }
            const data = await response.json();
            if (localIsSaved === null) {
                setLocalIsSaved(data.isSaved || false);
            }
            return data;
        },
    });

    const handleSavePost = async () => {
        if (isSaving || !data?.isLoggedIn) return;
        setIsSaving(true);
        try {
            const response = await fetch("/api/fans/content/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId: id, handle }),
            });
            if (response.ok) {
                const result = await response.json();
                setLocalIsSaved(result.isSaved);
            }
        } catch (error) {
            console.error("Failed to save post", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleShowPurchaseModal = async () => {
        // Fetch user's current credits
        try {
            const response = await fetch(`/api/fans/credits?handle=${handle}`);
            if (response.ok) {
                const data = await response.json();
                setUserCredits(data.credits || 0);
                setShowPurchaseConfirmModal(true);
            } else {
                setPurchaseError("クレジット情報の取得に失敗しました");
            }
        } catch (error) {
            console.error("Error fetching credits:", error);
            setPurchaseError("クレジット情報の取得に失敗しました");
        }
    };

    const handleShowSubscribeModal = async () => {
        // Fetch user's current credits
        try {
            const response = await fetch(`/api/fans/credits?handle=${handle}`);
            if (response.ok) {
                const data = await response.json();
                setUserCredits(data.credits || 0);
                setShowSubscribeConfirmModal(true);
            } else {
                setSubscribeError("クレジット情報の取得に失敗しました");
            }
        } catch (error) {
            console.error("Error fetching credits:", error);
            setSubscribeError("クレジット情報の取得に失敗しました");
        }
    };

    const handleSubscribe = async () => {
        if (isSubscribing || !data?.post?.requiredPlan) return;

        setIsSubscribing(true);
        setSubscribeError(null);
        setShowSubscribeConfirmModal(false);

        try {
            const response = await fetch("/api/fans/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ planId: data.post.requiredPlan.id }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Subscribe failed:", result);
                if (result.shortage) {
                    // Show insufficient credits modal
                    setCreditInfo({
                        currentCredits: result.currentCredits,
                        requiredAmount: result.requiredAmount,
                    });
                    setShowInsufficientCreditsModal(true);
                } else {
                    setSubscribeError(result.error || "プラン登録に失敗しました");
                }
                return;
            }

            // Subscribe successful - refetch the content to update access
            await refetch();
        } catch (error) {
            console.error("Subscribe error:", error);
            setSubscribeError("プラン登録中にエラーが発生しました");
        } finally {
            setIsSubscribing(false);
        }
    };

    const handlePurchase = async () => {
        if (isPurchasing) return;

        setIsPurchasing(true);
        setPurchaseError(null);
        setShowPurchaseConfirmModal(false);

        try {
            const response = await fetch("/api/fans/content/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ contentId: id }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Purchase failed:", result);
                if (result.shortage) {
                    // Show insufficient credits modal
                    setCreditInfo({
                        currentCredits: result.currentCredits,
                        requiredAmount: result.requiredAmount,
                    });
                    setShowInsufficientCreditsModal(true);
                } else {
                    setPurchaseError(result.error || "購入に失敗しました");
                }
                return;
            }

            // Purchase successful - refetch the content to update access
            await refetch();
        } catch (error) {
            console.error("Purchase error:", error);
            setPurchaseError("購入処理中にエラーが発生しました");
        } finally {
            setIsPurchasing(false);
        }
    };

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
    const isLoggedIn: boolean = data.isLoggedIn || false;
    const sampleImages = sampleMedia.filter((m) => m.type === "IMAGE").map((m) => ({ src: m.url, alt: "Sample" }));
    const mainImages = mainMedia.filter((m) => m.type === "IMAGE").map((m) => ({ src: m.url, alt: "Content" }));

    return (
        <div className="min-h-screen bg-white">
            {/* ヘッダー */}
            <header className="border-b border-neutral-200 px-6 py-4">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href={path("/content")}
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        一覧に戻る
                    </Link>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-neutral-500">{creator.displayName}</p>
                            <h1 className="text-3xl font-bold text-neutral-900 mt-1">{post.title}</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    const shareUrl = `${window.location.origin}/${handle}/content/${id}`;
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({ title: post.title, url: shareUrl });
                                        } catch {}
                                    } else {
                                        await navigator.clipboard.writeText(shareUrl);
                                        setShowCopied(true);
                                        setTimeout(() => setShowCopied(false), 2000);
                                    }
                                }}
                                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                {showCopied ? "コピーしました！" : "共有"}
                            </button>
                            {isLoggedIn && (
                                <button
                                    onClick={handleSavePost}
                                    disabled={isSaving}
                                    className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${localIsSaved
                                        ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
                                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                                        }`}
                                >
                                    <svg
                                        className={`h-4 w-4 ${localIsSaved ? "fill-current" : ""}`}
                                        fill={localIsSaved ? "currentColor" : "none"}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={localIsSaved ? 1 : 2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                    {localIsSaved ? "保存済み" : "保存する"}
                                </button>
                            )}
                        </div>
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
                                        <ImageLightbox
                                            src={sampleMedia[selectedSampleIndex].url}
                                            alt={`Sample ${selectedSampleIndex + 1}`}
                                            className="w-full aspect-video object-contain bg-neutral-50"
                                            images={sampleImages}
                                            currentIndex={sampleImages.findIndex((img) => img.src === sampleMedia[selectedSampleIndex].url)}
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
                                            ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                    </svg>
                                                    {post.price.toLocaleString()}で本編を購入できます
                                                </span>
                                            )
                                            : "本編を視聴するにはアクセス権が必要です"}
                                </p>
                                {!isLoggedIn ? (
                                    <a
                                        href={path("/login")}
                                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-semibold text-white hover:from-amber-600 hover:to-orange-600 transition"
                                    >
                                        ログインして本編を見る
                                    </a>
                                ) : post.requiredPlan ? (
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleShowSubscribeModal}
                                            disabled={isSubscribing}
                                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-semibold text-white hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubscribing ? (
                                                <>
                                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    登録中...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                    </svg>
                                                    <span className="inline-flex items-center gap-1">
                                                        {post.requiredPlan.name}プランに加入（月額
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                        </svg>
                                                        {post.requiredPlan.price.toLocaleString()}）
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        {subscribeError && (
                                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                                                {subscribeError}
                                            </div>
                                        )}
                                    </div>
                                ) : post.price ? (
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleShowPurchaseModal}
                                            disabled={isPurchasing}
                                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-semibold text-white hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isPurchasing ? (
                                                <>
                                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    購入処理中...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                    </svg>
                                                    {post.price.toLocaleString()}で購入
                                                </>
                                            )}
                                        </button>
                                        {purchaseError && (
                                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                                                {purchaseError}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* 本編メディア（アクセス権がある場合） */}
                        {mainMedia.length > 0 && hasAccess && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-neutral-900">
                                    本編コンテンツ
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
                                                <ImageLightbox
                                                    src={media.url}
                                                    alt={`Content ${index + 1}`}
                                                    className="w-full object-contain bg-neutral-50"
                                                    images={mainImages}
                                                    currentIndex={mainImages.findIndex((img) => img.src === media.url)}
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

            {/* Purchase Confirmation Modal */}
            {showPurchaseConfirmModal && post.price && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">購入確認</h2>

                        <div className="space-y-4 mb-6">
                            <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">コンテンツ</span>
                                    <span className="font-medium text-gray-900">{post.title}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">現在のクレジット</span>
                                        <span className="font-semibold text-gray-900 inline-flex items-center gap-1">
                                            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            {userCredits.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-2">
                                        <span className="text-gray-600">消費クレジット</span>
                                        <span className="font-semibold text-red-600 inline-flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            - {post.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">残りのクレジット</span>
                                        <span className="text-lg font-bold text-blue-600 inline-flex items-center gap-1">
                                            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            {(userCredits - post.price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 text-center">
                                このコンテンツを購入しますか？
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowPurchaseConfirmModal(false)}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handlePurchase}
                                disabled={isPurchasing}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPurchasing ? "購入中..." : "購入する"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscribe Confirmation Modal */}
            {showSubscribeConfirmModal && post.requiredPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">プラン登録確認</h2>

                        <div className="space-y-4 mb-6">
                            <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">プラン</span>
                                    <span className="font-medium text-gray-900">{post.requiredPlan.name}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">現在のクレジット</span>
                                        <span className="font-semibold text-gray-900 inline-flex items-center gap-1">
                                            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            {userCredits.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-2">
                                        <span className="text-gray-600">月額料金</span>
                                        <span className="font-semibold text-red-600 inline-flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            - {post.requiredPlan.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">残りのクレジット</span>
                                        <span className="text-lg font-bold text-blue-600 inline-flex items-center gap-1">
                                            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                            </svg>
                                            {(userCredits - post.requiredPlan.price).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 text-center">
                                このプランに登録しますか？<br />
                                <span className="text-xs text-gray-500">毎月自動的にクレジットが消費されます</span>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSubscribeConfirmModal(false)}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSubscribe}
                                disabled={isSubscribing}
                                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubscribing ? "登録中..." : "登録する"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Insufficient Credits Modal */}
            {creditInfo && (
                <InsufficientCreditsModal
                    isOpen={showInsufficientCreditsModal}
                    onClose={() => setShowInsufficientCreditsModal(false)}
                    currentCredits={creditInfo.currentCredits}
                    requiredAmount={creditInfo.requiredAmount}
                    handle={handle}
                    contentTitle={post.title}
                />
            )}
        </div>
    );
}
