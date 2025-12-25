"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "success" | "error";

const sendResetRequest = async (email: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const success = !email.endsWith("@invalid.com");
  if (!success) {
    throw new Error("このメールアドレスは登録されていません。");
  }
  return true;
};

export default function PasswordResetPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    setMessage("");
    try {
      await sendResetRequest(email);
      setStatus("success");
      setMessage("メールを送信しました。数分お待ちください。");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "エラーが発生しました。再度お試しください。"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-12 text-black">
      <div className="w-full max-w-lg rounded-[32px] border border-black/10 bg-white p-10 shadow-[0px_40px_80px_rgba(0,0,0,0.1)]">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">パスワード再設定</h1>
          <p className="text-sm text-neutral-500">
            ご登録のメールアドレスに、パスワード再設定用リンクをお送りします。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {status === "success" && (
            <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
              {message}
            </p>
          )}

          <label className="block text-sm font-semibold text-neutral-800">
            メールアドレス
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your.email@example.com"
              className="mt-2 w-full rounded-2xl border border-black/20 bg-white px-4 py-3 text-black placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-blue-500 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "送信中..." : "再設定用リンクを送信"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          <a href="/creators/login" className="underline">
            ログイン画面に戻る
          </a>
        </div>

        <footer className="mt-8 flex flex-wrap justify-between text-xs text-neutral-400">
          <a href="#">利用規約</a>
          <a href="#">プライバシーポリシー</a>
          <a href="#">特定商取引法に基づく表記</a>
        </footer>
      </div>
    </main>
  );
}
