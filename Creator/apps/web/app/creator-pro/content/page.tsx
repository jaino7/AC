"use client";

import { useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  description: string;
  cover: string;
  isLocked?: boolean;
  unlockPrice?: string;
};

const posts: Post[] = [
  {
    id: "1",
    title: "シークレットプロジェクト公開",
    description: "このコンテンツはVIPメンバー限定です。",
    cover: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=600&q=80",
    isLocked: true,
    unlockPrice: "¥500"
  },
  {
    id: "2",
    title: "スタジオアップグレード: 新しい85mmレンズ",
    description: "最新のレンズを手に入れました。ボケ味が素晴らしいです...",
    cover: "https://images.unsplash.com/photo-1606921231106-f1083329a65c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "3",
    title: "3月のQ&A: デザインに関する質問に回答",
    description: "",
    cover: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "4",
    title: "ネオンドリームス - 壁紙パック",
    description: "デジタルダウンロード • 4K解像度",
    cover: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=600&q=80",
    unlockPrice: "¥1,200"
  },
  {
    id: "5",
    title: "コミュニティガイドラインの更新",
    description: "皆さん、こんにちは！限定コンテンツのリクエストについて、今後の対応方法を更新しました。リクエストを優先的に処理するため、添付の完全な文書をお読みください。",
    cover: ""
  },
  {
    id: "6",
    title: "RAWファイル: マウンテントリップ",
    description: "ダイヤモンドティア限定アクセス。",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80",
    isLocked: true
  }
];

type TabType = "all" | "exclusive" | "public" | "saved";

export default function CreatorProContentPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-white">
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-800 bg-[#0d1117] p-6">
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
                C
              </div>
              <span className="text-lg font-semibold">Creator</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
                ログイン
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                新規登録
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="border-b border-gray-800 bg-[#0d1117] px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 text-sm font-semibold ${activeTab === "all"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              すべての投稿
            </button>
            <button
              onClick={() => setActiveTab("exclusive")}
              className={`px-4 py-3 text-sm font-semibold ${activeTab === "exclusive"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              限定
            </button>
            <button
              onClick={() => setActiveTab("public")}
              className={`px-4 py-3 text-sm font-semibold ${activeTab === "public"
                ? "border-b-2 border-blue-600 text-blue-500"
                : "text-gray-400 hover:text-white"
                }`}
            >
              公開
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-3 text-sm font-semibold ${activeTab === "saved"
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
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/creator-pro/content/${post.id}`}
                className="group overflow-hidden rounded-xl bg-[#161b22] transition hover:bg-[#1c2128]"
              >
                {post.cover && (
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
                )}
                {/* Pinned Announcement */}
                {!post.cover && (
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
                    <p className="mb-3 text-sm text-gray-400">{post.description}</p>
                  )}
                  {post.unlockPrice && (
                    <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold hover:bg-blue-700">
                      {post.unlockPrice}でアンロック
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-1">
              <button className="h-2 w-2 rounded-full bg-blue-600"></button>
              <button className="h-2 w-2 rounded-full bg-gray-700 hover:bg-gray-600"></button>
              <button className="h-2 w-2 rounded-full bg-gray-700 hover:bg-gray-600"></button>
            </div>
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
