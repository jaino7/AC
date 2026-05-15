"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AgeGateProps {
    children: ReactNode;
    isRequired: boolean;
    creatorHandle: string;
    creatorName?: string;
}

export function AgeGate({ children, isRequired, creatorHandle, creatorName }: AgeGateProps) {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(!isRequired);
    const storageKey = `cocoba:age-verified:${creatorHandle}`;

    useEffect(() => {
        if (!isRequired) {
            setIsVerified(true);
            return;
        }

        setIsVerified(window.localStorage.getItem(storageKey) === "true");
    }, [isRequired, storageKey]);

    const handleConfirm = () => {
        window.localStorage.setItem(storageKey, "true");
        setIsVerified(true);
    };

    if (!isRequired || isVerified) {
        return <>{children}</>;
    }

    return (
        <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-6">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
                <section className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
                    <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-5 sm:px-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
                            Age Verification
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-neutral-950 sm:text-3xl">
                            あなたは18歳以上ですか？
                        </h1>
                    </div>

                    <div className="space-y-6 px-6 py-6 text-neutral-900 sm:px-8 sm:py-8">
                        <div className="space-y-3">
                            <p className="text-sm leading-7 text-neutral-600">
                                ここから先はアダルトコンテンツを扱うサイトとなります。
                                <br />
                                18歳未満の方のアクセスは固くお断りしております。
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="min-h-12 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                            >
                                18歳以上です
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/forbidden")}
                                className="min-h-12 rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                            >
                                18歳未満です
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
