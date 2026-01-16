"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

const sidebarLinks = [
    { label: "アカウント情報", icon: "👤", href: "/neon-pro/account" },
    { label: "プランと支払い", icon: "💳", href: "/neon-pro/account/billing" },
    { label: "セキュリティ", icon: "🛡", href: "/neon-pro/account/security", active: true },
    { label: "通知", icon: "🔔", href: "/neon-pro/account/notifications" },
];

export default function NeonProSecurityPage() {
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
                            <span role="img" aria-label="avatar">
                                👤
                            </span>
                        </div>
                        <div>
                            <p className="text-base font-semibold">ユーザー名</p>
                            <p className="text-sm text-white/60">user@example.com</p>
                        </div>
                    </div>

                    <nav className="mt-6 space-y-3">
                        {sidebarLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${link.active ? "bg-[#122048] text-cyan-200" : "text-white/70 hover:bg-white/5"
                                    }`}
                            >
                                {link.icon} {link.label}
                            </Link>
                        ))}
                    </nav>

                    <button
                        onClick={() => signOut({ callbackUrl: "/neon-pro/login" })}
                        className="mt-10 flex w-full items-center gap-3 rounded-2xl border border-white/15 px-4 py-3 text-sm text-white/70 hover:text-white"
                    >
                        ↩︎ ログアウト
                    </button>
                </aside>

                <section className="flex-1 rounded-3xl border border-white/10 bg-[#0d1430] p-8">
                    <h1 className="text-2xl font-semibold">セキュリティ</h1>

                    <div className="mt-8 space-y-6">
                        {/* メールアドレス */}
                        <div className="rounded-2xl border border-white/10 bg-[#141b3c] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/60">メールアドレス</p>
                                    <p className="mt-2 text-base font-semibold">user@example.com</p>
                                </div>
                                <button className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                                    メールアドレスを変更
                                </button>
                            </div>
                        </div>

                        {/* パスワード */}
                        <div className="rounded-2xl border border-white/10 bg-[#141b3c] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/60">パスワード</p>
                                    <p className="mt-2 text-base font-semibold">••••••••</p>
                                </div>
                                <button className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                                    パスワードを変更
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
