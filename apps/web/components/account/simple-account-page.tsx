"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

interface SimpleAccountPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
    currentPage?: "account" | "billing" | "security" | "notifications";
}

export function SimpleAccountPage({
    handle: propHandle,
    displayName,
    logoUrl,
    currentPage = "account"
}: SimpleAccountPageProps) {
    const searchParams = useSearchParams();
    const handle = propHandle || searchParams.get("handle");

    // 動的なリンク生成
    const baseUrl = handle ? `/${handle}/account` : "/account";
    const contentUrl = handle ? `/${handle}/content` : "/";
    const logoutUrl = handle ? `/${handle}/content` : "/";

    const [imagePreview, setImagePreview] = useState<string | null>(logoUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const navItems = [
        { label: "アカウント情報", path: "", key: "account" },
        { label: "プランと支払い", path: "/billing", key: "billing" },
        { label: "セキュリティ", path: "/security", key: "security" },
        { label: "通知", path: "/notifications", key: "notifications" },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                    <Link href={contentUrl} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5" />
                            <path d="M12 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium">戻る</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: logoutUrl })}
                        className="text-sm text-gray-500 hover:text-gray-900 transition"
                    >
                        ログアウト
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto w-full max-w-6xl px-4 py-10">
                <h1 className="text-2xl font-bold text-gray-900">アカウント設定</h1>

                {/* Navigation Tabs */}
                <nav className="mt-6 flex gap-6 border-b border-gray-200">
                    {navItems.map((item) => (
                        <Link
                            key={item.key}
                            href={`${baseUrl}${item.path}`}
                            className={`pb-3 text-sm font-medium transition ${currentPage === item.key
                                    ? "border-b-2 border-blue-600 text-blue-600"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Account Info Content */}
                {currentPage === "account" && (
                    <div className="mt-8 space-y-8">
                        {/* Profile Image */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-200">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-2xl font-semibold text-gray-500">
                                            {displayName?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">{displayName || "ユーザー"}</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-1 text-sm text-blue-600 hover:underline"
                                >
                                    画像を変更
                                </button>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">表示名</label>
                                <input
                                    type="text"
                                    defaultValue={displayName || ""}
                                    placeholder="表示名"
                                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                                <input
                                    type="email"
                                    placeholder="user@example.com"
                                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                                保存
                            </button>
                        </div>
                    </div>
                )}

                {/* Billing Content */}
                {currentPage === "billing" && (
                    <div className="mt-8 space-y-6">
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">現在のプラン</p>
                                    <p className="mt-1 text-xl font-semibold text-gray-900">Pro</p>
                                    <p className="mt-1 text-sm text-gray-500">月額 ¥1,980</p>
                                </div>
                                <Link href={`${baseUrl}/change-plan`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
                                    プランを変更
                                </Link>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">お支払い方法</p>
                                    <p className="mt-1 font-medium">•••• •••• •••• 4242</p>
                                    <p className="mt-1 text-sm text-gray-500">有効期限: 12/2025</p>
                                </div>
                                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
                                    変更
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Content */}
                {currentPage === "security" && (
                    <div className="mt-8 space-y-6">
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">メールアドレス</p>
                                    <p className="mt-1 font-medium">user@example.com</p>
                                </div>
                                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
                                    変更
                                </button>
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">パスワード</p>
                                    <p className="mt-1 font-medium">••••••••</p>
                                </div>
                                <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition">
                                    変更
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Content */}
                {currentPage === "notifications" && (
                    <div className="mt-8 space-y-6">
                        <p className="text-gray-600">通知を受け取る項目を選択してください。</p>
                        {[
                            { key: "newContent", label: "新作の作品", desc: "新しい作品が公開されたときに通知を受け取ります。" },
                            { key: "updates", label: "機能とアップデート", desc: "新機能やアップデート情報を受け取ります。" },
                            { key: "campaigns", label: "キャンペーン", desc: "お得なキャンペーン情報を受け取ります。" },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between rounded-lg border border-gray-200 p-6">
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                                <button className="relative h-6 w-11 rounded-full bg-blue-600 transition">
                                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// 各ページ用のエクスポート
export function SimpleAccountBillingPage(props: Omit<SimpleAccountPageProps, "currentPage">) {
    return <SimpleAccountPage {...props} currentPage="billing" />;
}

export function SimpleAccountSecurityPage(props: Omit<SimpleAccountPageProps, "currentPage">) {
    return <SimpleAccountPage {...props} currentPage="security" />;
}

export function SimpleAccountNotificationsPage(props: Omit<SimpleAccountPageProps, "currentPage">) {
    return <SimpleAccountPage {...props} currentPage="notifications" />;
}
