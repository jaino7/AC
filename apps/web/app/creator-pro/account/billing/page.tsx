"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const sidebarLinks = [
  { label: "アカウント情報", icon: "👤", href: "/creator-pro/account" },
  { label: "プランと支払い", icon: "💳", href: "/creator-pro/account/billing", active: true },
  { label: "セキュリティ", icon: "🛡", href: "/creator-pro/account/security" },
  { label: "通知", icon: "🔔", href: "/creator-pro/account/notifications" },
];

export default function CreatorProBillingPage() {
  // Image preview state is not needed here unless we want to show the avatar in sidebar too.
  // For consistency, let's keep the sidebar static or use a placeholder if we don't have global state.
  // The user asked for the sidebar to be the same.
  // Ideally we should fetch the user profile or use a context, but for now I'll use the static placeholder
  // or the same logic as account page (which uses local state for preview, so it won't persist across pages without a backend/context).
  // I will use the static placeholder "U" or similar for now as I can't easily share state without a provider.

  return (
    <div className="min-h-screen bg-[#04090f] text-white">
      <header className="border-b border-white/5 bg-[#070f18]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
          <Link href="/creator-pro/content" className="flex items-center gap-2 text-white/70 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </header>
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl gap-8 px-4 py-12">
        <aside className="w-full max-w-xs rounded-3xl border border-white/5 bg-[#070f18] p-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#f0c27b] to-[#e6a757] text-xl font-semibold text-[#37220a] overflow-hidden">
              U
            </div>
            <div>
              <p className="text-base font-semibold">User Name</p>
              <p className="text-sm text-white/60">user@email.com</p>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${link.active ? "bg-[#0d1f2f] text-cyan-200" : "text-white/70 hover:bg-white/5"
                  }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/creator-pro/login" })}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5"
            >
              <span>↩︎</span>
              ログアウト
            </button>
          </nav>
        </aside>

        <section className="flex-1 rounded-3xl border border-white/5 bg-[#070f18] p-8">
          <h1 className="text-2xl font-semibold">プランとお支払い</h1>

          <div className="mt-8 space-y-6">
            {/* 現在のプラン */}
            <div className="rounded-2xl border border-white/10 bg-[#0c1621] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">現在のプラン</p>
                  <p className="mt-2 text-2xl font-semibold text-cyan-400">Pro</p>
                  <p className="mt-1 text-sm text-white/60">月額 ¥1,980</p>
                </div>
                <Link
                  href="/creator-pro/account/change-plan"
                  className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  プランを変更
                </Link>
              </div>
            </div>

            {/* お支払い方法 */}
            <div className="rounded-2xl border border-white/10 bg-[#0c1621] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">お支払い方法</p>
                  <p className="mt-2 text-base font-semibold">•••• •••• •••• 4242</p>
                  <p className="mt-1 text-sm text-white/60">有効期限: 12/2025</p>
                </div>
                <button className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                  お支払い方法を変更
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
