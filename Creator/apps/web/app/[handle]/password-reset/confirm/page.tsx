"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useHandlePath } from "@/lib/hooks/use-custom-domain";

function ConfirmForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams();
    const handle = params.handle as string;
    const token = searchParams.get("token") || "";
    const { path } = useHandlePath(handle);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("無効なリンクです");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("パスワードが一致しません");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/fans/password-reset/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword, confirmPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "エラーが発生しました");
            }

            setSuccess(true);
            setTimeout(() => router.push(path("/login")), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.08)] text-center space-y-4">
                <div className="text-4xl">✅</div>
                <h1 className="text-2xl font-semibold">パスワードを変更しました</h1>
                <p className="text-sm text-neutral-600">3秒後にログイン画面へ移動します。</p>
                <Link href={path("/login")} className="block text-sm text-black underline underline-offset-4">
                    今すぐログイン画面へ
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.08)]">
            <div className="space-y-2 mb-8">
                <h1 className="text-2xl font-semibold">新しいパスワードを設定</h1>
                <p className="text-sm text-neutral-600">
                    8文字以上で、英字と数字を含めてください。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                        新しいパスワード
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-black/15 px-4 py-3 pr-12 text-sm outline-none focus:border-black/40 transition"
                            placeholder="8文字以上"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                        新しいパスワード（確認）
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-black/15 px-4 py-3 pr-12 text-sm outline-none focus:border-black/40 transition"
                            placeholder="もう一度入力"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition"
                        >
                            {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                    {loading ? "変更中..." : "パスワードを変更する"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
                <Link href={path("/login")} className="text-black underline underline-offset-4">
                    ログイン画面に戻る
                </Link>
            </p>
        </div>
    );
}

export default function FanPasswordResetConfirmPage() {
    return (
        <main className="min-h-screen bg-white px-6 py-16 text-black">
            <div className="mx-auto max-w-md">
                <Suspense fallback={<div className="text-center text-neutral-500">読み込み中...</div>}>
                    <ConfirmForm />
                </Suspense>
            </div>
        </main>
    );
}
