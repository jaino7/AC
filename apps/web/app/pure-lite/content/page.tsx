"use client";

import { Suspense } from "react";


import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useParams } from "next/navigation";
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
  type: "free" | "premium";
  tier: string;
  description: string;
  timeAgo: string;
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
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  discordUrl: string | null;
  otherUrl: string | null;
  otherUrlName?: string | null;
  themeConfig?: { showNameInHeader?: boolean } | null;
};

type TabType = "all" | "free" | "members" | "saved" | "contact";

const resolveAssetUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/uploads/brand-assets/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`;
  }
  return url;
};

function PureLiteContentPageContent() {
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [contentCards, setContentCards] = useState<ContentCard[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedCards, setSavedCards] = useState<ContentCard[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [inquiryEnabled, setInquiryEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ハンドルがない場合（テーマページとして直接アクセス）はサンプルデータを表示
        if (!handle && !isPreview) {
          setCreatorProfile({
            handle: "pure-lite",
            displayName: "Pure Lite Demo",
            bio: "これはPure Liteテーマのデモページです。実際のクリエイターページでは、あなたのコンテンツがここに表示されます。",
            avatarUrl: null,
            logoUrl: null,
            twitterUrl: null,
            instagramUrl: null,
            tiktokUrl: null,
            discordUrl: null,
            otherUrl: null,
            otherUrlName: null,
          });
          const cards: ContentCard[] = samplePosts.map((post: any, index: number) => ({
            id: post.id,
            title: post.title,
            cover: post.cover,
            type: index % 2 === 0 ? "premium" : "free",
            tier: index % 2 === 0 ? "Premium" : "",
            description: post.description || "",
            timeAgo: post.timeAgo,
            media: post.media || [],
          }));
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
          const cards: ContentCard[] = posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            cover: post.thumbnailUrl || post.mediaUrl,
            type: post.isLocked ? "premium" : "free",
            tier: post.isLocked && post.requiredPlan ? post.requiredPlan.name : "",
            description: post.content || "",
            timeAgo: getTimeAgo(new Date(post.createdAt)),
            media: post.media || [],
            price: post.price,
            isLocked: post.isLocked,
          }));

          setContentCards(cards);
        }

        // Fetch inquiry settings
        if (handle) {
          try {
            const inqRes = await fetch(`/api/${handle}/inquiries`);
            if (inqRes.ok) {
              const inqData = await inqRes.json();
              setInquiryEnabled(inqData.inquiryEnabled ?? true);
            }
          } catch { /* ignore */ }
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
              type: p.isLocked ? "premium" as const : "free" as const,
              tier: p.requiredPlan?.name || "",
              description: p.content?.substring(0, 80) || "",
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
    if (activeTab === "free") return card.type === "free" || (!card.isLocked && card.tier === "");
    if (activeTab === "members") return card.type === "premium" && card.tier !== "";
    if (activeTab === "saved") return true;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] text-[#333]">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] text-[#333]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              {creatorProfile?.logoUrl ? (
                <img src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""} alt="Logo" className="h-8 w-auto max-w-[160px] rounded-lg object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
                  C
                </div>
              )}
              {creatorProfile?.themeConfig?.showNameInHeader !== false && (
                <span className="text-base font-semibold text-gray-900">
                  {creatorProfile?.displayName || "CreatorSpace"}
                </span>
              )}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {!session && (
              <>
                <Link href={handle ? `/${handle}/login` : "/creators/login"} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  ログイン
                </Link>
                <Link href={handle ? `/${handle}/signup` : "/creators/signup"} className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-purple-700">
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
                    <Link href={handle ? `/${handle}/account` : "/pure-lite/account"} onClick={() => setShowUserMenu(false)} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
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

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10 pb-24 md:pb-10">
        {/* Creator Profile Section */}
        <section className="mb-8 text-center">
          {/* Avatar */}
          <div className="mb-4 flex justify-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md bg-gradient-to-br from-purple-500 to-purple-600">
              {creatorProfile?.avatarUrl ? (
                <img
                  src={resolveAssetUrl(creatorProfile.avatarUrl) ?? ""}
                  alt={creatorProfile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-3xl font-bold">
                  {creatorProfile?.displayName?.charAt(0) || "C"}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {creatorProfile?.displayName || "Creator"}
            </h1>
          </div>

          {/* Bio */}
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-600">
            {creatorProfile?.bio || "クリエイターのプロフィールです"}
          </p>

          {/* Social Icons */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            {creatorProfile?.twitterUrl && (
              <a href={creatorProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
                𝕏
              </a>
            )}
            {creatorProfile?.instagramUrl && (
              <a href={creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
                📷
              </a>
            )}
            {creatorProfile?.tiktokUrl && (
              <a href={creatorProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
                TikTok
              </a>
            )}
            {creatorProfile?.discordUrl && (
              <a href={creatorProfile.discordUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
                Discord
              </a>
            )}
            {creatorProfile?.otherUrl && (
              <a href={creatorProfile.otherUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 px-3 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 gap-1.5 text-sm font-medium whitespace-nowrap">
                <span>🔗</span>
                <span>{creatorProfile.otherUrlName || "リンク"}</span>
              </a>
            )}
          </div>

          {/* Subscribe Button */}
          <div className="flex items-center justify-center gap-3">
            <button className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-purple-700 hover:to-purple-600">
              月額 ¥500で登録 →
            </button>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:relative md:bottom-auto md:mb-8 md:bg-transparent md:shadow-none">
          <nav className="flex overflow-x-auto justify-center gap-2 border-t border-gray-200 pb-[env(safe-area-inset-bottom)] md:flex-wrap md:border-b md:border-t-0 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${activeTab === "all"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              すべて{activeTab === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("free")}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${activeTab === "free"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              無料{activeTab === "free" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${activeTab === "members"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              メンバー限定{activeTab === "members" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${activeTab === "saved"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              保存済み{activeTab === "saved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
          </nav>
        </div>

        {/* Content Cards */}
        <section className="space-y-6">
          {filteredCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {contentCards.length === 0 ? "投稿がありません" : "該当する投稿がありません"}
            </div>
          ) : (
            filteredCards.map((card) => (
              <Link
                key={card.id}
                href={handle ? `/${handle}/content/${card.id}` : `/pure-lite/content/${card.id}`}
                className="group block"
              >
                <article className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
                  {/* Thumbnail */}
                  <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200">
                    {card.cover ? (
                      <img
                        src={card.cover}
                        alt={card.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-purple-300">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600">
                        {card.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-bold uppercase ${card.type === "premium" && card.tier !== ""
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {card.type === "premium" && card.tier !== ""
                          ? "メンバー限定"
                          : "無料"}
                      </span>
                    </div>

                    {card.tier && (
                      <p className="mb-1 text-xs font-semibold text-gray-500">{card.tier}</p>
                    )}

                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {card.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {card.timeAgo}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))
          )}
        </section>

      </main>

      <footer className="border-t border-purple-900/20 bg-white px-6 pt-4 pb-20 md:pb-4 mt-auto w-full">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-start gap-4 text-xs text-gray-500">
          <a href="/terms/fans" target="_blank" className="hover:text-purple-600 hover:underline whitespace-nowrap">
            利用規約
          </a>
          <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-purple-600 hover:underline whitespace-nowrap">
            特定商取引法に基づく表記
          </a>
          <a href="/privacy" target="_blank" className="hover:text-purple-600 hover:underline whitespace-nowrap">
            プライバシーポリシー
          </a>
          {inquiryEnabled && handle && (
            <a href={`/${handle}/contact`} className="hover:text-purple-600 hover:underline whitespace-nowrap">
              お問い合わせ
            </a>
          )}
        </div>
      </footer>
    </div >
  );
}

export default function PureLiteContentPage() {
  return (
    <Suspense>
      <PureLiteContentPageContent />
    </Suspense>
  );
}
