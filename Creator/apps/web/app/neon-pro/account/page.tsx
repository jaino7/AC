"use client";

import { NeonProAccountForm } from "./account-form";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef } from "react";

export default function NeonProAccountPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d24] text-white">
      <header className="border-b border-white/10 bg-[#0d1430]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
          <Link href="/neon-pro/content" className="flex items-center gap-2 text-white/70 hover:text-cyan-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </header>
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl gap-8 px-4 py-12">
        <aside className="w-full max-w-xs rounded-3xl border border-white/10 bg-[#0d1430] p-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="h-12 w-12 rounded-full border border-cyan-400/50 bg-cyan-500/10 text-2xl text-cyan-200 overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span role="img" aria-label="avatar">
                  👤
                </span>
              )}
            </div>
            <div>
              <p className="text-base font-semibold">ユーザー名</p>
              <p className="text-sm text-white/60">user@example.com</p>
            </div>
          </div>

          <nav className="mt-6 space-y-3">
            <Link href="/neon-pro/account" className="flex w-full items-center gap-3 rounded-2xl bg-[#122048] px-4 py-3 text-left text-sm font-semibold text-cyan-200">
              👤 アカウント情報
            </Link>
            <Link href="/neon-pro/account/billing" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-white/70 hover:bg-white/5">
              💳 プラン＆支払い
            </Link>
            <Link href="/neon-pro/account/security" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-white/70 hover:bg-white/5">
              🛡 セキュリティ
            </Link>
            <Link href="/neon-pro/account/notifications" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-white/70 hover:bg-white/5">
              🔔 通知
            </Link>
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: "/neon-pro/login" })}
            className="mt-10 flex w-full items-center gap-3 rounded-2xl border border-white/15 px-4 py-3 text-sm text-white/70 hover:text-white"
          >
            ↩︎ ログアウト
          </button>
        </aside>

        <section className="flex-1 rounded-3xl border border-white/10 bg-[#0d1430] p-8">
          <header className="border-b border-white/10 pb-6">
            <h1 className="text-3xl font-semibold">アカウント情報</h1>
            <p className="mt-2 text-sm text-white/70">プロフィール情報を編集します。</p>
          </header>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#141b3c] p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-3xl text-cyan-200 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  "👤"
                )}
              </div>
              <div>
                <p className="text-lg font-semibold">プロフィール画像</p>
                <p className="text-sm text-white/60">JPG, GIF, PNG. 最大5MB。</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
              >
                画像をアップロード
              </button>
            </div>
          </div>

          <NeonProAccountForm />
        </section>
      </div>
    </div>
  );
}

