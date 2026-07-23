"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function GoogleRedirectInner() {
  const params = useSearchParams();
  const domain = params.get("domain");
  const path = params.get("path") || "/";
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const callbackPath = domain
      ? `/api/auth/cross-domain?domain=${encodeURIComponent(domain)}&path=${encodeURIComponent(path)}`
      : path;
    const callbackUrl = new URL(callbackPath, window.location.origin).toString();

    const startGoogleSignIn = async () => {
      const response = await fetch("/api/auth/csrf", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to initialize Google login.");
      }

      const { csrfToken } = await response.json();
      const encodedCallbackUrl = btoa(callbackUrl);
      const form = document.createElement("form");
      const callbackState =
        process.env.NODE_ENV === "development"
          ? `?state=${encodeURIComponent(encodedCallbackUrl)}`
          : "";

      form.method = "POST";
      form.action = `/api/auth/signin/google${callbackState}`;

      for (const [name, value] of Object.entries({
        csrfToken,
        callbackUrl,
      })) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    };

    startGoogleSignIn().catch((err) => {
      console.error("Google login redirect failed:", err);
      setError("Googleログインの開始に失敗しました。ページを再読み込みしてください。");
      started.current = false;
    });
  }, [domain, path]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-500" />
        <p className="mt-4 text-sm text-gray-600">
          {error || "Googleでログイン中..."}
        </p>
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
