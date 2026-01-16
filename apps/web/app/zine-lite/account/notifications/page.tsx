"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function ZineLiteNotificationsPage() {
    const [notifications, setNotifications] = useState({
        newContent: true,
        updates: true,
        campaigns: false,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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
                <h1 className="text-3xl font-semibold">通知設定</h1>
                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
                    <Link href="/zine-lite/account" className="pb-2 hover:text-white">アカウント情報</Link>
                    <Link href="/zine-lite/account/billing" className="pb-2 hover:text-white">プランとお支払い</Link>
                    <Link href="/zine-lite/account/security" className="pb-2 hover:text-white">セキュリティ</Link>
                    <Link href="/zine-lite/account/notifications" className="border-b-2 border-green-400 pb-2 text-white">通知</Link>
                </div>

                <section className="mt-8 space-y-6 rounded-[24px] border border-white/10 bg-[#111111] p-8">
                    <h2 className="text-xl font-semibold">通知設定</h2>
                    <p className="mt-2 text-white/60">通知を受け取る項目を選択してください。</p>

                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between rounded-2xl bg-black border border-white/10 p-6">
                            <div>
                                <p className="font-semibold">新作の作品</p>
                                <p className="text-sm text-white/60">新しい作品が公開されたときに通知を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("newContent")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.newContent ? "bg-green-500" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.newContent ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-black border border-white/10 p-6">
                            <div>
                                <p className="font-semibold">機能とアップデート</p>
                                <p className="text-sm text-white/60">新機能やアップデート情報を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("updates")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.updates ? "bg-green-500" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.updates ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-black border border-white/10 p-6">
                            <div>
                                <p className="font-semibold">キャンペーン</p>
                                <p className="text-sm text-white/60">お得なキャンペーン情報を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("campaigns")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.campaigns ? "bg-green-500" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.campaigns ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>
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
