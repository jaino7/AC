"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function VelvetProBillingPage() {
  return (
    <div className="min-h-screen bg-[#0b0a0d] text-white">
      <header className="border-b border-white/10 bg-[#0c0b0f]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
          {/* Logo */}
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span className="text-yellow-400">💎</span>
            Velvet Pro
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center gap-4">
            <button className="rounded-full bg-white/10 px-3 py-2">🔔</button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ffe9b5] to-[#f4c76b] overflow-hidden">
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/velvet-pro/login" })}
              className="text-sm text-white/60 hover:text-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold">プランとお支払い</h1>

        <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
          <Link href="/velvet-pro/account" className="pb-2 hover:text-white">アカウント情報</Link>
          <Link href="/velvet-pro/account/billing" className="border-b-2 border-yellow-400 pb-2 text-white">プランとお支払い</Link>
          <Link href="/velvet-pro/account/security" className="pb-2 hover:text-white">セキュリティ</Link>
          <Link href="/velvet-pro/account/notifications" className="pb-2 hover:text-white">通知</Link>
        </div>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-[#151316] p-8">
          <h2 className="text-xl font-semibold">現在のプラン</h2>

          <div className="mt-6 rounded-2xl bg-[#0b0a0d] border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Pro プラン</p>
                <p className="mt-1 text-sm text-white/60">月額 ¥1,200</p>
              </div>
              <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold text-yellow-400">
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

      <footer className="mt-12 border-t border-white/10 bg-[#0c0b0f] py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-white/40">
          <p>©CocoBa</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-purple-400">
              利用規約
            </a>
            <a href="#" className="hover:text-purple-400">
              プライバシーポリシー
            </a>
            <a href="#" className="hover:text-purple-400">
              特定商取引法に基づく表記
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
