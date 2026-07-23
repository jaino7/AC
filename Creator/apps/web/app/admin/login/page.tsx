"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [adminBasePath, setAdminBasePath] = useState('/admin');

  // PathKeyを含んだベースパスを取得
  useEffect(() => {
    // 現在のパスから /admin/{key} 部分を抽出
    const pathMatch = pathname.match(/^\/admin\/([^\/]+)/);
    if (pathMatch && pathMatch[1] !== 'login') {
      setAdminBasePath(`/admin/${pathMatch[1]}`);
    }
  }, [pathname]);

  const callbackUrl = searchParams.get("callbackUrl") || `${adminBasePath}/dashboard`;

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 管理者の固定メールアドレス（環境変数から取得）
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@cocoba.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("ログイン試行:", {
      email: adminEmail,
      passwordLength: password.length,
    });

    try {
      const result = await signIn("credentials", {
        email: adminEmail,
        password,
        redirect: false,
      });

      console.log("SignIn結果:", result);

      if (result?.error) {
        setError("パスワードが正しくありません");
        setIsLoading(false);
        return;
      }

      // ログイン成功 - リダイレクト前にロールを確認
      // Layout側でロールチェックが行われるため、ここでは単純にリダイレクト
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("ログインに失敗しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">管理画面</h1>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
              ADMIN
            </span>
          </div>
          <p className="text-sm text-gray-600">
            管理者アカウントでログインしてください
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                管理者パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:bg-gray-400"
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          {/* Warning */}
          <div className="mt-6 rounded-2xl bg-yellow-50 p-4">
            <p className="text-xs text-yellow-800">
              ⚠️ この画面は管理者専用です。不正アクセスは記録され、法的措置の対象となります。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
