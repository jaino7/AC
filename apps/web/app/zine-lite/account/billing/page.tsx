"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ZineLiteBillingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-black">
              Z
            </span>
            Zine Lite
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center gap-3 text-sm">
            <div className="h-9 w-9 rounded-full bg-green-600 overflow-hidden flex items-center justify-center">
              <span className="text-sm text-black">👤</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/zine-lite/login" })}
              className="text-sm text-white/70 hover:text-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Link
          href="/zine-lite/content"
          className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 mb-6 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-semibold">プランとお支払い</h1>
        <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
          <Link href="/zine-lite/account" className="pb-2 hover:text-white">アカウント情報</Link>
          <Link href="/zine-lite/account/billing" className="border-b-2 border-green-400 pb-2 text-white">プランとお支払い</Link>
          <Link href="/zine-lite/account/security" className="pb-2 hover:text-white">セキュリティ</Link>
          <Link href="/zine-lite/account/notifications" className="pb-2 hover:text-white">通知</Link>
        </div>

        <section className="mt-8 space-y-6 rounded-[24px] border border-white/10 bg-[#111111] p-8">
          <h2 className="text-xl font-semibold">現在のプラン</h2>

          <div className="mt-6 rounded-2xl bg-black border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Lite プラン</p>
                <p className="mt-1 text-sm text-white/60">月額 ¥980</p>
              </div>
              <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-400">
                有効
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <button className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">
              プランを変更
            </button>
            <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
              お支払い方法の設定
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-white/10 bg-black/80 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-white/40">
          <p>©CocoBa</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-green-400">
              利用規約
            </a>
            <a href="#" className="hover:text-green-400">
              プライバシーポリシー
            </a>
            <a href="#" className="hover:text-green-400">
              特定商取引法に基づく表記
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
