"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function ZineLiteSecurityPage() {
    const [currentEmail, setCurrentEmail] = useState("user@example.com");
    const [showEmailChange, setShowEmailChange] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    const handleEmailChange = () => {
        setMessage("メールアドレスを変更しました。");
        setCurrentEmail(newEmail);
        setShowEmailChange(false);
        setNewEmail("");
    };

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            setMessage("パスワードが一致しません。");
            return;
        }
        setMessage("パスワードを変更しました。");
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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

            <main className="mx-auto w-full max-w-5xl px-4 py-10">
                <Link
                    href="/zine-lite/content"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 mb-6 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-3xl font-semibold">セキュリティ</h1>
                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
                    <Link href="/zine-lite/account" className="pb-2 hover:text-white">アカウント情報</Link>
                    <Link href="/zine-lite/account/billing" className="pb-2 hover:text-white">プランとお支払い</Link>
                    <Link href="/zine-lite/account/security" className="border-b-2 border-green-400 pb-2 text-white">セキュリティ</Link>
                    <Link href="/zine-lite/account/notifications" className="pb-2 hover:text-white">通知</Link>
                </div>

                <section className="mt-8 space-y-6 rounded-[24px] border border-white/10 bg-[#111111] p-8">
                    <h2 className="text-xl font-semibold">セキュリティ設定</h2>
                    <p className="mt-2 text-white/60">パスワードとセキュリティ設定を管理します。</p>

                    {/* Email Section */}
                    <div className="mt-8 rounded-2xl border border-white/10 bg-black p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">メールアドレス</p>
                                <p className="mt-1 text-sm text-white/60">{currentEmail}</p>
                            </div>
                            <button
                                onClick={() => setShowEmailChange(!showEmailChange)}
                                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                            >
                                {showEmailChange ? "キャンセル" : "変更"}
                            </button>
                        </div>

                        {showEmailChange && (
                            <div className="mt-4 space-y-4">
                                <label className="block">
                                    <span className="text-sm text-white/80">新しいメールアドレス</span>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="mt-2 w-full rounded-[18px] border border-white/20 bg-[#0a0a0a] px-4 py-3 text-white"
                                        placeholder="new@example.com"
                                    />
                                </label>
                                <button
                                    onClick={handleEmailChange}
                                    className="rounded-full bg-green-500 px-6 py-2 text-sm font-semibold text-black hover:bg-green-400"
                                >
                                    メールアドレスを変更
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Password Section */}
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">パスワード</p>
                                <p className="mt-1 text-sm text-white/60">••••••••</p>
                            </div>
                            <button
                                onClick={() => setShowPasswordChange(!showPasswordChange)}
                                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                            >
                                {showPasswordChange ? "キャンセル" : "変更"}
                            </button>
                        </div>

                        {showPasswordChange && (
                            <div className="mt-4 space-y-4">
                                <label className="block">
                                    <span className="text-sm text-white/80">現在のパスワード</span>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="mt-2 w-full rounded-[18px] border border-white/20 bg-[#0a0a0a] px-4 py-3 text-white"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm text-white/80">新しいパスワード</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="mt-2 w-full rounded-[18px] border border-white/20 bg-[#0a0a0a] px-4 py-3 text-white"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm text-white/80">新しいパスワード（確認）</span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-2 w-full rounded-[18px] border border-white/20 bg-[#0a0a0a] px-4 py-3 text-white"
                                    />
                                </label>
                                <button
                                    onClick={handlePasswordChange}
                                    className="rounded-full bg-green-500 px-6 py-2 text-sm font-semibold text-black hover:bg-green-400"
                                >
                                    パスワードを変更
                                </button>
                            </div>
                        )}
                    </div>

                    {message && (
                        <p className="mt-6 rounded-2xl border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            {message}
                        </p>
                    )}
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
