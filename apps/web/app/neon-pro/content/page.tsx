"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

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

type TabType = "all" | "images" | "videos" | "archive";

interface NeonProContentPageProps {
  handle?: string;
}

export default function NeonProContentPage({ handle: propHandle }: NeonProContentPageProps = {}) {
  const searchParams = useSearchParams();
  const handle = propHandle || searchParams.get("handle");
  const isPreview = searchParams.get("preview") === "true";
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
            timeAgo: getTimeAgo(new Date(post.createdAt)),
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e12] text-white items-center justify-center">
        <p className="text-cyan-400">読み込み中...</p>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-[#0a0e12] text-white">
      {/* Sidebar */}
      <aside className="w-56 border-r border-cyan-900/30 bg-[#0a0e12] p-4">
        {/* Navigation */}
        <nav className="space-y-1">
          <button className="flex w-full items-center gap-2 rounded bg-cyan-900/30 px-3 py-2 text-xs font-semibold text-cyan-300">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            ホーム
          </button>
          <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            設定
          </button>
          <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            ログアウト
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-[#050810]">
        {/* Header */}
        <header className="border-b border-cyan-900/30 bg-[#0a0e12] px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <div>
                  <h1 className="font-mono text-lg font-bold tracking-wider text-cyan-400">
                    CYBER<span className="text-white">.SUBS</span>
                  </h1>
                </div>
              </div>
              <nav className="ml-6 flex items-center gap-4 text-xs font-semibold uppercase">
                <a href="#" className="text-gray-400 hover:text-white">発見</a>
                <a href="#" className="text-gray-400 hover:text-white">クリエイター</a>
                <a href="#" className="flex items-center gap-1 text-gray-400 hover:text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  ライブ
                </a>
              </nav>
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
          </div>
        </header>

        {/* Profile Section */}
        <section className="border-b border-cyan-900/30 bg-gradient-to-r from-cyan-900/5 to-transparent p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-400 to-blue-600">
                <img
                  src="https://images.unsplash.com/photo-1614029655965-574f0f70e3b0?auto=format&fit=crop&w=200&q=80"
                  alt="NeonVixen_99"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400">
                <svg className="h-4 w-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h2 className="font-mono text-2xl font-bold tracking-wide">{creatorProfile?.displayName || "Creator"}</h2>
                <span className="rounded bg-pink-600 px-2 py-0.5 text-[10px] font-bold uppercase">ライブ</span>
              </div>
              <p className="mb-4 text-xs text-cyan-300">
                {creatorProfile?.bio || "クリエイターのプロフィールです"}
              </p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 rounded bg-cyan-500 px-4 py-2 text-xs font-bold uppercase text-black transition hover:bg-cyan-400">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  月額 ¥500で参加
                </button>
                <button className="flex items-center gap-1.5 rounded border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-bold uppercase text-white transition hover:bg-gray-800">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  暗号化メッセージ
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="border-b border-cyan-900/30 px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === "all"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-gray-500 hover:text-white"
                }`}
            >
              すべて
            </button>
            <button
              onClick={() => setActiveTab("images")}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === "images"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-gray-500 hover:text-white"
                }`}
            >
              画像
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === "videos"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-gray-500 hover:text-white"
                }`}
            >
              動画
            </button>
            <button
              onClick={() => setActiveTab("archive")}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === "archive"
                ? "border-b-2 border-cyan-400 text-cyan-400"
                : "text-gray-500 hover:text-white"
                }`}
            >
              アーカイブ
            </button>
          </div>
        </nav>

        {/* Content Area with Sidebar */}
        <div className="flex gap-6 p-6">
          {/* Feed */}
          <main className="flex-1">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/neon-pro/content/${post.id}`}
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
                      {post.isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                          <svg className="mb-2 h-10 w-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <div className="text-[10px] uppercase text-cyan-400">Access Denied</div>
                          <div className="text-[9px] text-gray-400">REQ: {post.requiredTier}</div>
                        </div>
                      )}
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
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-1">
                <button className="h-1.5 w-6 rounded-full bg-cyan-500"></button>
                <button className="h-1.5 w-1.5 rounded-full bg-gray-700 hover:bg-gray-600"></button>
                <button className="h-1.5 w-1.5 rounded-full bg-gray-700 hover:bg-gray-600"></button>
              </div>
            </div>
          </main>

          {/* BIO_DATA Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="sticky top-6 rounded-lg border border-cyan-900/50 bg-gray-900/50 p-4">
              <div className="mb-3 flex items-center gap-2 border-b border-cyan-900/30 pb-2">
                <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">プロフィール</span>
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-gray-300">
                ハイクオリティなサイバーパンクアセットとコスプレ写真を制作しています。サブスクライバーは高解像度画像、制作ストリーム、限定Discordロールにアクセスできます。
              </p>
              {/* Social Icons */}
              <div className="flex gap-2">
                <a href="#" className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-cyan-400 transition hover:bg-gray-700">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-cyan-400 transition hover:bg-gray-700">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>

              {/* ACCESS PROTOCOL */}
              <div className="mt-4 border-t border-cyan-900/30 pt-4">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  アクセスプロトコル
                </div>

                {/* INITIATE Tier */}
                <div className="mb-3 rounded border border-cyan-700/50 bg-cyan-950/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-cyan-400">ベーシック</span>
                    <span className="font-mono text-xs font-bold text-cyan-400">¥500<span className="text-[10px] text-gray-500">/月</span></span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5 text-green-400">
                      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>公開フィードアクセス</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-400">
                      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>投票機能</span>
                    </div>
                  </div>
                  <button className="mt-3 w-full rounded bg-cyan-600 py-1.5 text-[10px] font-bold uppercase text-black transition hover:bg-cyan-500">
                    プランを選択
                  </button>
                </div>

                {/* CYBER_PUNK Tier */}
                <div className="rounded border border-cyan-400 bg-gradient-to-br from-cyan-900/30 to-transparent p-3">
                  <div className="mb-1 inline-block rounded bg-cyan-500 px-1.5 py-0.5 text-[8px] font-bold uppercase text-black">
                    人気
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase text-cyan-300">プレミアム</span>
                    <span className="font-mono text-xs font-bold text-cyan-300">¥1500<span className="text-[10px] text-gray-500">/月</span></span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5 text-green-400">
                      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>ベーシックのすべて</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-400">
                      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>HDダウンロード</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-400">
                      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Discordアクセス</span>
                    </div>
                  </div>
                  <button className="mt-3 w-full rounded bg-cyan-500 py-1.5 text-[10px] font-bold uppercase text-black transition hover:bg-cyan-400">
                    プランを選択
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t border-cyan-900/30 bg-[#0a0e12] px-6 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-gray-600">
                <span>SERVER: TOKYO_33</span>
                <span className="mx-2">•</span>
                <span>LAT: 22ms</span>
              </div>
              <div className="text-gray-600">© 2085 CYBER.SUBS</div>
            </div>
            <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500">
              <a href="/terms/fans" target="_blank" className="hover:text-cyan-400 hover:underline">
                利用規約
              </a>
              <span>•</span>
              <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-cyan-400 hover:underline">
                特定商取引法に基づく表記
              </a>
              <span>•</span>
              <a href="/privacy" target="_blank" className="hover:text-cyan-400 hover:underline">
                プライバシーポリシー
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
