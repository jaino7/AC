"use client";

import { useSearchParams } from "next/navigation";
import { PureLiteLoginForm } from "./login-form";

export default function PureLiteLoginPage() {
  const searchParams = useSearchParams();
  const handle = searchParams.get("handle") || undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#8b8d94] px-4 py-12 text-[#1f1f22]">
      <div className="w-full max-w-sm rounded-[28px] border border-black/10 bg-white/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.25)] backdrop-blur">
        <h1 className="pb-4 text-xl font-semibold">
          ログインまたは登録
        </h1>

        <PureLiteLoginForm handle={handle} />
      </div>
    </div>
  );
}
