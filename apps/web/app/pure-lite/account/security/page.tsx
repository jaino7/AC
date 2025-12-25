"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function PureLiteSecurityPage() {
    const [isLoggedIn] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

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
                <h1 className="text-3xl font-semibold">セキュリティ</h1>

                <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-[#8c8c99]">
                    <Link href="/pure-lite/account" className="pb-2 hover:text-[#1f1f22]">アカウント情報</Link>
                    <Link href="/pure-lite/account/billing" className="pb-2 hover:text-[#1f1f22]">プラン＆支払い</Link>
                    <Link href="/pure-lite/account/security" className="border-b-2 border-[#7c5dfa] pb-2 text-[#1f1f22]">セキュリティ</Link>
                    <Link href="/pure-lite/account/notifications" className="pb-2 hover:text-[#1f1f22]">通知</Link>
                </div>

                <section className="mt-6 space-y-6">
                    {/* メールアドレス */}
                    <div className="rounded-[30px] border border-black/5 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#8d8d9a]">メールアドレス</p>
                                <p className="mt-2 text-base font-semibold">user@example.com</p>
                            </div>
                            <button className="rounded-full bg-[#f1f1f6] px-6 py-3 text-sm font-semibold hover:bg-[#e4e4e9]">
                                メールアドレスを変更
                            </button>
                        </div>
                    </div>

                    {/* パスワード */}
                    <div className="rounded-[30px] border border-black/5 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#8d8d9a]">パスワード</p>
                                <p className="mt-2 text-base font-semibold">••••••••</p>
                            </div>
                            <button className="rounded-full bg-[#f1f1f6] px-6 py-3 text-sm font-semibold hover:bg-[#e4e4e9]">
                                パスワードを変更
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
