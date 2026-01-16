"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function StudioProBillingPage() {
    const [isLoggedIn] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            {/* Top Bar - Unified with content page */}
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
                        {isLoggedIn && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2f6dff] to-[#5b8fff] text-sm font-semibold text-white hover:opacity-90"
                                >
                                    JP
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-white/10 bg-[#040a18] py-2 shadow-xl">
                                        <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-[#2f6dff]/10 hover:text-white">
                                            設定
                                        </button>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/studio-pro/login" })}
                                            className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-[#2f6dff]/10 hover:text-white"
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
                <h1 className="text-3xl font-semibold">プランとお支払い</h1>

                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
                    <Link href="/studio-pro/account" className="pb-2 hover:text-white">アカウント情報</Link>
                    <Link href="/studio-pro/account/billing" className="border-b-2 border-[#2f6dff] pb-2 text-white">プランと支払い</Link>
                    <Link href="/studio-pro/account/security" className="pb-2 hover:text-white">セキュリティ</Link>
                    <Link href="/studio-pro/account/notifications" className="pb-2 hover:text-white">通知</Link>
                </div>

                <section className="mt-6 space-y-6">
                    {/* 現在のプラン */}
                    <div className="rounded-[32px] border border-white/10 bg-[#070e1e] p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/60">現在のプラン</p>
                                <p className="mt-2 text-2xl font-semibold text-[#2f6dff]">Pro</p>
                                <p className="mt-1 text-sm text-white/60">月額 ¥1,980</p>
                            </div>
                            <Link
                                href="/studio-pro/account/change-plan"
                                className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                プランを変更
                            </Link>
                        </div>
                    </div>

                    {/* お支払い方法 */}
                    <div className="rounded-[32px] border border-white/10 bg-[#070e1e] p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/60">お支払い方法</p>
                                <p className="mt-2 text-base font-semibold">•••• •••• •••• 4242</p>
                                <p className="mt-1 text-sm text-white/60">有効期限: 12/2025</p>
                            </div>
                            <button className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                                お支払い方法を変更
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
