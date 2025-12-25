"use client";

import { useState } from "react";
import Link from "next/link";

type ContentCard = {
  id: string;
  title: string;
  cover: string;
  type: "free" | "premium";
  tier: string;
  description: string;
  timeAgo: string;
};

const contentCards: ContentCard[] = [
  {
    id: "1",
    title: "Exclusive: My Sketchbook Tour",
    cover: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=600&q=80",
    type: "premium",
    tier: "Tier 1 & Up",
    description: "A detailed look inside my process for the upcoming illustration series. I talk about color theory, brush settings, and how I find...",
    timeAgo: "2 hours ago"
  },
  {
    id: "2",
    title: "Weekly Update: Mountain Series",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80",
    type: "free",
    tier: "",
    description: "Just wanted to say hi 👋 to everyone! I've been working on a new set of landscapes inspired by my recent trip to the Alps. Here i...",
    timeAgo: "1 day ago"
  },
  {
    id: "3",
    title: "High-Res Wallpapers (Jan Pack)",
    cover: "https://images.unsplash.com/photo-1519865885283-4b45a1b4e895?auto=format&fit=crop&w=600&q=80",
    type: "premium",
    tier: "Tier 2 & Up",
    description: "Download the January pack here! Includes 4k versions for desktop and mobile. I also added the PSD files for those who...",
    timeAgo: "3 days ago"
  },
  {
    id: "4",
    title: "New Studio Setup!",
    cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    type: "free",
    tier: "",
    description: "Finally finished organizing my desk. I got a new monitor arm and it makes such a difference for my posture. Here are a link t...",
    timeAgo: "5 days ago"
  }
];

type TabType = "all" | "premium" | "free" | "gallery";

export default function PureLiteContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#333]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
                C
              </div>
              <span className="text-base font-semibold text-gray-900">CreatorSpace</span>
            </div>
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <a href="#" className="font-medium text-gray-900 hover:text-purple-600">
                ホーム
              </a>
              <a href="#" className="text-gray-600 hover:text-purple-600">
                探す
              </a>
            </nav>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-pink-400"
              >
                <span className="text-sm font-semibold text-white">JD</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    設定
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Creator Profile Section */}
        <section className="mb-8 text-center">
          {/* Avatar */}
          <div className="mb-4 flex justify-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                alt="Jane Doe"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Jane Doe</h1>
          </div>

          {/* Bio */}
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-600">
            デジタルアーティスト＆イラストレーター。夢のような風景とキャラクターデザインを制作しています。私のスケッチブックへようこそ！🎨
          </p>

          {/* Social Icons and Subscribe Button */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-800">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          {/* Subscribe Button and Menu */}
          <div className="flex items-center justify-center gap-3">
            <button className="rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-purple-700 hover:to-purple-600">
              月額 ¥500で登録 →
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    シェア
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    報告
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="mb-8 flex items-center justify-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`relative px-4 py-3 text-sm font-semibold transition ${activeTab === "all"
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            すべて
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("premium")}
            className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition ${activeTab === "premium"
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            プレミアム
            {activeTab === "premium" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("free")}
            className={`relative px-4 py-3 text-sm font-semibold transition ${activeTab === "free"
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            無料
            {activeTab === "free" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`relative px-4 py-3 text-sm font-semibold transition ${activeTab === "gallery"
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <svg className="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {activeTab === "gallery" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
            )}
          </button>
        </nav>

        {/* Content Cards */}
        <section className="space-y-6">
          {contentCards.map((card) => (
            <Link
              key={card.id}
              href={`/pure-lite/content/${card.id}`}
              className="group block"
            >
              <article className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-md">
                {/* Thumbnail */}
                <div className="relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl">
                  <img
                    src={card.cover}
                    alt={card.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {card.type === "premium" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-white">ロック中</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-600">
                      {card.title}
                    </h3>
                    <span
                      className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-bold uppercase ${card.type === "premium"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {card.type === "premium" ? "プレミアム" : "無料"}
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
          ))}
        </section>

        {/* Load More */}
        <div className="mt-10 text-center">
          <button className="font-semibold text-purple-600 hover:text-purple-700">
            もっと見る
          </button>
        </div>

        {/* Footer */}
        <footer className="border-t border-purple-900/20 bg-white px-6 py-4">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a href="/terms/fans" target="_blank" className="hover:text-purple-600 hover:underline">
              利用規約
            </a>
            <span>•</span>
            <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-purple-600 hover:underline">
              特定商取引法に基づく表記
            </a>
            <span>•</span>
            <a href="/privacy" target="_blank" className="hover:text-purple-600 hover:underline">
              プライバシーポリシー
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
