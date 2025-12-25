"use client";

import { useState } from "react";
import Link from "next/link";

type ContentCard = {
  id: string;
  title: string;
  cover: string;
  type: "public" | "gold" | "bronze";
  timeAgo: string;
  likes?: number;
};

const contentCards: ContentCard[] = [
  {
    id: "1",
    title: "Product Shoot: Red Series",
    cover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    type: "public",
    timeAgo: "2 hours ago",
    likes: 543
  },
  {
    id: "2",
    title: "Iceland Vlogs: Part 4",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    type: "gold",
    timeAgo: "1 day ago",
    likes: 892
  },
  {
    id: "3",
    title: "Studio Tour 2024",
    cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    type: "public",
    timeAgo: "3 days ago",
    likes: 267
  },
  {
    id: "4",
    title: "High-Res Textures",
    cover: "https://images.unsplash.com/photo-1519865885283-4b45a1b4e895?auto=format&fit=crop&w=800&q=80",
    type: "bronze",
    timeAgo: "1 week ago"
  },
  {
    id: "5",
    title: "Night City Walks",
    cover: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=800&q=80",
    type: "public",
    timeAgo: "1 week ago",
    likes: 1234
  },
  {
    id: "6",
    title: "Figma Source Files",
    cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    type: "gold",
    timeAgo: "2 weeks ago"
  }
];

type TabType = "all" | "bronze" | "free" | "gold";

export default function ZineLiteContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">
                ⊞
              </div>
              <span className="text-base font-semibold text-gray-900">CreatorSpace</span>
            </div>
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Discover
              </a>
              <a href="#" className="font-medium text-gray-900">
                Creators
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                My Feed
              </a>
            </nav>
          </div>

          {/* Search and User */}
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
                <span className="text-sm font-semibold text-white">AV</span>
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

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero Image */}
        <div className="relative -mx-6 h-52 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557682260-96773eb01377?auto=format&fit=crop&w=1400&q=80"
            alt="Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
        </div>

        {/* Profile Section */}
        <section className="relative -mt-16 mb-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                  alt="Alex Voxel"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Name and Bio */}
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">Alex Voxel</h1>
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">@alexvoxelartist</p>
              </div>
            </div>

            {/* Subscribe and Menu Buttons */}
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                月額 ¥600で登録
              </button>
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                メッセージ
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100"
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
          </div>

          {/* Bio */}
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-700">
            東京を拠点とするデジタルアーティスト＆映画制作者。限定裏側コンテンツ、チュートリアル、クリエイター向け高解像度テクスチャパックを提供しています。
          </p>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-900">4.5k</span>{" "}
              <span className="text-gray-600">いいね</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">12k</span>{" "}
              <span className="text-gray-600">サブスクライバー</span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="mb-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 text-sm font-semibold transition ${activeTab === "all"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              すべて
            </button>
            <button
              onClick={() => setActiveTab("free")}
              className={`px-4 py-3 text-sm font-semibold transition ${activeTab === "free"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              無料
            </button>
            <button
              onClick={() => setActiveTab("bronze")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition ${activeTab === "bronze"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <span className="text-orange-600">🥉</span>
              ブロンズティア
            </button>
            <button
              onClick={() => setActiveTab("gold")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition ${activeTab === "gold"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <span className="text-yellow-500">🥇</span>
              ゴールドティア
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
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

        {/* Content Grid */}
        <section className={`mb-12 ${viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}`}>
          {contentCards.map((card) => (
            <Link
              key={card.id}
              href={`/zine-lite/content/${card.id}`}
              className="group block"
            >
              <article className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={card.cover}
                    alt={card.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {card.type !== "public" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                      <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="mt-2 text-sm font-semibold text-white">{card.type === "gold" ? "ゴールド" : "ブロンズ"}ティア限定</span>
                      <button className="mt-3 rounded-md bg-white/90 px-4 py-1.5 text-xs font-semibold text-gray-900 hover:bg-white">
                        アンロック
                      </button>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold uppercase ${card.type === "public"
                        ? "bg-gray-900 text-white"
                        : card.type === "gold"
                          ? "bg-yellow-400 text-gray-900"
                          : "bg-orange-500 text-white"
                        }`}
                    >
                      {card.type}
                    </span>
                  </div>
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
          ))}
        </section>

        {/* Load More */}
        <div className="mb-12 text-center">
          <button className="font-semibold text-blue-600 hover:text-blue-700">
            もっと読み込む
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
              ⊞
            </div>
            <span className="font-semibold">CreatorSpace</span>
          </div>
          <div className="flex gap-6 text-xs">
            <a href="/terms/fans" target="_blank" className="hover:text-gray-900">
              利用規約
            </a>
            <a href="/legal/commercial-transaction/fans" target="_blank" className="hover:text-gray-900">
              特定商取引法に基づく表記
            </a>
            <a href="/privacy" target="_blank" className="hover:text-gray-900">
              プライバシーポリシー
            </a>
          </div>
          <p className="text-xs text-gray-500">© 2024 CreatorSpace. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
