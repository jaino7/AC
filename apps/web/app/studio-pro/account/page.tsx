"use client";

import { StudioProAccountForm } from "./account-form";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

interface StudioProAccountPageProps {
  handle?: string;
  displayName?: string;
  logoUrl?: string | null;
}

export default function StudioProAccountPage({ handle: propHandle, displayName, logoUrl }: StudioProAccountPageProps = {}) {
  const searchParams = useSearchParams();
  const handle = propHandle || searchParams.get("handle");

  // 動的なリンク生成
  const baseUrl = handle ? `/${handle}/account` : "/studio-pro/account";
  const contentUrl = handle ? `/${handle}/content` : "/studio-pro/content";
  const logoutUrl = handle ? `/${handle}/content` : "/studio-pro/login";

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
    <div className="min-h-screen bg-[#030814] text-white">
      <header className="border-b border-white/10 bg-[#040a18]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
          {/* Logo */}
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#2f6dff] text-white">
              S
            </span>
            Studio Pro
          </div>

          {/* Right Side: User Menu */}
          <div className="flex items-center gap-3 text-sm">
            <button className="rounded-full border border-white/20 px-4 py-2">🌙</button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#fddcc3] to-[#fcb69f] overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: logoutUrl })}
              className="text-white/60 hover:text-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-semibold">アカウント設定</h1>

        <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
          <Link href={baseUrl} className="border-b-2 border-[#2f6dff] pb-2 text-white">アカウント情報</Link>
          <Link href={`${baseUrl}/billing`} className="pb-2 hover:text-white">プラン＆支払い</Link>
          <Link href={`${baseUrl}/security`} className="pb-2 hover:text-white">セキュリティ</Link>
          <Link href={`${baseUrl}/notifications`} className="pb-2 hover:text-white">通知</Link>
        </div>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-[#070e1e] p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#f4d9c1] overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <p className="text-lg font-semibold">プロフィール画像</p>
                <p className="text-sm text-white/60">JPG, GIF, PNG. 最大1MB.</p>
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
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                画像をアップロード
              </button>
            </div>
          </div>

          <StudioProAccountForm />
        </section>
      </main>

      <footer className="mt-12 border-t border-white/10 bg-[#040a18] py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-white/40">
          <p>©CocoBa</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#2f6dff]">
              利用規約
            </a>
            <a href="#" className="hover:text-[#2f6dff]">
              プライバシーポリシー
            </a>
            <a href="#" className="hover:text-[#2f6dff]">
              特定商取引法に基づく表記
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
