"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Post = {
  id: string;
  title: string;
  description: string;
  cover: string | null;
  isLocked?: boolean;
  unlockPrice?: string;
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
};

type Plan = {
  id: string;
  name: string;
  price: number;
};

type TabType = "all" | "single" | "saved" | string;

interface CreatorProContentPageProps {
  handle?: string;
}

export default function CreatorProContentPage({ handle: propHandle }: CreatorProContentPageProps = {}) {
  const searchParams = useSearchParams();
  const handle = propHandle || searchParams.get("handle");
  const isPreview = searchParams.get("preview") === "true";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          plansResponse = await fetch(`/api/creators/plans?handle=${handle}`);
        } else if (isPreview) {
          plansResponse = await fetch("/api/creators/plans");
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
            isLocked: post.isLocked,
            unlockPrice: post.isLocked && post.requiredPlan ? `¥${post.requiredPlan.price}` : undefined,
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
              description: post.content || "",
              cover: post.thumbnailUrl || post.mediaUrl,
              isLocked: post.isLocked,
              unlockPrice: post.isLocked && post.requiredPlan ? `¥${post.requiredPlan.price}` : undefined,
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
    if (activeTab === "single") return post.isLocked && post.unlockPrice && !post.requiredPlan;
    if (activeTab === "saved") return true; // Already filtered by displayPosts
    // プランIDの場合
    const plan = plans.find(p => p.id === activeTab);
    if (plan) {
      return post.requiredPlan?.id === activeTab;
    }
    return true;
  });

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
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            設定
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            ログアウト
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#0d1117] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-white">
                {creatorProfile?.logoUrl ? (
                  <img src={creatorProfile.logoUrl} alt="Logo" className="h-full w-full rounded object-cover" />
                ) : (
                  creatorProfile?.displayName?.charAt(0) || "C"
                )}
              </div>
              <span className="text-lg font-semibold">{creatorProfile?.displayName || "Creator"}</span>
            </div>
            <div className="flex items-center gap-3">
              {!session && (
                <>
                  <Link href={handle ? `/${handle}/login` : "/creators/login"} className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
                    ログイン
                  </Link>
                  <Link href={handle ? `/${handle}/signup` : "/creators/signup"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

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
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">About Creator</h3>
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
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Social Links</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {creatorProfile?.twitterUrl && (
                        <a href={creatorProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-blue-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </div>
                          <span className="font-medium">X (Twitter)</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.instagramUrl && (
                        <a href={creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-pink-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-pink-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </div>
                          <span className="font-medium">Instagram</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.tiktokUrl && (
                        <a href={creatorProfile.tiktokUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-teal-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-teal-500 hover:text-black">
                            <span>🎵</span>
                          </div>
                          <span className="font-medium">TikTok</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.discordUrl && (
                        <a href={creatorProfile.discordUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-indigo-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-indigo-600">
                            <span>💬</span>
                          </div>
                          <span className="font-medium">Discord</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      )}
                      {creatorProfile?.otherUrl && (
                        <a href={creatorProfile.otherUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-gray-400 transition-all hover:border-gray-700 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-purple-900/10 hover:-translate-y-0.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white transition-colors group-hover:bg-purple-600">
                            <span>🔗</span>
                          </div>
                          <span className="font-medium">Other</span>
                          <svg className="ml-auto h-4 w-4 text-gray-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <nav className="border-b border-gray-800 bg-[#0d1117] px-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === "all"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              すべての投稿
            </button>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActiveTab(plan.id)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === plan.id
                  ? "border-b-2 border-blue-600 text-blue-500"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                {plan.name}
              </button>
            ))}
            <button
              onClick={() => setActiveTab("single")}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === "single"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              単体販売
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === "saved"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              保存済み
            </button>
          </div>
        </nav>

        {/* Feed */}
        <main className="bg-[#010409] p-6">
          <div className="mx-auto grid max-w-5xl gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                {posts.length === 0 ? "投稿がありません" : "該当する投稿がありません"}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/creator-pro/content/${post.id}`}
                  className="group overflow-hidden rounded-xl bg-[#161b22] transition hover:bg-[#1c2128]"
                >
                  {post.cover ? (
                    <div className="relative aspect-video overflow-hidden bg-gray-900">
                      <img
                        src={post.cover}
                        alt={post.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      {/* Lock Icon */}
                      {post.isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
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
                      <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold hover:bg-blue-700">
                        {post.unlockPrice}でアンロック
                      </button>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 border-t border-gray-800 bg-[#010409] px-6 py-4">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <a href="/terms/fans" target="_blank" className="hover:text-blue-500 hover:underline">
                  利用規約
                </a>
                <span>•</span>
                <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-blue-500 hover:underline">
                  特定商取引法に基づく表記
                </a>
                <span>•</span>
                <a href="/privacy" target="_blank" className="hover:text-blue-500 hover:underline">
                  プライバシーポリシー
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
