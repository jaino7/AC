"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/api";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset({ email });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-black">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.08)] text-center space-y-4">
            <div className="text-4xl">✉️</div>
            <h1 className="text-2xl font-semibold">メールを送信しました</h1>
            <p className="text-sm text-neutral-600">
              登録済みのメールアドレスの場合、パスワード再設定用のリンクをお送りしました。メールをご確認ください。
            </p>
            <p className="text-xs text-neutral-400">リンクの有効期限は24時間です。</p>
            <Link href="/creators/login" className="block text-sm text-black underline underline-offset-4 mt-4">
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-black">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.08)]">
          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-semibold">パスワードの再設定</h1>
            <p className="text-sm text-neutral-600">
              登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black/40 transition"
                placeholder="example@email.com"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? "送信中..." : "再設定メールを送信"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            <Link href="/creators/login" className="text-black underline underline-offset-4">
              ログイン画面に戻る
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
