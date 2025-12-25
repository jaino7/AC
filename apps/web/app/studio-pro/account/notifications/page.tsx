"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function StudioProNotificationsPage() {
    const [notifications, setNotifications] = useState({
        newContent: true,
        updates: true,
        campaigns: false,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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
                    <div className="flex items-center gap-4">
                        <button className="rounded-full border border-white/20 px-4 py-2">🌙</button>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#fddcc3] to-[#fcb69f] overflow-hidden">
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/studio-pro/login" })}
                            className="text-white/60 hover:text-white"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-10">
                <h1 className="text-3xl font-semibold">通知設定</h1>

                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
                    <Link href="/studio-pro/account" className="pb-2 hover:text-white">アカウント情報</Link>
                    <Link href="/studio-pro/account/billing" className="pb-2 hover:text-white">プランと支払い</Link>
                    <Link href="/studio-pro/account/security" className="pb-2 hover:text-white">セキュリティ</Link>
                    <Link href="/studio-pro/account/notifications" className="border-b-2 border-[#2f6dff] pb-2 text-white">通知</Link>
                </div>

                <section className="mt-8 rounded-[32px] border border-white/10 bg-[#070e1e] p-8">
                    <h2 className="text-xl font-semibold">通知設定</h2>
                    <p className="mt-2 text-white/60">通知を受け取る項目を選択してください。</p>

                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between rounded-2xl bg-[#030814] p-6 border border-white/5">
                            <div>
                                <p className="font-semibold">新作の作品</p>
                                <p className="text-sm text-white/60">新しい作品が公開されたときに通知を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("newContent")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.newContent ? "bg-[#2f6dff]" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.newContent ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-[#030814] p-6 border border-white/5">
                            <div>
                                <p className="font-semibold">機能とアップデート</p>
                                <p className="text-sm text-white/60">新機能やアップデート情報を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("updates")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.updates ? "bg-[#2f6dff]" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.updates ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-[#030814] p-6 border border-white/5">
                            <div>
                                <p className="font-semibold">キャンペーン</p>
                                <p className="text-sm text-white/60">お得なキャンペーン情報を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("campaigns")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.campaigns ? "bg-[#2f6dff]" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.campaigns ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>
                    </div>
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
