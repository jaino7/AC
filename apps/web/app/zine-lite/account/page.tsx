"use client";

import { ZineLiteAccountForm } from "./account-form";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

interface ZineLiteAccountPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function ZineLiteAccountPage({ handle: propHandle, displayName, logoUrl }: ZineLiteAccountPageProps = {}) {
  const searchParams = useSearchParams();
  const handle = propHandle || searchParams.get("handle");

  // 動的なリンク生成
  const baseUrl = handle ? `/${handle}/account` : "/zine-lite/account";
  const contentUrl = handle ? `/${handle}/content` : "/zine-lite/content";
  const logoutUrl = handle ? `/${handle}/content` : "/zine-lite/login";

  const [imagePreview, setImagePreview] = useState<string | null>(logoUrl || null);
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
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-black">👤</span>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: logoutUrl })}
              className="text-sm text-white/70 hover:text-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <Link
          href={contentUrl}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 mb-6 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl font-semibold">アカウント設定</h1>
        <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
          <Link href={baseUrl} className="border-b-2 border-green-400 pb-2 text-white">アカウント情報</Link>
          <Link href={`${baseUrl}/billing`} className="pb-2 hover:text-white">プランとお支払い</Link>
          <Link href={`${baseUrl}/security`} className="pb-2 hover:text-white">セキュリティ</Link>
          <Link href={`${baseUrl}/notifications`} className="pb-2 hover:text-white">通知</Link>
        </div>

        <section className="mt-8 space-y-6 rounded-[24px] border border-white/10 bg-[#111111] p-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="h-20 w-20 rounded-2xl overflow-hidden flex items-center justify-center bg-[#f8d7c6]">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <p className="text-lg font-semibold">プロフィール画像</p>
              <p className="text-sm text-white/60">JPG, GIF, PNG. 最大1MB.</p>
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
                className="rounded-full border border-green-400 px-4 py-2 text-sm text-green-400 hover:bg-green-400/10"
              >
                画像をアップロード
              </button>
            </div>
          </div>

          <ZineLiteAccountForm />
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
