"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function GoogleRedirectInner() {
  const params = useSearchParams();
  const domain = params.get("domain");
  const path = params.get("path") || "/";

  useEffect(() => {
    // callbackUrl: OAuth完了後、cross-domain APIでトークン交換してカスタムドメインへ転送
    const callbackUrl = domain
      ? `/api/auth/cross-domain?domain=${encodeURIComponent(domain)}&path=${encodeURIComponent(path)}`
      : path;

    signIn("google", { callbackUrl });
  }, [domain, path]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-500" />
        <p className="mt-4 text-sm text-gray-600">Googleでログイン中...</p>
      </div>
    </div>
  );
}

export default function GoogleRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-500" />
            <p className="mt-4 text-sm text-gray-600">読み込み中...</p>
          </div>
        </div>
      }
    >
      <GoogleRedirectInner />
    </Suspense>
  );
}
