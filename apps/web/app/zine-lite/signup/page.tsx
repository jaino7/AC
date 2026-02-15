"use client";

import { useSearchParams } from "next/navigation";
import { ZineLiteSignupForm } from "./signup-form";

export default function ZineLiteSignupPage() {
    const searchParams = useSearchParams();
    const handle = searchParams.get("handle") || undefined;

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-4">
            <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-black text-xl font-bold">
                        Z
                    </div>
                    <h1 className="text-2xl font-semibold text-white">
                        アカウント作成
                    </h1>
                    <p className="mt-2 text-sm text-white/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <ZineLiteSignupForm />
            </section>
        </main>
    );
}
