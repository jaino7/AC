"use client";

import { Suspense } from "react";


import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCreatorHandle } from "@/lib/hooks/useCreatorHandle";
import { useSession, signOut } from "next-auth/react";
import { samplePosts } from "@/lib/sampleContent";

type Media = {
  id: string;
  url: string;
  type: string;
  isSample: boolean;
  duration: number | null;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type ContentCard = {
  id: string;
  title: string;
  description: string;
  cover: string | null;
  badge?: "free" | "premium" | "new";
  isLocked?: boolean;
  timeAgo?: string;
  requiredTier?: string;
  media?: Media[];
  price?: number | null;
};

type CreatorProfile = {
  handle: string;
  displayName: string;
  bio: string | null;
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

// Helper function to calculate time ago
const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + "年前";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "ヶ月前";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "日前";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "時間前";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "分前";
  }
  return "たった今";
};

const resolveAssetUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/uploads/brand-assets/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`;
  }
  return url;
};

function StudioProContentPageContent() {
  const searchParams = useSearchParams();
  const handle = useCreatorHandle();
  const isPreview = searchParams.get("preview") === "true";
  const { data: session } = useSession();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [newReleases, setNewReleases] = useState<ContentCard[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "plans" | "single" | "saved">("all");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  type Post = {
    id: string;
    title: string;
    content: string;
    thumbnailUrl?: string;
    mediaUrl?: string;
    isLocked: boolean;
    createdAt: string;
    requiredPlan?: { name: string };
    media?: Media[];
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [savedCards, setSavedCards] = useState<ContentCard[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ハンドルがない場合（テーマページとして直接アクセス）はサンプルデータを表示
        if (!handle && !isPreview) {
          setCreatorProfile({
            handle: "studio-pro",
            displayName: "Studio Pro Demo",
            bio: "これはStudio Proテーマのデモページです。実際のクリエイターページでは、あなたのコンテンツがここに表示されます。",
            headerUrl: null,
            logoUrl: null,
            twitterUrl: null,
            instagramUrl: null,
            tiktokUrl: null,
            discordUrl: null,
            otherUrl: null,
            otherUrlName: null,
          });
          // Transform sample posts to content cards
          const cards: ContentCard[] = samplePosts.map((post: any, index: number) => ({
            id: post.id,
            title: post.title,
            description: post.description || "",
            cover: post.cover,
            badge: index < 3 ? "new" : "free",
            timeAgo: post.timeAgo,
            media: post.media || [],
          }));
          setNewReleases(cards);
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
          const cards: ContentCard[] = posts.map((post: any, index: number) => {
            return {
              id: post.id,
              title: post.title,
              description: post.content || "",
              cover: post.thumbnailUrl || post.mediaUrl,
              badge: post.isLocked ? undefined : "free",
              isLocked: post.isLocked,
              requiredTier: post.requiredPlan?.name,
              price: post.price,
              timeAgo: getTimeAgo(new Date(post.createdAt)),
              media: post.media || [],
            };
          });

          setNewReleases(cards);
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
              description: p.content?.substring(0, 80) || "",
              cover: p.thumbnailUrl || p.mediaUrl || null,
              isLocked: p.isLocked,
              requiredTier: p.requiredPlan?.name,
              price: p.price,
              timeAgo: getTimeAgo(new Date(p.createdAt)),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center">
        <p className="text-blue-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {creatorProfile?.logoUrl ? (
              <img src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""} alt="Logo" className="h-9 w-auto max-w-[160px] rounded-lg object-contain" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
            )}
            {creatorProfile?.themeConfig?.showNameInHeader !== false && (
              <span className="text-lg font-semibold">{creatorProfile?.displayName || "StudioPro"}</span>
            )}
          </div>

          {/* Auth Buttons / Settings (Log in actions) */}

          {/* Auth Buttons (Not Logged In) */}
          <div className="flex items-center gap-3">
            {!session && (
              <>
                <Link href={handle ? `/${handle}/signup` : "/creators/signup"} className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  新規登録
                </Link>
                <Link href={handle ? `/${handle}/login` : "/creators/login"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  ログイン
                </Link>
              </>
            )}
            {session && (
              <>
                <Link href={handle ? `/${handle}/account` : "/studio-pro/account"} className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  アカウント
                </Link>
                <button onClick={() => signOut({ callbackUrl: handle ? `/${handle}/content` : "/" })} className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          {creatorProfile?.headerUrl ? (
            <img
              src={creatorProfile.headerUrl}
              alt={creatorProfile.displayName}
              className="h-full w-full object-cover"
            />
          ) : creatorProfile?.logoUrl ? (
            <img
              src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""}
              alt={creatorProfile.displayName}
              className="h-full w-full object-cover blur-sm brightness-50"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-900 to-purple-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6">
              <div className="max-w-xl">
                {/* Title */}
                <h1 className="mb-4 text-4xl font-bold leading-tight">
                  {creatorProfile?.displayName || "Creator"}
                </h1>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-gray-300">
                  {creatorProfile?.bio || "クリエイターのコンテンツをお楽しみください"}
                </p>

                {/* Social Links */}
                <div className="mb-6 flex items-center gap-4">
                  {creatorProfile?.twitterUrl && (
                    <a href={creatorProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 transition hover:text-blue-400">
                      𝕏
                    </a>
                  )}
                  {creatorProfile?.instagramUrl && (
                    <a href={creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 transition hover:text-pink-400">
                      📷
                    </a>
                  )}
                  {creatorProfile?.tiktokUrl && (
                    <a href={creatorProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 transition hover:text-white">
                      TikTok
                    </a>
                  )}
                  {creatorProfile?.discordUrl && (
                    <a href={creatorProfile.discordUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 transition hover:text-indigo-400">
                      Discord
                    </a>
                  )}
                  {creatorProfile?.otherUrl && (
                    <a href={creatorProfile.otherUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-400 transition hover:text-gray-200">
                      <span>🔗</span>
                      <span>{creatorProfile.otherUrlName || "リンク"}</span>
                    </a>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    {plans.length > 0 ? `${plans[0].name}に加入` : "プランに加入"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Releases Section */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="fixed bottom-0 left-0 right-0 z-50 flex overflow-x-auto bg-[#0a0e1a]/95 backdrop-blur-md border-t border-white/10 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:relative md:bottom-auto md:p-1 md:bg-[#0a0e1a] md:backdrop-blur-none md:border-t-0 md:rounded-lg md:border md:pb-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`whitespace-nowrap px-4 py-2.5 md:py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                すべて
              </button>
              <button
                onClick={() => setActiveTab("plans")}
                className={`whitespace-nowrap px-4 py-2.5 md:py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'plans' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                プラン
              </button>
              <button
                onClick={() => setActiveTab("single")}
                className={`whitespace-nowrap px-4 py-2.5 md:py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                単体販売
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`whitespace-nowrap px-4 py-2.5 md:py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'saved' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                保存済み
              </button>
            </div>
          </div>

          {(() => {
            const displayCards = activeTab === "saved" ? savedCards : newReleases;
            const filteredCards = displayCards.filter(card => {
              if (activeTab === "all") return true;
              if (activeTab === "plans") return card.requiredTier;
              if (activeTab === "single") return card.isLocked && card.price && card.price > 0 && !card.requiredTier;
              if (activeTab === "saved") return true;
              return true;
            });

            if (filteredCards.length === 0) {
              return <p className="text-center py-12 text-gray-500">該当するコンテンツがありません</p>;
            }

            return (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredCards.map((card) => (
                  <Link
                    key={card.id}
                    href={handle ? `/${handle}/content/${card.id}` : `/studio-pro/content/${card.id}`}
                    className="group"
                  >
                    <article className="overflow-hidden rounded-xl bg-[#13171f] transition hover:bg-[#1a1f2e]">
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-gray-800">
                        {card.cover ? (
                          <img
                            src={card.cover}
                            alt={card.title}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500">
                            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute left-3 top-3 flex gap-2">
                          {card.badge === "premium" && (
                            <span className="rounded bg-yellow-500 px-2 py-0.5 text-xs font-bold uppercase text-black">
                              プレミアム
                            </span>
                          )}
                          {card.badge === "new" && (
                            <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold uppercase text-white">
                              新着
                            </span>
                          )}
                        </div>

                        {/* Lock Overlay */}
                        {card.isLocked && !card.cover && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <svg className="h-12 w-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
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
                        <h3 className="mb-1 font-semibold text-white group-hover:text-blue-400">
                          {card.title}
                        </h3>
                        <p className="text-xs text-gray-400">{creatorProfile?.displayName || "Creator"}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            );
          })()}
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#0a0e1a] px-6 pt-4 pb-24 md:pb-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-start gap-4 text-xs text-gray-500">
              <a href="/terms/fans" target="_blank" className="hover:text-blue-400 hover:underline whitespace-nowrap">
                利用規約
              </a>
              <span className="whitespace-nowrap">•</span>
              <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-blue-400 hover:underline whitespace-nowrap">
                特定商取引法に基づく表記
              </a>
              <span className="whitespace-nowrap">•</span>
              <a href="/privacy" target="_blank" className="hover:text-blue-400 hover:underline whitespace-nowrap">
                プライバシーポリシー
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function StudioProContentPage() {
  return (
    <Suspense>
      <StudioProContentPageContent />
    </Suspense>
  );
}
