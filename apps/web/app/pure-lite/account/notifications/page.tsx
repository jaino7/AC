"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function PureLiteNotificationsPage() {
    const [isLoggedIn] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [newContent, setNewContent] = useState(true);
    const [updates, setUpdates] = useState(true);
    const [campaigns, setCampaigns] = useState(false);

    return (
        <div className="min-h-screen bg-[#f5f3f8] text-[#1f1f22]">
            {/* Top Bar - Unified with content page */}
            <header className="border-b border-black/5 bg-white">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2 text-lg font-semibold text-[#7c5dfa]">
                        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#edeaff]">P</span>
                        Pure Lite
                    </div>

                    {/* Right Side: User Menu */}
                    <div className="flex items-center gap-3 text-sm">
                        {isLoggedIn && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5dfa] to-[#9b8aff] text-sm font-semibold text-white hover:opacity-90"
                                >
                                    JP
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-black/10 bg-white py-2 shadow-xl">
                                        <button className="w-full px-4 py-2 text-left text-sm text-[#4b4b58] hover:bg-[#7c5dfa]/5 hover:text-[#1f1f22]">
                                            設定
                                        </button>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/pure-lite/login" })}
                                            className="w-full px-4 py-2 text-left text-sm text-[#4b4b58] hover:bg-[#7c5dfa]/5 hover:text-[#1f1f22]"
                                        >
                                            ログアウト
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-4 py-10">
                <h1 className="text-3xl font-semibold">通知設定</h1>

                <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-[#8c8c99]">
                    <Link href="/pure-lite/account" className="pb-2 hover:text-[#1f1f22]">アカウント情報</Link>
                    <Link href="/pure-lite/account/billing" className="pb-2 hover:text-[#1f1f22]">プラン＆支払い</Link>
                    <Link href="/pure-lite/account/security" className="pb-2 hover:text-[#1f1f22]">セキュリティ</Link>
                    <Link href="/pure-lite/account/notifications" className="border-b-2 border-[#7c5dfa] pb-2 text-[#1f1f22]">通知</Link>
                </div>

                <section className="mt-6 space-y-6">
                    {/* 新しいコンテンツ */}
                    <div className="rounded-[30px] border border-black/5 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-semibold">新しいコンテンツ</p>
                                <p className="mt-1 text-sm text-[#8d8d9a]">新しいコンテンツが投稿されたときに通知を受け取る</p>
                            </div>
                            <button
                                onClick={() => setNewContent(!newContent)}
                                className={`relative h-7 w-12 rounded-full transition ${newContent ? "bg-[#7c5dfa]" : "bg-[#e4e4e9]"
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
                    <div className="rounded-[30px] border border-black/5 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-semibold">アップデート</p>
                                <p className="mt-1 text-sm text-[#8d8d9a]">重要なお知らせやアップデート情報を受け取る</p>
                            </div>
                            <button
                                onClick={() => setUpdates(!updates)}
                                className={`relative h-7 w-12 rounded-full transition ${updates ? "bg-[#7c5dfa]" : "bg-[#e4e4e9]"
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
                    <div className="rounded-[30px] border border-black/5 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-semibold">キャンペーン</p>
                                <p className="mt-1 text-sm text-[#8d8d9a]">特別なキャンペーンやプロモーション情報を受け取る</p>
                            </div>
                            <button
                                onClick={() => setCampaigns(!campaigns)}
                                className={`relative h-7 w-12 rounded-full transition ${campaigns ? "bg-[#7c5dfa]" : "bg-[#e4e4e9]"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${campaigns ? "right-1" : "left-1"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
