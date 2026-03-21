"use client";

import { Suspense } from "react";


import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { samplePosts } from "@/lib/sampleContent";

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
  cover: string | null;
  type: "public" | "gold" | "bronze";
  timeAgo: string;
  likes?: number;
  media?: Media[];
  price?: number | null;
  isLocked?: boolean;
};

type CreatorProfile = {
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  logoUrl: string | null;
  headerUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  discordUrl: string | null;
  otherUrl: string | null;
  themeConfig?: { showNameInHeader?: boolean } | null;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
};

type TabType = "all" | "plans" | "single" | "saved";

const resolveAssetUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/uploads/brand-assets/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`;
  }
  return url;
};

function ZineLiteContentPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const propHandle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment && pathSegment !== 'content' ? pathSegment : undefined);
  // カスタムドメイン経由の場合、クッキーからハンドルを取得
  const handle = propHandle || document.cookie.match(/x-creator-handle=([^;]+)/)?.[1] || undefined;
  const isPreview = searchParams.get("preview") === "true";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [contentCards, setContentCards] = useState<ContentCard[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedCards, setSavedCards] = useState<ContentCard[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ハンドルがない場合（テーマページとして直接アクセス）はサンプルデータを表示
        if (!handle && !isPreview) {
          setCreatorProfile({
            handle: "zine-lite",
            displayName: "Zine Lite Demo",
            bio: "これはZine Liteテーマのデモページです。実際のクリエイターページでは、あなたのコンテンツがここに表示されます。",
            avatarUrl: null,
            logoUrl: null,
            headerUrl: null,
            twitterUrl: null,
            instagramUrl: null,
            tiktokUrl: null,
            discordUrl: null,
            otherUrl: null,
          });
          const cards: ContentCard[] = samplePosts.map((post: any, index: number) => {
            let type: "public" | "gold" | "bronze" = index % 3 === 0 ? "gold" : index % 2 === 0 ? "bronze" : "public";

            return {
              id: post.id,
              title: post.title,
              cover: post.cover,
              type,
              timeAgo: post.timeAgo,
              likes: undefined,
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
            let type: "public" | "gold" | "bronze" = "public";
            if (post.isLocked && post.requiredPlan) {
              // You could add logic here to determine gold vs bronze based on plan price
              type = post.requiredPlan.price > 1000 ? "gold" : "bronze";
            }

            return {
              id: post.id,
              title: post.title,
              cover: post.thumbnailUrl || post.mediaUrl,
              type,
              timeAgo: getTimeAgo(new Date(post.createdAt)),
              likes: undefined, // Could add likes from database if available
              media: post.media || [],
              price: post.price,
              isLocked: post.isLocked,
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
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return `${diffWeeks}週間前`;
  };

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
              type: "public" as const,
              timeAgo: getTimeAgo(new Date(p.createdAt)),
              media: p.media || [],
              price: p.price,
              isLocked: p.isLocked,
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

  const displayCards = activeTab === "saved" ? savedCards : contentCards;
  const filteredCards = displayCards.filter((card) => {
    if (activeTab === "all") return true;
    if (activeTab === "plans") return card.type === "gold" || card.type === "bronze";
    if (activeTab === "single") return card.isLocked && card.price && (card.price > 0) && card.type === "public";
    if (activeTab === "saved") return true;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              {creatorProfile?.logoUrl ? (
                <img src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""} alt="Logo" className="h-8 w-auto max-w-[160px] rounded object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
                  ⊞
                </div>
              )}
              {creatorProfile?.themeConfig?.showNameInHeader !== false && (
                <span className="text-base font-semibold text-gray-900">
                  {creatorProfile?.displayName || "CreatorSpace"}
                </span>
              )}
            </div>
          </div>

          {/* Search and User */}
          <div className="flex items-center gap-4">
            {!session && (
              <>
                <Link href={handle ? `/${handle}/login` : "/creators/login"} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  ログイン
                </Link>
                <Link href={handle ? `/${handle}/signup` : "/creators/signup"} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700">
                  新規登録
                </Link>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-pink-400"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt="User Menu" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                )}
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg z-20">
                    <Link href={handle ? `/${handle}/account` : "/zine-lite/account"} onClick={() => setShowUserMenu(false)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                      アカウント
                    </Link>
                    <button onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: handle ? `/${handle}/content` : "/" }); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                      ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto max-w-6xl px-6 pb-24 md:pb-0">
        {/* Hero Image */}
        <div className="relative -mx-6 h-52 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
          {creatorProfile?.headerUrl ? (
            <img
              src={creatorProfile.headerUrl}
              alt="Hero"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
        </div>

        {/* Profile Section */}
        <section className="relative -mt-10 mb-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                {creatorProfile?.avatarUrl ? (
                  <img
                    src={resolveAssetUrl(creatorProfile.avatarUrl) ?? ""}
                    alt={creatorProfile.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                    {creatorProfile?.displayName?.charAt(0) || "C"}
                  </div>
                )}
              </div>

              {/* Name and Bio */}
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {creatorProfile?.displayName || "Creator"}
                  </h1>
                </div>
              </div>
            </div>

            {/* Subscribe and Menu Buttons */}
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                {plans && plans.length > 0 ? `${plans[0].name}に加入` : "プランに加入"}
              </button>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-700">
            {creatorProfile?.bio || "クリエイターのプロフィールです"}
          </p>
        </section>

        {/* Tab Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:relative md:bottom-auto md:mb-6 md:bg-transparent md:shadow-none md:border-b md:border-gray-200">
          <nav className="mx-auto w-full max-w-6xl flex items-center justify-between overflow-x-auto border-t border-gray-200 px-6 pb-[env(safe-area-inset-bottom)] md:flex-wrap md:border-t-0 md:px-0 md:pb-0">
            <div className="flex items-center gap-2 py-1 md:py-0 md:flex-wrap w-full">
              <button
                onClick={() => setActiveTab("all")}
                className={`whitespace-nowrap px-3 md:px-4 py-3 text-xs md:text-sm font-semibold transition ${activeTab === "all"
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                すべて
              </button>
              <button
                onClick={() => setActiveTab("plans")}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs md:text-sm font-semibold transition ${activeTab === "plans"
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                プラン
              </button>
              <button
                onClick={() => setActiveTab("single")}
                className={`whitespace-nowrap px-3 md:px-4 py-3 text-xs md:text-sm font-semibold transition ${activeTab === "single"
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                単体販売
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`whitespace-nowrap px-3 md:px-4 py-3 text-xs md:text-sm font-semibold transition ${activeTab === "saved"
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                保存済み
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-2 py-1 md:py-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded p-2 ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                  }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded p-2 ${viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                  }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Grid */}
        <section className={`mb-12 ${viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}`}>
          {filteredCards.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {contentCards.length === 0 ? "投稿がありません" : "該当する投稿がありません"}
            </div>
          ) : (
            filteredCards.map((card) => (
              <Link
                key={card.id}
                href={handle ? `/${handle}/content/${card.id}` : `/zine-lite/content/${card.id}`}
                className="group block"
              >
                <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    {card.cover ? (
                      <img
                        src={card.cover}
                        alt={card.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold uppercase ${card.type === "gold" || card.type === "bronze"
                          ? "bg-purple-100 text-purple-700"
                          : card.isLocked && card.price && card.price > 0
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-900 text-white"
                          }`}
                      >
                        {card.type === "gold" || card.type === "bronze"
                          ? "プラン"
                          : card.isLocked && card.price && card.price > 0
                            ? "単体販売"
                            : "無料"}
                      </span>
                    </div>

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
                    <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600">
                      {card.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{card.timeAgo}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white pt-6 pb-24 md:pb-6">
        <div className="mx-auto w-full flex max-w-6xl items-center justify-start px-6 text-sm text-gray-600">
          <div className="flex flex-wrap justify-start gap-6 text-xs text-gray-500">
            <a href="/terms/fans" target="_blank" className="hover:text-green-600 hover:underline whitespace-nowrap">
              利用規約
            </a>
            <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-green-600 hover:underline whitespace-nowrap">
              特定商取引法に基づく表記
            </a>
            <a href="/privacy" target="_blank" className="hover:text-green-600 hover:underline whitespace-nowrap">
              プライバシーポリシー
            </a>
          </div>
        </div>
      </footer>
    </div >
  );
}

export default function ZineLiteContentPage() {
  return (
    <Suspense>
      <ZineLiteContentPageContent />
    </Suspense>
  );
}
