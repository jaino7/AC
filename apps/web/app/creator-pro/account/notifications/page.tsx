"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface CreatorProNotificationsPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function CreatorProNotificationsPage({ handle: propHandle, displayName, logoUrl }: CreatorProNotificationsPageProps = {}) {
    const searchParams = useSearchParams();
    const handle = propHandle || searchParams.get("handle");

    const baseUrl = handle ? `/${handle}/account` : "/creator-pro/account";
    const contentUrl = handle ? `/${handle}/content` : "/creator-pro/content";
    const logoutUrl = handle ? `/${handle}/content` : "/creator-pro/login";

    const sidebarLinks = [
        { label: "アカウント情報", icon: "👤", href: baseUrl },
        { label: "プランと支払い", icon: "💳", href: `${baseUrl}/billing` },
        { label: "セキュリティ", icon: "🛡", href: `${baseUrl}/security` },
        { label: "通知", icon: "🔔", href: `${baseUrl}/notifications`, active: true },
    ];

    const [notifications, setNotifications] = useState({
        newContent: true,
        updates: true,
        campaigns: false,
    });

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-[#04090f] text-white">
            <header className="border-b border-white/5 bg-[#070f18]">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
                    <Link
                        href={contentUrl}
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
                            U
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
                            onClick={() => signOut({ callbackUrl: logoutUrl })}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/5"
                        >
                            <span>↩︎</span>
                            ログアウト
                        </button>
                    </nav>
                </aside>

                <section className="flex-1 rounded-3xl border border-white/5 bg-[#070f18] p-8">
                    <h1 className="text-2xl font-semibold">通知設定</h1>
                    <p className="mt-4 text-white/60">通知を受け取る項目を選択してください。</p>

                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between rounded-2xl bg-[#0c1621] p-6">
                            <div>
                                <p className="font-semibold">新作の作品</p>
                                <p className="text-sm text-white/60">新しい作品が公開されたときに通知を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("newContent")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.newContent ? "bg-cyan-500" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.newContent ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-[#0c1621] p-6">
                            <div>
                                <p className="font-semibold">機能とアップデート</p>
                                <p className="text-sm text-white/60">新機能やアップデート情報を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("updates")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.updates ? "bg-cyan-500" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.updates ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl bg-[#0c1621] p-6">
                            <div>
                                <p className="font-semibold">キャンペーン</p>
                                <p className="text-sm text-white/60">お得なキャンペーン情報を受け取ります。</p>
                            </div>
                            <button
                                onClick={() => toggleNotification("campaigns")}
                                className={`relative h-7 w-12 rounded-full transition-colors ${notifications.campaigns ? "bg-cyan-500" : "bg-white/10"}`}
                            >
                                <span
                                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${notifications.campaigns ? "translate-x-5" : ""}`}
                                />
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
