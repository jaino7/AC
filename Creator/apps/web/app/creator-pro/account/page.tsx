"use client";

import { CreatorProAccountForm } from "./account-form";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef } from "react";

const sidebarLinks = [
  { label: "アカウント情報", icon: "👤", href: "/creator-pro/account", active: true },
  { label: "プラン＆支払い", icon: "💳", href: "/creator-pro/account/billing" },
  { label: "セキュリティ", icon: "🛡", href: "/creator-pro/account/security" },
  { label: "通知", icon: "🔔", href: "/creator-pro/account/notifications" },
];

export default function CreatorProAccountPage() {
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
    <div className="min-h-screen bg-[#04090f] text-white">
      <header className="border-b border-white/5 bg-[#070f18]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
          <Link
            href="/creator-pro/content"
            className="flex items-center text-white/70 transition hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                "U"
              )}
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
          <div className="border-b border-white/10 pb-6">
            <h1 className="text-2xl font-bold">アカウント情報</h1>
            <p className="mt-2 text-sm text-white/60">プロフィール情報を編集します。</p>
          </div>
          <CreatorProAccountForm />
        </section>
      </div>
    </div>
  );
}
