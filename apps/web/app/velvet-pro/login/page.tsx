"use client";

export const dynamic = 'force-dynamic';

import { usePathname, useSearchParams } from "next/navigation";
import { VelvetProLoginForm } from "./login-form";

export default function VelvetProLoginPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
  const pathSegment = pathname.split('/')[1] || '';
  const handle = THEME_PREFIXES.includes(pathSegment)
    ? (searchParams.get("handle") || undefined)
    : (pathSegment || undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#757575] px-4 py-16">
      <div className="w-full max-w-sm rounded-[28px] border border-yellow-600/40 bg-[#0a0a0f]/95 p-8 text-white shadow-[0_30px_120px_rgba(255,216,0,0.25)] backdrop-blur">
        <h1 className="pb-4 text-center text-xl font-semibold text-yellow-300">
          ログインまたは登録
        </h1>

        <VelvetProLoginForm handle={handle} />
      </div>
    </div>
  );
}
