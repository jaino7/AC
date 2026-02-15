"use client";

import { useSearchParams } from "next/navigation";
import { VelvetProSignupForm } from "./signup-form";

export default function VelvetProSignupPage() {
    const searchParams = useSearchParams();
    const handle = searchParams.get("handle") || undefined;

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0b0a0d] px-4">
            <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#151316] p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 text-4xl">💎</div>
                    <h1 className="text-2xl font-semibold text-white">
                        アカウント作成
                    </h1>
                    <p className="mt-2 text-sm text-white/60">新しいアカウントを作成してコンテンツをお楽しみください</p>
                </div>
                <VelvetProSignupForm />
            </section>
        </main>
    );
}
