"use client";

import { VelvetProAccountForm } from "./account-form";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef } from "react";

export default function VelvetProAccountPage() {
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
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : null}
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
        <h1 className="text-3xl font-semibold">アカウント設定</h1>

        <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
          <Link href="/velvet-pro/account" className="border-b-2 border-yellow-400 pb-2 text-white">アカウント情報</Link>
          <Link href="/velvet-pro/account/billing" className="pb-2 hover:text-white">プランとお支払い</Link>
          <Link href="/velvet-pro/account/security" className="pb-2 hover:text-white">セキュリティ</Link>
          <Link href="/velvet-pro/account/notifications" className="pb-2 hover:text-white">通知</Link>
        </div>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-[#151316] p-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="h-20 w-20 rounded-full border-4 border-yellow-400 bg-[#f3d7a0] overflow-hidden flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <p className="text-lg font-semibold">プロフィール画像</p>
              <p className="text-sm text-white/70">JPG, GIF, PNG. 最大1MB.</p>
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
                className="ml-auto rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                画像をアップロード
              </button>
            </div>
          </div>

          <VelvetProAccountForm />
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
