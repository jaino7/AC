"use client";

import { Suspense } from "react";


import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCredits, useInvalidateCredits } from "@/components/hooks/useCredits";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";
import { samplePosts } from "@/lib/sampleContent";

type Plan = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

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
  requiredTier?: string;
  unlockPrice?: number;
  price?: number | null;
  media?: Media[];
};

type CreatorProfile = {
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  headerUrl: string | null;
  logoUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  discordUrl: string | null;
  otherUrl: string | null;
  otherUrlName?: string | null;
  themeConfig?: { showNameInHeader?: boolean } | null;
};

type TabType = "all" | "plans" | "single" | "saved";

const resolveAssetUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/uploads/brand-assets/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`;
  }
  return url;
};

function VelvetProContentPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const propHandle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment && pathSegment !== 'content' ? pathSegment : searchParams.get("handle") || undefined);
  const routeParams = useParams();
  const handle = (routeParams.handle as string | undefined) || propHandle;
  const isPreview = searchParams.get("preview") === "true";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [contentCards, setContentCards] = useState<ContentCard[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedCards, setSavedCards] = useState<ContentCard[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ContentCard | null>(null);

  // クレジット情報を取得
  const { data: creditsData } = useCredits(handle || undefined);
  const invalidateCredits = useInvalidateCredits();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ハンドルがない場合（テーマページとして直接アクセス）はサンプルデータを表示
        if (!handle && !isPreview) {
          setCreatorProfile({
            handle: "velvet-pro",
            displayName: "Velvet Pro Demo",
            bio: "これはVelvet Proテーマのデモページです。実際のクリエイターページでは、あなたのコンテンツがここに表示されます。",
            avatarUrl: null,
            headerUrl: null,
            logoUrl: null,
            twitterUrl: null,
            instagramUrl: null,
            tiktokUrl: null,
            discordUrl: null,
            otherUrl: null,
            otherUrlName: null,
          });
          const cards: ContentCard[] = samplePosts.map((post: any, index: number) => {
            let type: ContentCard["type"] = index % 3 === 0 ? "velvet-elite" : index % 2 === 0 ? "gold" : "free";

            return {
              id: post.id,
              title: post.title,
              subtitle: post.description?.substring(0, 50) || undefined,
              cover: post.cover,
              type,
              isLocked: false,
              timeAgo: post.timeAgo,
              media: post.media || [],
            };
          });
          setContentCards(cards);
          setLoading(false);
          return;
        }

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

        // Fetch plans
        let plansResponse;
        if (handle) {
          plansResponse = await fetch(`/api/creators/subscription-plans?handle=${handle}`);
        } else if (isPreview) {
          plansResponse = await fetch("/api/creators/subscription-plans");
        }

        if (plansResponse?.ok) {
          const plansData = await plansResponse.json();
          setPlans(plansData.plans || []);
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
              requiredTier: post.requiredPlan?.name,
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

  useEffect(() => {
    if (activeTab === "saved" && !isPreview && savedCards.length === 0) {
      const fetchSaved = async () => {
        setSavedLoading(true);
        try {
          const res = await fetch("/api/fans/saved");
          if (res.ok) {
            const data = await res.json();
            const arr = data.posts || [];
            setSavedCards(arr.map((p: any) => ({
              id: p.id,
              title: p.title,
              cover: p.thumbnailUrl || p.mediaUrl || null,
              type: "free" as const,
              isLocked: p.isLocked,
              requiredTier: p.requiredPlan?.name,
              price: p.price,
              media: p.media || [],
            })));
          }
        } catch (err) {
          console.error("Failed to fetch saved posts:", err);
        } finally {
          setSavedLoading(false);
        }
      };
      fetchSaved();
    }
  }, [activeTab, isPreview]);

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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#1a1612] via-[#2a231d] to-[#1a1612] text-white">
      {/* Header */}
      <header className="border-b border-yellow-900/20 bg-black/40 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {creatorProfile?.logoUrl ? (
              <img src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""} alt="Logo" className="h-8 w-auto max-w-[160px] rounded object-contain" />
            ) : (
              <span className="text-2xl">💎</span>
            )}
            {creatorProfile?.themeConfig?.showNameInHeader !== false && (
              <span className="text-lg font-semibold">{creatorProfile?.displayName || "Velvet Pro"}</span>
            )}
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

      <main className="flex-1 px-6 py-8 pb-24 sm:px-10 lg:px-16 md:pb-8">
        {/* Profile Section */}
        <section className="mb-12 text-center">
          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-600 p-1 bg-black">
                {creatorProfile?.avatarUrl || creatorProfile?.headerUrl ? (
                  <img
                    src={resolveAssetUrl(creatorProfile.avatarUrl) ?? (creatorProfile.headerUrl || "")}
                    alt={creatorProfile?.displayName || "CreatorProfile"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-yellow-600">
                    💎
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name and Title */}
          <h1 className="mb-2 text-3xl font-semibold">{creatorProfile?.displayName || "Creator"}</h1>
          {/* Bio */}
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-300">
            {creatorProfile?.bio || "クリエイターのプロフィールです"}
          </p>

          {/* Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="flex items-center gap-2 rounded-full bg-yellow-600 px-6 py-3 text-sm font-semibold text-black transition hover:bg-yellow-500">
              {plans.length > 0 ? `${plans[0].name}に加入` : "プランに加入"}
            </button>
          </div>

          {/* SNS Links */}
          <div className="flex items-center justify-center gap-4">
            {creatorProfile?.twitterUrl && (
              <a href={creatorProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white">
                𝕏
              </a>
            )}
            {creatorProfile?.instagramUrl && (
              <a href={creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white">
                📷
              </a>
            )}
            {creatorProfile?.tiktokUrl && (
              <a href={creatorProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white">
                TikTok
              </a>
            )}
            {creatorProfile?.discordUrl && (
              <a href={creatorProfile.discordUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white">
                Discord
              </a>
            )}
            {creatorProfile?.otherUrl && (
              <a href={creatorProfile.otherUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 px-4 items-center gap-1.5 justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white text-sm whitespace-nowrap">
                <span>🔗</span>
                <span>{creatorProfile.otherUrlName || "リンク"}</span>
              </a>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-yellow-900/30 md:relative md:bottom-auto md:mb-8 md:bg-transparent md:border-t-0 md:backdrop-blur-none md:border-b md:border-yellow-900/20 md:pb-4">
          <nav className="flex overflow-x-auto items-center justify-center gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:flex-wrap md:px-0 md:py-0 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "all"
                ? "bg-yellow-600 text-black"
                : "bg-white/5 text-gray-400 hover:text-white"
                }`}
            >
              すべて
            </button>
            <button
              onClick={() => setActiveTab("plans")}
              className={`whitespace-nowrap flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "plans"
                ? "bg-yellow-600 text-black"
                : "bg-white/5 text-gray-400 hover:text-white"
                }`}
            >
              プラン
            </button>
            <button
              onClick={() => setActiveTab("single")}
              className={`whitespace-nowrap flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "single"
                ? "bg-yellow-600 text-black"
                : "bg-white/5 text-gray-400 hover:text-white"
                }`}
            >
              単体販売
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`whitespace-nowrap flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === "saved"
                ? "bg-yellow-600 text-black"
                : "bg-white/5 text-gray-400 hover:text-white"
                }`}
            >
              保存済み
            </button>
          </nav>
        </div>

        {/* Content Grid */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(() => {
            const displayCards = activeTab === "saved" ? savedCards : contentCards;
            const filteredCards = displayCards.filter(card => {
              if (activeTab === "all") return true;
              if (activeTab === "plans") return card.requiredTier;
              if (activeTab === "single") return card.isLocked && card.price && (card.price > 0) && !card.requiredTier;
              if (activeTab === "saved") return true;
              return true;
            });

            if (filteredCards.length === 0) {
              return <div className="col-span-full py-12 text-center text-gray-400">該当するコンテンツがありません</div>;
            }

            return (
              <>
                {filteredCards.map((card) => (
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
                              <div
                                onClick={(e) => {
                                  if (!isPurchasing) handlePurchase(e as unknown as React.MouseEvent, card);
                                }}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold text-black transition ${isPurchasing ? "bg-yellow-600 opacity-50 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-500"}`}
                              >
                                {isPurchasing ? "処理中..." : `¥${card.unlockPrice * 100}でアンロック`}
                              </div>
                            ) : (
                              <div className="rounded-full border border-yellow-600 bg-yellow-600/10 px-4 py-1.5 text-xs font-semibold text-yellow-500 hover:bg-yellow-600/20 text-center">
                                登録して視聴
                              </div>
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
              </>
            );
          })()}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-yellow-900/20 bg-black/40 pt-6 pb-24 md:pb-6">
        <div className="flex items-center justify-start px-6 sm:px-10 lg:px-16 text-sm text-gray-400">
          <div className="flex flex-wrap justify-start gap-6 text-xs">
            <a href="/terms/fans" target="_blank" className="hover:text-yellow-500 whitespace-nowrap">
              利用規約
            </a>
            <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-yellow-500 whitespace-nowrap">
              特定商取引法に基づく表記
            </a>
            <a href="/privacy" target="_blank" className="hover:text-yellow-500 whitespace-nowrap">
              プライバシーポリシー
            </a>
          </div>
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

export default function VelvetProContentPage() {
  return (
    <Suspense>
      <VelvetProContentPageContent />
    </Suspense>
  );
}
