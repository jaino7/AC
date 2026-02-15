"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { CreatorProSignupForm } from "./signup-form";

export default function CreatorProSignupPage() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
    const pathSegment = pathname.split('/')[1] || '';
    const handle = THEME_PREFIXES.includes(pathSegment)
        ? (searchParams.get("handle") || undefined)
        : (pathSegment || undefined);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4">
            <section className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#161b22] p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-cyan-500 text-black text-xl font-bold">
                        C
                    </div>
                    <h1 className="text-2xl font-semibold text-white">
                        アカウント作成
                    </h1>
                    <p className="mt-2 text-sm text-white/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <CreatorProSignupForm />
            </section>
        </main>
    );
}
