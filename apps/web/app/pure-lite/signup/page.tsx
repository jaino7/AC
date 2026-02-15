"use client";

import { useSearchParams } from "next/navigation";
import { PureLiteSignupForm } from "./signup-form";

export default function PureLiteSignupPage() {
    const searchParams = useSearchParams();
    const handle = searchParams.get("handle") || undefined;

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fff8f5] px-4">
            <section className="w-full max-w-md rounded-3xl border border-[#f3e8e2] bg-white p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.08)]">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white text-xl font-bold">
                        P
                    </div>
                    <h1 className="text-2xl font-semibold text-[#2d2a26]">
                        アカウント作成
                    </h1>
                    <p className="mt-2 text-sm text-[#2d2a26]/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <PureLiteSignupForm />
            </section>
        </main>
    );
}
