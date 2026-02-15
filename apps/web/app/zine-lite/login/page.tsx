"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ZineLiteLoginForm } from "./login-form";

export default function ZineLiteLoginPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const handle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment || undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#6a6a6a] px-4 py-16 text-white">
      <div className="w-full max-w-sm rounded-[28px] border border-green-500/50 bg-black/95 p-8 text-white shadow-[0_0_80px_rgba(0,255,0,0.2)]">
        <h1 className="pb-4 text-center text-xl font-semibold">
          ログインまたは登録
        </h1>

        <ZineLiteLoginForm handle={handle} />
      </div>
    </div>
  );
}
