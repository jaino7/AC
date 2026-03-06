"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrandAssetsSettings from "@/components/BrandAssetsSettings";

type Tab = "profile" | "brand" | "plans" | "notifications" | "domain";

const tabs = [
    { id: "profile" as Tab, icon: "👤", label: "プロフィール" },
    { id: "brand" as Tab, icon: "🎨", label: "ブランド" },
    { id: "plans" as Tab, icon: "💳", label: "プラン" },
    { id: "notifications" as Tab, icon: "🔔", label: "通知" },
    { id: "domain" as Tab, icon: "🌐", label: "ドメイン設定" }
];

export default function SettingsContent() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [maintenanceNotification, setMaintenanceNotification] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [creatorId, setCreatorId] = useState<string>("");
    const [initialAvatarUrl, setInitialAvatarUrl] = useState<string | null>(null);
    const [initialLogoUrl, setInitialLogoUrl] = useState<string | null>(null);
    const [initialFaviconUrl, setInitialFaviconUrl] = useState<string | null>(null);
    const [initialShowNameInHeader, setInitialShowNameInHeader] = useState<boolean>(true);

    useEffect(() => {
        fetch("/api/creators/subscription")
            .then((r) => r.json())
            .then((d) => { if (d.subscription) setSubscription(d.subscription); })
            .catch(() => { });

        fetch("/api/creators/profile")
            .then((r) => r.json())
            .then((d) => {
                if (d.profile) {
                    setCreatorId(d.profile.id);
                    setInitialAvatarUrl(d.profile.avatarUrl ?? null);
                    setInitialLogoUrl(d.profile.logoUrl ?? null);
                    setInitialFaviconUrl(d.profile.faviconUrl ?? null);
                    setInitialShowNameInHeader((d.profile.themeConfig as any)?.showNameInHeader ?? true);
                }
            })
            .catch(() => { });
    }, []);

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-10 text-black lg:px-12">
            <div className="mx-auto max-w-7xl">
                {/* ページヘッダー */}
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold">設定</h1>
                </header>

                <div className="flex gap-8">
                    {/* 左サイドタブナビゲーション */}
                    <aside className="w-64 flex-shrink-0">
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-white text-neutral-700 hover:bg-neutral-100"
                                        }`}
                                >
                                    <span className="text-xl">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* メインコンテンツエリア */}
                    <div className="flex-1 space-y-6">
                        {activeTab === "profile" && (
                            <>
                                {/* Basic Info */}
                                <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                    <h2 className="mb-6 text-xl font-semibold">プロフィール</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="displayName" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                表示名
                                            </label>
                                            <input
                                                id="displayName"
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-neutral-700">
                                                自己紹介
                                            </label>
                                            <textarea
                                                id="bio"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={5}
                                                className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button className="rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                                            変更する
                                        </button>
                                    </div>
                                </section>
                            </>
                        )}

                        {activeTab === "brand" && (
                            creatorId ? (
                                <BrandAssetsSettings
                                    creatorId={creatorId}
                                    initialAvatarUrl={initialAvatarUrl}
                                    initialLogoUrl={initialLogoUrl}
                                    initialFaviconUrl={initialFaviconUrl}
                                    initialShowNameInHeader={initialShowNameInHeader}
                                />
                            ) : (
                                <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-neutral-400">読み込み中...</div>
                                    </div>
                                </section>
                            )
                        )}

                        {activeTab === "plans" && (
                            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <h2 className="mb-6 text-xl font-semibold">プランの詳細</h2>

                                <div className="space-y-4">
                                    {/* Current Plan */}
                                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-neutral-50 p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-neutral-700">現在のプラン</span>
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                {subscription?.plan?.name ?? "無料プラン"}
                                            </span>
                                            {subscription?.status === "ACTIVE" && subscription?.nextBillingDate && (
                                                <span className="text-xs text-neutral-500">
                                                    次回更新: {new Date(subscription.nextBillingDate).toLocaleDateString("ja-JP")}
                                                </span>
                                            )}
                                        </div>
                                        <Link href="/creators/pricing">
                                            <button className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">
                                                プランを変更する
                                            </button>
                                        </Link>
                                    </div>

                                    {/* Prepaid Balance */}
                                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-neutral-50 p-6">
                                        <div>
                                            <span className="text-sm font-semibold text-neutral-700">プリペイド残高</span>
                                            <p className="mt-1 text-2xl font-bold text-blue-600">
                                                ¥{(subscription?.billingBalance ?? 0).toLocaleString()}
                                            </p>
                                            <p className="mt-1 text-xs text-neutral-500">
                                                プラン額以上の残高があると、更新日に自動引き落としされます
                                            </p>
                                        </div>
                                    </div>

                                    {/* Terms Link */}
                                    <p className="text-sm text-neutral-600">
                                        <a href="/terms/creators" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            利用規約
                                        </a>
                                        {" "}と{" "}
                                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            プライバシーポリシー
                                        </a>
                                        をご確認ください
                                    </p>
                                </div>
                            </section>
                        )}

                        {activeTab === "notifications" && (
                            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <h2 className="mb-6 text-xl font-semibold">メール受信を設定</h2>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="maintenance"
                                            checked={maintenanceNotification}
                                            onChange={(e) => setMaintenanceNotification(e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="maintenance" className="text-sm text-neutral-700">
                                            機能更新・メンテナンス
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button className="rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                                        変更する
                                    </button>
                                </div>
                            </section>
                        )}

                        {activeTab === "domain" && (
                            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                                        <span className="text-4xl">🌐</span>
                                    </div>
                                    <h2 className="mb-3 text-2xl font-semibold text-neutral-900">独自ドメイン設定</h2>
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        近日リリース予定
                                    </div>
                                    <p className="max-w-md text-sm leading-relaxed text-neutral-600">
                                        独自ドメインを接続して、プロフェッショナルなサイトを運営できる機能を準備中です。
                                        リリースまでもうしばらくお待ちください。
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
