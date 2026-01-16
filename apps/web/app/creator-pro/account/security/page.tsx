"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CreatorProSecurityPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function CreatorProSecurityPage({ handle: propHandle, displayName, logoUrl }: CreatorProSecurityPageProps = {}) {
    const searchParams = useSearchParams();
    const handle = propHandle || searchParams.get("handle");

    const baseUrl = handle ? `/${handle}/account` : "/creator-pro/account";
    const contentUrl = handle ? `/${handle}/content` : "/creator-pro/content";
    const logoutUrl = handle ? `/${handle}/content` : "/creator-pro/login";

    const sidebarLinks = [
        { label: "アカウント情報", icon: "👤", href: baseUrl },
        { label: "プランと支払い", icon: "💳", href: `${baseUrl}/billing` },
        { label: "セキュリティ", icon: "🛡", href: `${baseUrl}/security`, active: true },
        { label: "通知", icon: "🔔", href: `${baseUrl}/notifications` },
    ];
    return (
        <div className="min-h-screen bg-[#04090f] text-white">
            <header className="border-b border-white/5 bg-[#070f18]">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
                    <Link href={contentUrl} className="flex items-center gap-2 text-white/70 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <h1 className="text-2xl font-semibold">セキュリティ</h1>

                    <div className="mt-8 space-y-6">
                        {/* メールアドレス */}
                        <div className="rounded-2xl border border-white/10 bg-[#0c1621] p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-white/60">メールアドレス</p>
                                    <p className="mt-2 text-base font-semibold">user@email.com</p>
                                </div>
                                <button className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                                    メールアドレスを変更
                                </button>
                            </div>
                        </div>

                        {/* パスワード */}
                        <div className="rounded-2xl border border-white/10 bg-[#0c1621] p-6">
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
