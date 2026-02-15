"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCredits, useInvalidateCredits } from "@/components/hooks/useCredits";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";

type Media = {
  id: string;
  url: string;
  type: string;
  isSample: boolean;
  duration: number | null;
};

type ContentCard = {
  id: string;
  title: string;
  subtitle?: string;
  cover: string | null;
  type: "free" | "velvet-elite" | "gold" | "limited" | "early-access";
  badge?: string;
  isLocked?: boolean;
  timeAgo?: string;
  unlockPrice?: number;
  price?: number | null;
  media?: Media[];
};

type CreatorProfile = {
  handle: string;
  displayName: string;
  bio: string | null;
  logoUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  discordUrl: string | null;
  otherUrl: string | null;
};

type TabType = "all" | "velvet-elite" | "gold" | "video" | "backstage";

export default function VelvetProContentPage() {
  const searchParams = useSearchParams();
  const propHandle = searchParams.get("handle") || undefined;
  const handle = propHandle;
  const isPreview = searchParams.get("preview") === "true";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [contentCards, setContentCards] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ContentCard | null>(null);

  // クレジット情報を取得
  const { data: creditsData } = useCredits(handle || undefined);
  const invalidateCredits = useInvalidateCredits();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch creator profile
        let profileResponse;
        if (handle) {
          profileResponse = await fetch(`/api/creators/profile?handle=${handle}`);
        } else {
          profileResponse = await fetch("/api/creators/profile");
        }

        if (profileResponse?.ok) {
          const profileData = await profileResponse.json();
          setCreatorProfile(profileData.profile);
        }

        // Fetch published posts
        let postsResponse;
        if (handle) {
          postsResponse = await fetch(`/api/creators/content/public?handle=${handle}`);
        } else {
          postsResponse = await fetch("/api/creators/content?visibility=PUBLIC");
        }

        if (postsResponse?.ok) {
          const postsData = await postsResponse.json();
          const posts = postsData.posts || [];

          // Transform posts to content cards
          const cards: ContentCard[] = posts.map((post: any) => {
            let type: ContentCard["type"] = "free";
            if (post.isLocked && post.requiredPlan) {
              type = post.requiredPlan.price > 2000 ? "velvet-elite" : "gold";
            }

            return {
              id: post.id,
              title: post.title,
              subtitle: post.content?.substring(0, 50) || undefined,
              cover: post.thumbnailUrl || post.mediaUrl,
              type,
              badge: post.requiredPlan?.name?.toUpperCase(),
              isLocked: post.isLocked,
              timeAgo: getTimeAgo(new Date(post.createdAt)),
              media: post.media || [],
              price: post.price,
              unlockPrice: post.price ? post.price / 100 : undefined,
            };
          });

          setContentCards(cards);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle, isPreview]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${diffDays}日前`;
  };

  // 購入処理
  const handlePurchase = async (event: React.MouseEvent, card: ContentCard) => {
    event.preventDefault();
    event.stopPropagation();

    const price = card.price || (card.unlockPrice ? card.unlockPrice * 100 : null);
    if (!price) {
      alert("この投稿には価格が設定されていません");
      return;
    }

    const currentCredits = creditsData?.credits || 0;

    // クレジット不足チェック
    if (currentCredits < price) {
      setSelectedCard(card);
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
          contentId: card.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // クレジット情報を更新
        invalidateCredits(handle || undefined);
        alert("購入が完了しました");
        // ページをリロードして購入済みコンテンツを反映
        window.location.reload();
      } else {
        const error = await response.json();
        if (error.shortage) {
          // クレジット不足エラー
          setSelectedCard(card);
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
      <div className="min-h-screen bg-gradient-to-b from-[#1a1612] via-[#2a231d] to-[#1a1612] text-white flex items-center justify-center">
        <p className="text-yellow-400">読み込み中...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1612] via-[#2a231d] to-[#1a1612] text-white">
      {/* Header */}
      <header className="border-b border-yellow-900/20 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="text-lg font-semibold">Velvet Pro</span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {!session && (
              <>
                <Link href={handle ? `/${handle}/login` : "/creators/login"} className="rounded-full border border-yellow-600/50 px-4 py-2 text-sm font-semibold text-yellow-500 transition hover:bg-yellow-600/10">
                  ログイン
                </Link>
                <Link href={handle ? `/${handle}/signup` : "/creators/signup"} className="rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:from-yellow-500 hover:to-yellow-400">
                  新規登録
                </Link>
              </>
            )}
            {session && (
              <>
                <Link href={handle ? `/${handle}/account` : "/velvet-pro/account"} className="rounded-full border border-yellow-600/50 px-4 py-2 text-sm font-semibold text-yellow-500 transition hover:bg-yellow-600/10">
                  アカウント
                </Link>
                <button onClick={() => signOut({ callbackUrl: handle ? `/${handle}/content` : "/" })} className="rounded-full border border-yellow-600/50 px-4 py-2 text-sm font-semibold text-yellow-500 transition hover:bg-yellow-600/10">
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Profile Section */}
        <section className="mb-12 text-center">
          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-600 p-1">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
                  alt="Elena D'Amara"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              {/* Verified Badge */}
              <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500">
                <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Name and Title */}
          <h1 className="mb-2 text-3xl font-semibold">{creatorProfile?.displayName || "Creator"}</h1>
          <p className="mb-4 text-sm uppercase tracking-wide text-yellow-600">ビジュアルアーティスト</p>

          {/* Bio */}
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-300">
            {creatorProfile?.bio || "クリエイターのプロフィールです"}
          </p>

          {/* Buttons */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 rounded-full bg-yellow-600 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-500">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              月額 ¥3500で登録
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-600 bg-white/5 transition hover:bg-white/10">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            </button>
          </div>

          {/* SNS Links */}
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </section>

        {/* Tabs */}
        <nav className="mb-8 flex items-center justify-center gap-3 border-b border-yellow-900/20 pb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "all"
              ? "bg-yellow-600 text-black"
              : "bg-white/5 text-gray-400 hover:text-white"
              }`}
          >
            すべて
          </button>
          <button
            onClick={() => setActiveTab("velvet-elite")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "velvet-elite"
              ? "bg-yellow-600 text-black"
              : "bg-white/5 text-gray-400 hover:text-white"
              }`}
          >
            <span className="text-yellow-600">💎</span>
            ベルベットエリート
          </button>
          <button
            onClick={() => setActiveTab("gold")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "gold"
              ? "bg-yellow-600 text-black"
              : "bg-white/5 text-gray-400 hover:text-white"
              }`}
          >
            <span className="text-yellow-500">🥇</span>
            ゴールドティア
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "video"
              ? "bg-yellow-600 text-black"
              : "bg-white/5 text-gray-400 hover:text-white"
              }`}
          >
            動画
          </button>
          <button
            onClick={() => setActiveTab("backstage")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "backstage"
              ? "bg-yellow-600 text-black"
              : "bg-white/5 text-gray-400 hover:text-white"
              }`}
          >
            バックステージ
          </button>
        </nav>

        {/* Content Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contentCards.map((card) => (
            <Link
              key={card.id}
              href={handle ? `/${handle}/content/${card.id}` : `/velvet-pro/content/${card.id}`}
              className="group"
            >
              <article className="overflow-hidden rounded-2xl bg-black/40 shadow-xl backdrop-blur transition hover:shadow-2xl hover:shadow-yellow-900/20">
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden bg-gray-900">
                  {card.cover ? (
                    <img
                      src={card.cover}
                      alt={card.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-yellow-600/30">
                      <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Badge */}
                  {card.badge && (
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold uppercase ${card.type === "velvet-elite"
                          ? "bg-yellow-600 text-black"
                          : card.type === "gold"
                            ? "bg-yellow-700 text-white"
                            : "bg-orange-600 text-white"
                          }`}
                      >
                        {card.badge}
                      </span>
                    </div>
                  )}

                  {/* Lock Overlay */}
                  {card.isLocked && !card.cover && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                      <svg className="mb-3 h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {card.subtitle && (
                        <p className="mb-3 px-4 text-center text-xs text-gray-300">
                          {card.subtitle}
                        </p>
                      )}
                      {card.unlockPrice ? (
                        <button
                          onClick={(e) => handlePurchase(e, card)}
                          disabled={isPurchasing}
                          className="rounded-full bg-yellow-600 px-4 py-1.5 text-xs font-semibold text-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {isPurchasing ? "処理中..." : `¥${card.unlockPrice * 100}でアンロック`}
                        </button>
                      ) : (
                        <button className="rounded-full border border-yellow-600 bg-yellow-600/10 px-4 py-1.5 text-xs font-semibold text-yellow-500 hover:bg-yellow-600/20">
                          登録して視聴
                        </button>
                      )}
                    </div>
                  )}

                  {/* メディア情報バッジ */}
                  {card.media && (() => {
                    const mainMedia = card.media.filter(m => !m.isSample);
                    const videos = mainMedia.filter(m => m.type === "VIDEO");
                    const images = mainMedia.filter(m => m.type === "IMAGE");

                    const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

                    const formatDuration = (seconds: number): string => {
                      const hours = Math.floor(seconds / 3600);
                      const minutes = Math.floor((seconds % 3600) / 60);
                      const secs = seconds % 60;

                      if (hours > 0) {
                        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                      }
                      return `${minutes}:${String(secs).padStart(2, '0')}`;
                    };

                    if (mainMedia.length === 0) return null;

                    return (
                      <div className="absolute bottom-2 right-2 flex gap-1.5">
                        {videos.length > 0 && totalDuration > 0 && (
                          <div className="flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            {formatDuration(totalDuration)}
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

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-yellow-500">
                    {card.title}
                  </h3>
                  {card.subtitle && !card.isLocked && (
                    <p className="mt-1 text-xs text-gray-400">{card.subtitle}</p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-yellow-900/20 bg-black/40 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-lg">💎</span>
            <span className="font-semibold">Velvet Pro</span>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="/terms/fans" target="_blank" className="hover:text-yellow-500">
              利用規約
            </a>
            <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-yellow-500">
              特定商取引法に基づく表記
            </a>
            <a href="/privacy" target="_blank" className="hover:text-yellow-500">
              プライバシーポリシー
            </a>
          </div>
          <p className="text-xs">© 2025 Velvet Pro Inc.</p>
        </div>
      </footer>

      {/* クレジット不足モーダル */}
      <InsufficientCreditsModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentCredits={creditsData?.credits || 0}
        requiredAmount={selectedCard?.price || (selectedCard?.unlockPrice ? selectedCard.unlockPrice * 100 : 0)}
        handle={handle || undefined}
        contentTitle={selectedCard?.title}
      />
    </div>
  );
}
