"use client";

import { Suspense } from "react";


import { usePathname, useSearchParams } from "next/navigation";
import { StudioProSignupForm } from "./signup-form";

function StudioProSignupPageContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
    const pathSegment = pathname.split('/')[1] || '';
    const handle = THEME_PREFIXES.includes(pathSegment)
        ? (searchParams.get("handle") || undefined)
        : (pathSegment || undefined);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#030814] px-4">
            <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#070e1e] p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[10px] bg-[#2f6dff] text-white text-xl font-bold">
                        S
                    </div>
                    <h1 className="text-2xl font-semibold text-white">
                        アカウント作成
                    </h1>
                    <p className="mt-2 text-sm text-white/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <StudioProSignupForm />
            </section>
        </main>
    );
}

export default function StudioProSignupPage() {
  return (
    <Suspense>
      <StudioProSignupPageContent />
    </Suspense>
  );
}
