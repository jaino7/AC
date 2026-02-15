"use client";

import { Suspense } from "react";


import { usePathname, useSearchParams } from "next/navigation";
import { NeonProLoginForm } from "./login-form";

function NeonProLoginPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const handle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment || undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4a4a4a] px-4 py-16 text-white">
      <div className="relative w-full max-w-sm rounded-[28px] border border-cyan-500/30 bg-[#081129] px-8 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 rounded-[28px] bg-cyan-500/30 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-6">
          <header className="space-y-2 text-center">
            <p className="text-2xl font-semibold">
              ログインまたは登録
            </p>
          </header>

          <NeonProLoginForm handle={handle} />
        </div>
      </div>
    </div>
  );
}

export default function NeonProLoginPage() {
  return (
    <Suspense>
      <NeonProLoginPageContent />
    </Suspense>
  );
}
