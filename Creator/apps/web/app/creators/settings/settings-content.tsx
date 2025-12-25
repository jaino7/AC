"use client";

import { useState } from "react";

type Tab = "profile" | "plans" | "notifications" | "domain";

const tabs = [
    { id: "profile" as Tab, icon: "👤", label: "プロフィール" },
    { id: "plans" as Tab, icon: "💳", label: "プラン" },
    { id: "notifications" as Tab, icon: "🔔", label: "通知" },
    { id: "domain" as Tab, icon: "🌐", label: "ドメイン設定" }
];

export default function SettingsContent() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [maintenanceNotification, setMaintenanceNotification] = useState(true);

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

                        {activeTab === "plans" && (
                            <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <h2 className="mb-6 text-xl font-semibold">プランの詳細</h2>

                                <div className="space-y-6">
                                    {/* Trial Status */}
                                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-neutral-50 p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-neutral-700">トライアル</span>
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                残り3日
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="text-sm font-semibold text-pink-600 transition-colors hover:text-pink-700">
                                                トライアルをキャンセルする
                                            </button>
                                            <button className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">
                                                プランを選択する
                                            </button>
                                        </div>
                                    </div>

                                    {/* Terms Link */}
                                    <p className="text-sm">
                                        <a href="#" className="text-blue-600 hover:underline">
                                            利用規約とプライバシーポリシーをご確認ください
                                        </a>
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
                                <h2 className="mb-2 text-2xl font-semibold">独自ドメイン設定</h2>
                                <p className="mb-6 text-sm text-gray-600">
                                    独自ドメインを接続して、プロフェッショナルなサイトを運営できます。
                                </p>

                                <button className="mb-8 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                    新しいドメインを追加
                                </button>

                                {/* DNS設定手順 */}
                                <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                                    <h3 className="mb-3 text-sm font-semibold text-blue-900">DNS設定手順</h3>
                                    <ol className="space-y-2 text-sm text-blue-800">
                                        <li>1. 上記のボタンからドメインを追加</li>
                                        <li>2. 表示されるDNSレコードをドメインプロバイダーで設定</li>
                                        <li>3. 「検証」ボタンをクリックして確認</li>
                                        <li>4. 検証が完了すると、ドメインが有効になります</li>
                                    </ol>
                                </div>

                                {/* 検索入力 */}
                                <div className="mb-6">
                                    <input
                                        type="text"
                                        placeholder="ドメインを検索"
                                        className="w-full rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm focus:border-black/40 focus:outline-none"
                                    />
                                </div>

                                {/* ドメイン一覧 */}
                                <div className="space-y-4">
                                    {/* サンプルドメイン1 - 有効 */}
                                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="text-sm font-semibold text-black">example.com</span>
                                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                                    有効
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">プライマリードメイン</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700">
                                                削除
                                            </button>
                                        </div>
                                    </div>

                                    {/* サンプルドメイン2 - 検証待ち */}
                                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="text-sm font-semibold text-black">www.my-creator-site.com</span>
                                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                                                    検証待ち
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600">DNS設定を確認してください</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                                検証
                                            </button>
                                            <button className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700">
                                                削除
                                            </button>
                                        </div>
                                    </div>

                                    {/* サンプルドメイン3 - 検証失敗 */}
                                    <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4">
                                        <div>
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="text-sm font-semibold text-black">shop.my-brand.com</span>
                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                    検証失敗
                                                </span>
                                            </div>
                                            <p className="text-xs text-red-600">DNSレコードが見つかりません</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                                                再検証
                                            </button>
                                            <button className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700">
                                                削除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
