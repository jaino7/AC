"use client";

import { useSearchParams } from "next/navigation";
import { StudioProLoginForm } from "./login-form";

export default function StudioProLoginPage() {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") || undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#778096] px-4 py-16 text-[#1f1f22]">
      <div className="w-full max-w-sm rounded-[28px] border border-black/10 bg-white/95 p-8 shadow-[0_40px_140px_rgba(0,0,0,0.3)] backdrop-blur">
        <h1 className="pb-4 text-center text-xl font-semibold">
          ログインまたは登録
        </h1>

        <StudioProLoginForm handle={handle} />
      </div>
    </div>
  );
}
