"use client";

import { Suspense } from "react";


import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { samplePosts } from "@/lib/sampleContent";
import { useCredits, useInvalidateCredits } from "@/components/hooks/useCredits";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";

type Media = {
  id: string;
  url: string;
  type: string;
  isSample: boolean;
  duration: number | null;
};

type Post = {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  badge?: "free" | "cyberpunk" | "netrunner";
  isLocked?: boolean;
  isEncrypted?: boolean;
  requiredTier?: string;
  timeAgo?: string;
  likes?: number;
  comments?: number;
  media?: Media[];
  price?: number | null;
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

type Plan = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type TabType = "all" | "plans" | "single" | "saved";

const resolveAssetUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/uploads/brand-assets/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`;
  }
  return url;
};

function NeonProContentPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const propHandle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment || undefined);
  const handle = propHandle;
  const isPreview = searchParams.get("preview") === "true";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [subscribedPlanIds, setSubscribedPlanIds] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const { data: creditsData } = useCredits(handle || undefined);
  const invalidateCredits = useInvalidateCredits();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ハンドルがない場合（テーマページとして直接アクセス）はサンプルデータを表示
        if (!handle && !isPreview) {
          setCreatorProfile({
            handle: "neon-pro",
            displayName: "Neon Pro Demo",
            bio: "これはNeon Proテーマのデモページです。実際のクリエイターページでは、あなたのコンテンツがここに表示されます。",
            avatarUrl: null,
            logoUrl: null,
            twitterUrl: null,
            instagramUrl: null,
            tiktokUrl: null,
            discordUrl: null,
            otherUrl: null,
            otherUrlName: null,
          });
          setPosts(samplePosts as Post[]);
          setLoading(false);
          return;
        }

        // Fetch creator profile
        let profileResponse;
        if (handle) {
          profileResponse = await fetch(`/api/creators/profile?handle=${handle}`);
        } else if (isPreview) {
          profileResponse = await fetch("/api/creators/profile");
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

        // Fetch subscribed plans (only when logged in)
        if (session?.user && handle) {
          const subsResponse = await fetch(`/api/fans/subscribe?handle=${handle}`);
          if (subsResponse.ok) {
            const subsData = await subsResponse.json();
            const ids = new Set<string>((subsData.subscriptions || []).map((s: any) => s.planId));
            setSubscribedPlanIds(ids);
          }
        }

        // Fetch published posts
        let postsResponse;
        if (handle) {
          postsResponse = await fetch(`/api/creators/content/public?handle=${handle}`);
        } else if (isPreview) {
          postsResponse = await fetch("/api/creators/content?visibility=PUBLIC");
        } else {
          postsResponse = await fetch("/api/creators/content?visibility=PUBLIC");
        }

        if (postsResponse?.ok) {
          const postsData = await postsResponse.json();
          const postsArray = postsData.posts || [];

          // Transform posts
          const transformedPosts: Post[] = postsArray.map((post: any) => ({
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
          }));

          setPosts(transformedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handle, isPreview, session]);

  const handleSubscribeClick = (plan: Plan) => {
    if (!session) {
      window.location.href = handle ? `/${handle}/login` : "/creators/login";
      return;
    }
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlan) return;

    const currentCredits = creditsData?.credits || 0;
    if (currentCredits < selectedPlan.price) {
      setShowConfirmModal(false);
      setShowInsufficientModal(true);
      return;
    }

    setIsSubscribing(true);
    setShowConfirmModal(false);
    try {
      const response = await fetch("/api/fans/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });

      const data = await response.json();

      if (response.ok) {
        invalidateCredits(handle || undefined);
        setSubscribedPlanIds(prev => new Set(prev).add(selectedPlan.id));
        alert(`「${selectedPlan.name}」プランに登録しました`);
        window.location.reload();
      } else if (data.shortage) {
        setShowInsufficientModal(true);
      } else {
        alert(data.error || "プランへの登録に失敗しました");
      }
    } catch {
      alert("プランへの登録に失敗しました");
    } finally {
      setIsSubscribing(false);
    }
  };

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
    if (activeTab === "saved" && !isPreview && savedPosts.length === 0) {
      const fetchSaved = async () => {
        setSavedLoading(true);
        try {
          const res = await fetch("/api/fans/saved");
          if (res.ok) {
            const data = await res.json();
            const arr = data.posts || [];
            setSavedPosts(arr.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.content || "",
              cover: p.thumbnailUrl || p.mediaUrl,
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
      <div className="flex min-h-screen bg-[#0a0e12] text-white items-center justify-center">
        <p className="text-cyan-400">読み込み中...</p>
      </div>
    );
  }


  return (
    <>
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#0a0e12] text-white">
      {/* Mobile Header / Hamburger */}
      <div className="flex lg:hidden items-center justify-between border-b border-cyan-900/30 bg-[#0a0e12] p-4">
        <div className="flex items-center gap-2">
          {creatorProfile?.logoUrl ? (
            <img src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""} alt="Logo" className="h-8 w-auto max-w-[160px] rounded object-contain" />
          ) : (
            <svg className="h-6 w-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          )}
          {creatorProfile?.themeConfig?.showNameInHeader !== false && (
            <span className="font-mono text-lg font-bold tracking-wider text-cyan-400">
              {creatorProfile?.displayName || <><span>CYBER</span><span className="text-white">.SUBS</span></>}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-cyan-400 hover:text-cyan-300 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            {isMobileMenuOpen ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`w-full lg:w-56 border-r border-cyan-900/30 bg-[#0a0e12] p-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'} flex-shrink-0`}>
        {/* Navigation */}
        <nav className="space-y-1">
          <button className="flex w-full items-center gap-2 rounded bg-cyan-900/30 px-3 py-2 text-xs font-semibold text-cyan-300">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            ホーム
          </button>
          <Link href={handle ? `/${handle}/account` : "/neon-pro/account"} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            アカウント
          </Link>
          <button onClick={() => signOut({ callbackUrl: handle ? `/${handle}/content` : "/" })} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            ログアウト
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col bg-[#050810] pb-16 lg:pb-0">
        {/* Content Wrapper (Header + Main Area) */}
        <div className="flex-1">
          {/* Header */}
          <header className="hidden lg:flex border-b border-cyan-900/30 bg-[#0a0e12] px-6 py-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {creatorProfile?.logoUrl ? (
                  <img src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""} alt="Logo" className="h-8 w-auto max-w-[160px] rounded object-contain" />
                ) : (
                  <svg className="h-6 w-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                )}
                {creatorProfile?.themeConfig?.showNameInHeader !== false && (
                  <h1 className="font-mono text-lg font-bold tracking-wider text-cyan-400">
                    {creatorProfile?.displayName || <><span>CYBER</span><span className="text-white">.SUBS</span></>}
                  </h1>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!session && (
                <>
                  <Link href={handle ? `/${handle}/login` : "/creators/login"} className="rounded border border-cyan-600 bg-cyan-900/20 px-3 py-1.5 text-xs font-bold uppercase text-cyan-400 transition hover:bg-cyan-900/30">
                    ログイン
                  </Link>
                  <Link href={handle ? `/${handle}/signup` : "/creators/signup"} className="flex items-center gap-1.5 rounded bg-cyan-500 px-3 py-1.5 text-xs font-bold uppercase text-black transition hover:bg-cyan-400">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </header>

          {/* Profile Section */}
          <section className="border-b border-cyan-900/30 bg-gradient-to-r from-cyan-900/5 to-transparent p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="h-24 w-24 overflow-hidden rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-400 to-blue-600">
                  <img
                    src={resolveAssetUrl(creatorProfile?.avatarUrl || creatorProfile?.logoUrl) ?? "https://images.unsplash.com/photo-1614029655965-574f0f70e3b0?auto=format&fit=crop&w=200&q=80"}
                    alt={creatorProfile?.displayName || "CreatorProfile"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="font-mono text-2xl font-bold tracking-wide">{creatorProfile?.displayName || "Creator"}</h2>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <nav className="fixed bottom-0 left-0 w-full z-50 lg:relative lg:border-b border-t lg:border-t-0 border-cyan-900/30 bg-[#0a0e12] lg:bg-transparent px-2 lg:px-0 py-2 lg:py-0 pb-[max(8px,env(safe-area-inset-bottom))] lg:pb-0 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] lg:shadow-none">
            <div className="flex overflow-x-auto whitespace-nowrap px-4 lg:px-6 items-center lg:gap-4 scrollbar-hide">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 lg:px-4 py-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider ${activeTab === "all"
                  ? "border-b-2 border-cyan-400 text-cyan-400"
                  : "text-gray-500 hover:text-white"
                  }`}
              >
                すべて
              </button>
              <button
                onClick={() => setActiveTab("plans")}
                className={`px-3 lg:px-4 py-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider ${activeTab === "plans"
                  ? "border-b-2 border-cyan-400 text-cyan-400"
                  : "text-gray-500 hover:text-white"
                  }`}
              >
                プラン
              </button>
              <button
                onClick={() => setActiveTab("single")}
                className={`px-3 lg:px-4 py-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider ${activeTab === "single"
                  ? "border-b-2 border-cyan-400 text-cyan-400"
                  : "text-gray-500 hover:text-white"
                  }`}
              >
                単体販売
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-3 lg:px-4 py-3 text-[10px] lg:text-xs font-bold uppercase tracking-wider ${activeTab === "saved"
                  ? "border-b-2 border-cyan-400 text-cyan-400"
                  : "text-gray-500 hover:text-white"
                  }`}
              >
                保存済み
              </button>
            </div>
          </nav>

          {/* Content Area with Sidebar */}
          <div className="flex flex-col-reverse lg:flex-row gap-6 p-4 lg:p-6">
            {/* Feed */}
            <main className="flex-1 min-w-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(() => {
                  const displayPosts = activeTab === "saved" ? savedPosts : posts;
                  const filteredPosts = displayPosts.filter(post => {
                    if (activeTab === "all") return true;
                    if (activeTab === "plans") return post.isLocked && post.requiredTier;
                    if (activeTab === "single") return post.isLocked && post.price && post.price > 0 && (!post.requiredTier || post.requiredTier === "");
                    if (activeTab === "saved") return true;
                    return true;
                  });

                  if (savedLoading) {
                    return (
                      <div className="col-span-full text-center py-12 text-gray-400">
                        読み込み中...
                      </div>
                    );
                  }

                  if (filteredPosts.length === 0) {
                    return (
                      <div className="col-span-full text-center py-12 text-gray-400">
                        該当する投稿がありません
                      </div>
                    );
                  }

                  return (
                    <>
                      {filteredPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={handle ? `/${handle}/content/${post.id}` : `/neon-pro/content/${post.id}`}
                          className="group overflow-hidden rounded-lg border border-cyan-900/30 bg-gray-900/30 transition hover:border-cyan-700/50"
                        >
                          {post.cover && !post.isEncrypted && (
                            <div className="relative aspect-video overflow-hidden bg-black">
                              <img
                                src={post.cover}
                                alt={post.title}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                              {post.badge === "free" && (
                                <div className="absolute right-2 top-2 rounded bg-green-600 px-2 py-0.5 text-[9px] font-bold uppercase">
                                  FREE
                                </div>
                              )}
                              {/* メディア情報バッジ */}
                              {post.media && (() => {
                                const mainMedia = post.media.filter(m => !m.isSample);
                                const videos = mainMedia.filter(m => m.type === "VIDEO");
                                const images = mainMedia.filter(m => m.type === "IMAGE");

                                // 動画の合計時間を計算（秒数）
                                const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

                                // 時間フォーマット関数 (例: 1523 -> "25:23")
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
                          )}
                          {post.isEncrypted && (
                            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                              <div className="text-center">
                                <svg className="mx-auto mb-2 h-12 w-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <div className="text-xs font-bold uppercase text-purple-400">Encrypted Video</div>
                                <div className="text-[10px] uppercase text-pink-400">REQ: {post.requiredTier}</div>
                              </div>
                            </div>
                          )}
                          <div className="p-3">
                            <h3 className="mb-1 text-xs font-semibold text-white group-hover:text-cyan-400">
                              {post.title}
                            </h3>
                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                              <span>{post.timeAgo}</span>
                              {post.likes !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    {post.likes}
                                  </span>
                                  {post.comments !== undefined && (
                                    <span className="flex items-center gap-1">
                                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                      </svg>
                                      {post.comments}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  );
                })()}
              </div>
            </main>

            {/* BIO_DATA Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-6 rounded-lg border border-cyan-900/50 bg-gray-900/50 p-4">
                <div className="mb-3 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                  <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">プロフィール</span>
                </div>
                <p className="mb-4 text-[11px] leading-relaxed text-gray-300">
                  {creatorProfile?.bio || "クリエイターのプロフィールです"}
                </p>
                {/* Social Icons */}
                <div className="flex flex-wrap gap-2">
                  {creatorProfile?.otherUrl && (
                    <a href={creatorProfile.otherUrl} target="_blank" rel="noopener noreferrer" className="flex h-7 px-2 items-center justify-center rounded bg-gray-800 text-cyan-400 transition hover:bg-gray-700 gap-1.5 text-[10px] whitespace-nowrap">
                      <span>🔗</span>
                      <span>{creatorProfile.otherUrlName || "リンク"}</span>
                    </a>
                  )}
                  {creatorProfile?.twitterUrl && (
                    <a href={creatorProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-cyan-400 transition hover:bg-gray-700">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z" />
                      </svg>
                    </a>
                  )}
                  {creatorProfile?.instagramUrl && (
                    <a href={creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-cyan-400 transition hover:bg-gray-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <title>Instagram</title>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {creatorProfile?.tiktokUrl && (
                    <a href={creatorProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-cyan-400 transition hover:bg-gray-700">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.2c0 1.53-.4 3.06-1.16 4.4a8.13 8.13 0 01-3.13 3.12 8.1 8.1 0 01-4.38 1.11 8.08 8.08 0 01-4.4-1.1c-1.28-.75-2.33-1.83-3.08-3.12A8.15 8.15 0 01.325 15.3c.03-1.54.43-3.05 1.2-4.37A8.1 8.1 0 014.655 7.8c1.3-.74 2.76-1.11 4.26-1.1v4.03a4.13 4.13 0 00-2.18.57 4.12 4.12 0 00-1.58 1.6 4.1 4.1 0 00-.54 2.22c.02.77.21 1.52.56 2.18.35.66.86 1.2 1.48 1.58 1.45.89 3.32 1.05 4.9.43a4.17 4.17 0 002.5-3.83V.02h-1.53z" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* ACCESS PROTOCOL */}
                <div className="mt-4 border-t border-cyan-900/30 pt-4">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    プラン
                  </div>

                  {plans.length > 0 ? (
                    plans.map((plan, index) => (
                      <div key={plan.id} className={`mb-3 rounded border ${index === 0 ? "border-cyan-400 bg-gradient-to-br from-cyan-900/30 to-transparent p-3" : "border-cyan-700/50 bg-cyan-950/20 p-3"}`}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold uppercase text-cyan-400">{plan.name}</span>
                          <span className="font-mono text-xs font-bold text-cyan-400">¥{plan.price.toLocaleString()}<span className="text-[10px] text-gray-500">/月</span></span>
                        </div>
                        <div className="space-y-1 text-[10px]">
                          <p className="text-gray-300 mb-2 whitespace-pre-wrap">{plan.description || "このプランに参加して限定コンテンツを楽しもう！"}</p>
                        </div>
                        {subscribedPlanIds.has(plan.id) ? (
                          <div className="mt-3 w-full rounded border border-cyan-700/50 py-1.5 text-center text-[10px] font-bold uppercase text-cyan-600">
                            登録済み
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSubscribeClick(plan)}
                            disabled={isSubscribing}
                            className={`mt-3 w-full rounded bg-cyan-600 py-1.5 text-[10px] font-bold uppercase text-black transition hover:bg-cyan-500 ${isSubscribing ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {isSubscribing ? "処理中..." : "プランを選択"}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="mb-3 rounded border border-cyan-700/50 bg-cyan-950/20 p-3 text-center text-xs text-cyan-400/50">
                      現在アクセス可能なプランはありません
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div> {/* Content Wrapper End */}

        {/* Footer */}
        <footer className="border-t border-cyan-900/30 bg-[#0a0e12] px-6 py-3 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-start gap-4 text-[10px] text-gray-500">
              <a href="/terms/fans" target="_blank" className="hover:text-cyan-400 hover:underline whitespace-nowrap">
                利用規約
              </a>
              <span className="whitespace-nowrap">•</span>
              <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-cyan-400 hover:underline whitespace-nowrap">
                特定商取引法に基づく表記
              </a>
              <span className="whitespace-nowrap">•</span>
              <a href="/privacy" target="_blank" className="hover:text-cyan-400 hover:underline whitespace-nowrap">
                プライバシーポリシー
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>

    {/* プラン登録確認モーダル */}
    {showConfirmModal && selectedPlan && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
        <div className="relative w-full max-w-sm rounded-xl border border-cyan-900/50 bg-[#0d1520] p-6 shadow-2xl mx-4">
          <h3 className="mb-1 font-mono text-base font-bold text-cyan-400">プランへの登録確認</h3>
          <p className="mb-4 text-xs text-gray-400">以下のプランに登録します。よろしいですか？</p>

          <div className="mb-5 rounded-lg border border-cyan-900/40 bg-cyan-950/30 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-white">{selectedPlan.name}</span>
              <span className="font-mono text-sm font-bold text-cyan-400">¥{selectedPlan.price.toLocaleString()}<span className="text-[10px] text-gray-500">/月</span></span>
            </div>
            {selectedPlan.description && (
              <p className="mt-2 text-xs text-gray-400">{selectedPlan.description}</p>
            )}
            <p className="mt-3 text-[10px] text-gray-500">保有クレジット: {(creditsData?.credits || 0).toLocaleString()} pt</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="flex-1 rounded-lg border border-gray-700 py-2 text-xs font-bold text-gray-400 transition hover:border-gray-500 hover:text-white"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirmSubscribe}
              disabled={isSubscribing}
              className="flex-1 rounded-lg bg-cyan-600 py-2 text-xs font-bold text-black transition hover:bg-cyan-500 disabled:opacity-50"
            >
              {isSubscribing ? "処理中..." : "登録する"}
            </button>
          </div>
        </div>
      </div>
    )}

    <InsufficientCreditsModal
      isOpen={showInsufficientModal}
      onClose={() => setShowInsufficientModal(false)}
      currentCredits={creditsData?.credits || 0}
      requiredAmount={selectedPlan?.price || 0}
      handle={handle || undefined}
      contentTitle={selectedPlan?.name}
    />
    </>
  );
}

export default function NeonProContentPage() {
  return (
    <Suspense>
      <NeonProContentPageContent />
    </Suspense>
  );
}
