"use client";

import { useState } from "react";
import Link from "next/link";

type ContentCard = {
  id: string;
  title: string;
  creator: string;
  cover: string;
  duration?: string;
  type: "free" | "premium" | "new";
  isLocked?: boolean;
};

const newReleases: ContentCard[] = [
  {
    id: "1",
    title: "Creative Process Ep. 4",
    creator: "Lora A. Myers, philosophy",
    cover: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=600&q=80",
    type: "premium",
    isLocked: true
  },
  {
    id: "2",
    title: "Home Studio Tour 2023",
    creator: "22ml • Fine Design",
    cover: "https://images.unsplash.com/photo-1618219740975-d40978bb7378?auto=format&fit=crop&w=600&q=80",
    duration: "38:27/2:00",
    type: "free"
  },
  {
    id: "3",
    title: "Advanced Photography",
    creator: "Emily Ross",
    cover: "https://images.unsplash.com/photo-1452457807411-4979b707c5be?auto=format&fit=crop&w=600&q=80",
    duration: "38 m",
    type: "premium",
    isLocked: true
  },
  {
    id: "4",
    title: "Quick & Healthy Meals",
    creator: "Joel • Food",
    cover: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    duration: "5",
    type: "new"
  }
];

export default function StudioProContentPage() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0e1a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </div>
            <span className="text-lg font-semibold">StudioPro</span>
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
        <section className="relative h-[500px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1542396601-dca920ea2807?auto=format&fit=crop&w=1600&q=80"
            alt="The Tokyo Vlog: Cyberpunk City"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-6">
              <div className="max-w-xl">
                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-400 backdrop-blur">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  プラチナ限定
                </div>

                {/* Title */}
                <h1 className="mb-4 text-5xl font-bold leading-tight">
                  The Tokyo Vlog:{" "}
                  <span className="text-blue-400">Cyberpunk City</span>
                </h1>

                {/* Meta Info */}
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-300">
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    新着
                  </span>
                  <span>45分</span>
                  <span>4K Ultra HD</span>
                  <span>旅行＆ライフスタイル</span>
                </div>

                {/* Description */}
                <p className="mb-6 text-sm leading-relaxed text-gray-300">
                  深夜の新宿のネオン街を探索する旅に参加しましょう。隠れた居酒屋を発見し、地元のアーティストに会い、雨に濡れた街並みを美しい4Kで撮影します。
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    今すぐ視聴する
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    予告編を見る
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
            <div className="flex items-center gap-2">
              <button className="rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="rounded-full p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

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
                    <img
                      src={card.cover}
                      alt={card.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />

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

                    {/* Duration */}
                    {card.duration && !card.isLocked && (
                      <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-xs font-semibold">
                        {card.duration}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="mb-1 font-semibold text-white group-hover:text-blue-400">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-400">{card.creator}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
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
