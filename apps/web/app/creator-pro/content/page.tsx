"use client";

import { Suspense } from "react";


import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCredits, useInvalidateCredits } from "@/components/hooks/useCredits";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";
import { samplePosts } from "@/lib/sampleContent";

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
  description: string;
  cover: string | null;
  isEncrypted?: boolean;
  isLocked?: boolean;
  timeAgo?: string;
  media?: Media[];
  price?: number | null;
  unlockPrice?: number | null;
  requiredPlan?: {
    id: string;
    name: string;
    price: number;
  } | null;
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
  otherUrlName?: string | null;
  themeConfig?: { showNameInHeader?: boolean } | null;
};

type Plan = {
  id: string;
  name: string;
  price: number;
};

type TabType = "all" | "single" | "saved" | string;

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
  return Math.floor(seconds) + "秒前";
};

const resolveAssetUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('/uploads/brand-assets/')) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`;
  }
  return url;
};

function CreatorProContentPageContent() {
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inquiryEnabled, setInquiryEnabled] = useState(true);

  // クレジット情報を取得
  const { data: creditsData } = useCredits(handle || undefined);
  const invalidateCredits = useInvalidateCredits();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ハンドルがない場合（テーマページとして直接アクセス）はサンプルデータを表示
        if (!handle && !isPreview) {
          setCreatorProfile({
            handle: "creator-pro",
            displayName: "Creator Pro Demo",
            bio: "これはCreator Proテーマのデモページです。実際のクリエイターページでは、あなたのコンテンツがここに表示されます。",
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
        } else if (isPreview) {
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
            isEncrypted: false,
            timeAgo: getTimeAgo(new Date(post.createdAt)),
            media: post.media || [],
            requiredPlan: post.requiredPlan,
            price: post.price,
            isLocked: post.isLocked,
          }));

          setPosts(transformedPosts);
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

  // Fetch saved posts when Saved tab is active
  useEffect(() => {
    if (activeTab === "saved" && !isPreview && savedPosts.length === 0) {
      const fetchSavedPosts = async () => {
        try {
          setSavedLoading(true);
          const response = await fetch("/api/fans/saved");
          if (response.ok) {
            const data = await response.json();
            const savedPostsArray = data.posts || [];

            // Transform posts
            const transformedPosts: Post[] = savedPostsArray.map((post: any) => ({
              id: post.id,
              title: post.title,
              description: post.content?.substring(0, 80) || "",
              cover: post.thumbnailUrl || post.mediaUrl,
              badge: post.isLocked ? "locked" : "free",
              isEncrypted: false,
              timeAgo: getTimeAgo(new Date(post.createdAt)),
              media: post.media || [],
              requiredPlan: post.requiredPlan,
            }));

            setSavedPosts(transformedPosts);
          }
        } catch (error) {
          console.error("Failed to fetch saved posts:", error);
        } finally {
          setSavedLoading(false);
        }
      };

      fetchSavedPosts();
    }
  }, [activeTab, isPreview]);

  // Use savedPosts when Saved tab is active
  const displayPosts = activeTab === "saved" ? savedPosts : posts;

  const filteredPosts = displayPosts.filter((post) => {
    if (activeTab === "all") return true;
    if (activeTab === "plans") return post.isLocked && post.requiredPlan;
    if (activeTab === "single") return post.isLocked && post.price && post.price > 0 && !post.requiredPlan;
    if (activeTab === "saved") return true; // Already filtered by displayPosts
    return true;
  });

  // 購入処理
  const handlePurchase = async (event: React.MouseEvent, post: Post) => {
    event.preventDefault();
    event.stopPropagation();

    const price = post.price || post.unlockPrice;
    if (!price) {
      alert("この投稿には価格が設定されていません");
      return;
    }

    const currentCredits = creditsData?.credits || 0;

    // クレジット不足チェック
    if (currentCredits < price) {
      setSelectedPost(post);
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
        // クレジット情報を更新
        invalidateCredits(handle || undefined);
        alert("購入が完了しました");
        // ページをリロードして購入済みコンテンツを反映
        window.location.reload();
      } else {
        const error = await response.json();
        if (error.shortage) {
          // クレジット不足エラー
          setSelectedPost(post);
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

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-white">
      {/* Sidebar */}
      <aside className="hidden md:block w-56 border-r border-gray-800 bg-[#0d1117] p-6">
        {/* Navigation */}
        <nav className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            ホーム
          </button>
          <Link href={handle ? `/${handle}/account` : "/creator-pro/account"} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            アカウント
          </Link>
          <button onClick={() => signOut({ callbackUrl: handle ? `/${handle}/content` : "/" })} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            ログアウト
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#0d1117] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {creatorProfile?.logoUrl ? (
                <img src={resolveAssetUrl(creatorProfile.logoUrl) ?? ""} alt="Logo" className="h-8 w-auto max-w-[160px] rounded object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-white">
                  {creatorProfile?.displayName?.charAt(0) || "C"}
                </div>
              )}
              {creatorProfile?.themeConfig?.showNameInHeader !== false && (
                <span className="text-lg font-semibold">{creatorProfile?.displayName || "Creator"}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!session ? (
                <>
                  <Link href={handle ? `/${handle}/login` : "/creators/login"} className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
                    ログイン
                  </Link>
                  <Link href={handle ? `/${handle}/signup` : "/creators/signup"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    新規登録
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#0d1117] border-l border-gray-800 shadow-2xl flex flex-col">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <span className="font-semibold text-white">メニュー</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white p-2">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2">
                <button onClick={() => setIsMenuOpen(false)} className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  ホーム
                </button>
                <Link onClick={() => setIsMenuOpen(false)} href={handle ? `/${handle}/account` : "/creator-pro/account"} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  アカウント
                </Link>
                <button onClick={() => { setIsMenuOpen(false); signOut({ callbackUrl: handle ? `/${handle}/content` : "/" }); }} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        {(creatorProfile?.bio || creatorProfile?.twitterUrl || creatorProfile?.instagramUrl || creatorProfile?.tiktokUrl || creatorProfile?.discordUrl || creatorProfile?.otherUrl) && (
          <section className="relative overflow-hidden border-b border-gray-800 bg-[#0d1117]">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50"></div>

            <div className="relative mx-auto max-w-6xl px-6 py-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
                {/* Bio */}
                {creatorProfile?.bio && (
                  <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">説明</h3>
                    </div>
                    <p className="text-sm leading-7 text-gray-300 whitespace-pre-wrap font-medium">
                      {creatorProfile.bio}
                    </p>
                  </div>
                )}

                {/* Social Media */}
                {(creatorProfile?.twitterUrl || creatorProfile?.instagramUrl || creatorProfile?.tiktokUrl || creatorProfile?.discordUrl || creatorProfile?.otherUrl) && (
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">リンク</h3>
                    </div>
                    <div className="flex flex-wrap gap-3 lg:grid lg:grid-cols-1">
                      {creatorProfile?.twitterUrl && (
                        <a href={creatorProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center lg:justify-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 lg:px-4 lg:py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-blue-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </div>
                          <span className="font-medium hidden lg:block">X (Twitter)</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-blue-500 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.instagramUrl && (
                        <a href={creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center lg:justify-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 lg:px-4 lg:py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-pink-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-pink-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </div>
                          <span className="font-medium hidden lg:block">Instagram</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-pink-500 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.tiktokUrl && (
                        <a href={creatorProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center lg:justify-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 lg:px-4 lg:py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-teal-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-teal-500 hover:text-black">
                            <span>🎵</span>
                          </div>
                          <span className="font-medium hidden lg:block">TikTok</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-teal-500 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.discordUrl && (
                        <a href={creatorProfile.discordUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center lg:justify-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 lg:px-4 lg:py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-indigo-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-indigo-600">
                            <span>💬</span>
                          </div>
                          <span className="font-medium hidden lg:block">Discord</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-indigo-500 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.otherUrl && (
                        <a href={creatorProfile.otherUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center lg:justify-start gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3 lg:px-4 lg:py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-purple-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-purple-600">
                            <span>🔗</span>
                          </div>
                          <span className="font-medium hidden lg:block">{creatorProfile.otherUrlName || "Other"}</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-purple-500 hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-t border-gray-800 md:relative md:bottom-auto md:bg-[#0d1117] md:backdrop-blur-none md:border-t-0 md:border-b md:px-6">
          <nav className="flex items-center gap-2 overflow-x-auto px-4 pb-[env(safe-area-inset-bottom)] md:px-0 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-3 md:px-4 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap ${activeTab === "all"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              すべての投稿
            </button>
            {plans.length > 0 && (
              <button
                onClick={() => setActiveTab("plans")}
                className={`px-3 py-3 md:px-4 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap ${activeTab === "plans"
                  ? "border-b-2 border-blue-600 text-blue-500"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                プラン
              </button>
            )}
            <button
              onClick={() => setActiveTab("single")}
              className={`px-3 py-3 md:px-4 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap ${activeTab === "single"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              単体販売
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-3 py-3 md:px-4 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap ${activeTab === "saved"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              保存済み
            </button>
          </nav>
        </div>

        {/* Feed */}
        <main className="flex-1 bg-[#010409] p-6 pb-20 md:pb-6 flex flex-col">
          <div className="mx-auto grid max-w-5xl w-full gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                {posts.length === 0 ? "投稿がありません" : "該当する投稿がありません"}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={handle ? `/${handle}/content/${post.id}` : `/creator-pro/content/${post.id}`}
                  className="group overflow-hidden rounded-xl bg-[#161b22] transition hover:bg-[#1c2128]"
                >
                  {post.cover ? (
                    <div className="relative aspect-video overflow-hidden bg-gray-900">
                      <img
                        src={post.cover}
                        alt={post.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />

                      {/* メディア情報バッジ */}
                      {post.media && (() => {
                        const mainMedia = post.media.filter(m => !m.isSample);
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
                  ) : (
                    <div className="border-l-4 border-blue-600 bg-blue-600/10 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm text-blue-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                        <span className="text-xs font-semibold uppercase">固定されたお知らせ</span>
                      </div>
                    </div>
                  )}
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="mb-1 font-semibold group-hover:text-blue-500">{post.title}</h3>
                    {post.description && (
                      <p className="mb-3 text-sm text-gray-400 line-clamp-2">{post.description}</p>
                    )}
                    {post.unlockPrice && (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isPurchasing) handlePurchase(e, post);
                        }}
                        className={`w-full text-center rounded-lg bg-blue-600 py-2 text-sm font-semibold transition ${isPurchasing ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                      >
                        {isPurchasing ? "処理中..." : `¥${post.unlockPrice}でアンロック`}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-gray-800 bg-[#010409] pt-8 pb-20 md:pt-4 md:pb-4 w-full">
            <div className="mx-auto max-w-5xl px-4 sm:px-0">
              <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-6 text-xs text-gray-500">
                <a href="/terms/fans" target="_blank" className="hover:text-blue-500 hover:underline whitespace-nowrap">
                  利用規約
                </a>
                <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-blue-500 hover:underline whitespace-nowrap">
                  特定商取引法に基づく表記
                </a>
                <a href="/privacy" target="_blank" className="hover:text-blue-500 hover:underline whitespace-nowrap">
                  プライバシーポリシー
                </a>
                {inquiryEnabled && handle && (
                  <a href={`/${handle}/contact`} className="hover:text-blue-500 hover:underline whitespace-nowrap">
                    お問い合わせ
                  </a>
                )}
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* クレジット不足モーダル */}
      <InsufficientCreditsModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentCredits={creditsData?.credits || 0}
        requiredAmount={selectedPost?.price || selectedPost?.unlockPrice || 0}
        handle={handle || undefined}
        contentTitle={selectedPost?.title}
      />
    </div>
  );
}

export default function CreatorProContentPage() {
  return (
    <Suspense>
      <CreatorProContentPageContent />
    </Suspense>
  );
}
