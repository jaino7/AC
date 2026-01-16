"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ContentCard = {
  id: string;
  title: string;
  creator: string;
  cover: string | null;
  duration?: string;
  type: "free" | "premium" | "new";
  isLocked?: boolean;
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

interface StudioProContentPageProps {
  handle?: string;
}

export default function StudioProContentPage({ handle: propHandle }: StudioProContentPageProps = {}) {
  const searchParams = useSearchParams();
  const handle = propHandle || searchParams.get("handle");
  const isPreview = searchParams.get("preview") === "true";

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [newReleases, setNewReleases] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);

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
          const cards: ContentCard[] = posts.map((post: any, index: number) => ({
            id: post.id,
            title: post.title,
            creator: creatorProfile?.displayName || "Creator",
            cover: post.thumbnailUrl || post.mediaUrl,
            type: post.isLocked ? "premium" : index < 2 ? "new" : "free",
            isLocked: post.isLocked,
          }));

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center">
        <p className="text-blue-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {creatorProfile?.logoUrl ? (
              <img src={creatorProfile.logoUrl} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
            )}
            <span className="text-lg font-semibold">{creatorProfile?.displayName || "StudioPro"}</span>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm font-medium text-blue-400">
              ホーム
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              探す
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              マイリスト
            </a>
          </nav>

          {/* Social Links */}
          <div className="hidden md:flex items-center gap-3 mr-4">
            {creatorProfile?.twitterUrl && (
              <a href={creatorProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                𝕏
              </a>
            )}
            {creatorProfile?.instagramUrl && (
              <a href={creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400">
                📷
              </a>
            )}
          </div>

          {/* Auth Buttons (Not Logged In) */}
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
              新規登録
            </button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              ログイン
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[400px] overflow-hidden">
          {creatorProfile?.logoUrl ? (
            <img
              src={creatorProfile.logoUrl}
              alt={creatorProfile.displayName}
              className="h-full w-full object-cover"
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
                  {creatorProfile?.displayName || "Creator"}'s
                  <span className="text-blue-400"> Studio</span>
                </h1>

                {/* Description */}
                <p className="mb-6 text-sm leading-relaxed text-gray-300">
                  {creatorProfile?.bio || "クリエイターのコンテンツをお楽しみください"}
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    視聴を開始
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Releases Section */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">新着動画</h2>
          </div>

          {newReleases.length === 0 ? (
            <p className="text-center py-12 text-gray-500">コンテンツがまだありません</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newReleases.map((card) => (
                <Link
                  key={card.id}
                  href={`/studio-pro/content/${card.id}`}
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
                        {card.type === "premium" && (
                          <span className="rounded bg-yellow-500 px-2 py-0.5 text-xs font-bold uppercase text-black">
                            プレミアム
                          </span>
                        )}
                        {card.type === "new" && (
                          <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold uppercase text-white">
                            新着
                          </span>
                        )}
                      </div>

                      {/* Lock Overlay */}
                      {card.isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <svg className="h-12 w-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
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
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#0a0e1a] px-6 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <a href="/terms/fans" target="_blank" className="hover:text-blue-400 hover:underline">
                利用規約
              </a>
              <span>•</span>
              <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-blue-400 hover:underline">
                特定商取引法に基づく表記
              </a>
              <span>•</span>
              <a href="/privacy" target="_blank" className="hover:text-blue-400 hover:underline">
                プライバシーポリシー
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

