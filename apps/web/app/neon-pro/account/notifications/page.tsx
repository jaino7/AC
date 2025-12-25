"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const sidebarLinks = [
    { label: "アカウント情報", icon: "👤", href: "/neon-pro/account" },
    { label: "プラン＆支払い", icon: "💳", href: "/neon-pro/account/billing" },
    { label: "セキュリティ", icon: "🛡", href: "/neon-pro/account/security" },
    { label: "通知", icon: "🔔", href: "/neon-pro/account/notifications", active: true },
];

export default function NeonProNotificationsPage() {
    const [newContent, setNewContent] = useState(true);
    const [updates, setUpdates] = useState(true);
    const [campaigns, setCampaigns] = useState(false);

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
                    <h1 className="text-2xl font-semibold">通知設定</h1>

                    <div className="mt-8 space-y-6">
                        {/* 新しいコンテンツ */}
                        <div className="rounded-2xl border border-white/10 bg-[#141b3c] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-base font-semibold">新しいコンテンツ</p>
                                    <p className="mt-1 text-sm text-white/60">新しいコンテンツが投稿されたときに通知を受け取る</p>
                                </div>
                                <button
                                    onClick={() => setNewContent(!newContent)}
                                    className={`relative h-7 w-12 rounded-full transition ${newContent ? "bg-cyan-400" : "bg-white/20"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${newContent ? "right-1" : "left-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* アップデート */}
                        <div className="rounded-2xl border border-white/10 bg-[#141b3c] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-base font-semibold">アップデート</p>
                                    <p className="mt-1 text-sm text-white/60">重要なお知らせやアップデート情報を受け取る</p>
                                </div>
                                <button
                                    onClick={() => setUpdates(!updates)}
                                    className={`relative h-7 w-12 rounded-full transition ${updates ? "bg-cyan-400" : "bg-white/20"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${updates ? "right-1" : "left-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* キャンペーン */}
                        <div className="rounded-2xl border border-white/10 bg-[#141b3c] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-base font-semibold">キャンペーン</p>
                                    <p className="mt-1 text-sm text-white/60">特別なキャンペーンやプロモーション情報を受け取る</p>
                                </div>
                                <button
                                    onClick={() => setCampaigns(!campaigns)}
                                    className={`relative h-7 w-12 rounded-full transition ${campaigns ? "bg-cyan-400" : "bg-white/20"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${campaigns ? "right-1" : "left-1"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
