"use client";

import { Suspense } from "react";


import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { TrustRankDisplay } from "@/components/credits/TrustRankDisplay";
import ChargeModal from "@/components/credits/ChargeModal";

type CreditHistory = {
    id: string;
    type: string;
    amount: number;
    balance: number;
    description: string;
    createdAt: string;
};

type ChargeRequest = {
    id: string;
    amount: number;
    status: string;
    identifierCode: string;
    expiresAt: string;
    createdAt: string;
};

function NeonProCreditsPageContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const THEME_PREFIXES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];
    const pathSegment = pathname.split('/')[1] || '';
    const handle = THEME_PREFIXES.includes(pathSegment)
        ? (searchParams.get("handle") || undefined)
        : (pathSegment || undefined);
    const [credits, setCredits] = useState(0);
    const [tier, setTier] = useState(0);
    const [trustScore, setTrustScore] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [history, setHistory] = useState<CreditHistory[]>([]);
    const [chargeRequests, setChargeRequests] = useState<ChargeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showChargeModal, setShowChargeModal] = useState(false);

    useEffect(() => {
        fetchCredits();
        fetchChargeRequests();
    }, []);

    const fetchCredits = async () => {
        try {
            const url = handle ? `/api/fans/credits?handle=${handle}` : "/api/fans/credits";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCredits(data.credits || 0);
                setTier(data.tier || 0);
                setTrustScore(data.trustScore || 0);
                setIsLocked(data.isLocked || false);
                setHistory(data.history || []);

                // If account is locked, redirect to suspended page
                if (data.isLocked) {
                    window.location.href = "/account-suspended";
                }
            }
        } catch (error) {
            console.error("Failed to fetch credits:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChargeRequests = async () => {
        try {
            const url = handle ? `/api/fans/credits/charge-requests?handle=${handle}` : "/api/fans/credits/charge-requests";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setChargeRequests(data.chargeRequests || []);
            }
        } catch (error) {
            console.error("Failed to fetch charge requests:", error);
            setChargeRequests([]);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING": return { text: "振込待ち", color: "bg-yellow-500/20 text-yellow-400" };
            case "TRANSFERRED": return { text: "確認中", color: "bg-blue-500/20 text-blue-400" };
            case "APPROVED": return { text: "完了", color: "bg-fuchsia-500/20 text-fuchsia-400" };
            case "REJECTED": return { text: "却下", color: "bg-red-500/20 text-red-400" };
            case "EXPIRED": return { text: "期限切れ", color: "bg-gray-500/20 text-gray-400" };
            default: return { text: status, color: "bg-gray-500/20 text-gray-400" };
        }
    };

    const getHistoryTypeLabel = (type: string) => {
        switch (type) {
            case "CHARGE": return { text: "チャージ", color: "text-fuchsia-400" };
            case "PURCHASE": return { text: "購入", color: "text-cyan-400" };
            case "SUBSCRIBE": return { text: "購読", color: "text-purple-400" };
            case "REFUND": return { text: "返金", color: "text-green-400" };
            default: return { text: type, color: "text-gray-400" };
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Neon glow background effect */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 blur-[128px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[128px] rounded-full" />
            </div>

            <header className="relative border-b border-fuchsia-500/20 bg-[#0a0a0f]/90 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3 text-lg font-bold tracking-wider">
                        <span className="grid h-9 w-9 place-items-center rounded bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-black font-black">
                            N
                        </span>
                        <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                            NEON PRO
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 overflow-hidden flex items-center justify-center border-2 border-fuchsia-500/50">
                            <span className="text-sm">👤</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: handle ? `/${handle}/login` : "/neon-pro/login" })}
                            className="text-sm text-white/70 hover:text-fuchsia-400 transition"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative mx-auto w-full max-w-5xl px-4 py-10">
                <Link
                    href="/neon-pro/content"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/60 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 mb-6 transition border border-transparent hover:border-fuchsia-500/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                </Link>

                <h1 className="text-3xl font-bold tracking-wider uppercase">
                    <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                        クレジット管理
                    </span>
                </h1>

                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60 uppercase tracking-wider">
                    <Link href="/neon-pro/account" className="pb-2 hover:text-fuchsia-400 transition">アカウント</Link>
                    <Link href="/neon-pro/account/billing" className="pb-2 hover:text-fuchsia-400 transition">プラン</Link>
                    <Link href="/neon-pro/account/credits" className="border-b-2 border-fuchsia-500 pb-2 text-fuchsia-400">クレジット</Link>
                </div>

                {/* Credit Balance */}
                <section className="mt-8 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-[#0f0f18] to-[#1a0a20] p-8 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-white/60 uppercase tracking-wider">クレジット残高</p>
                            <p className="text-5xl font-black bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                ¥{(credits || 0).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowChargeModal(true)}
                            className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition"
                        >
                            チャージする
                        </button>
                    </div>

                    {/* Trust Rank Display */}
                    <TrustRankDisplay
                        tier={tier}
                        trustScore={trustScore}
                        variant="neon-pro"
                        className="pt-6 border-t border-fuchsia-500/30"
                    />
                </section>

                {/* Charge Requests */}
                {chargeRequests && chargeRequests.length > 0 && (
                    <section className="mt-8 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-[#0f0f18] to-[#1a0a20] p-8">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-fuchsia-400">チャージ申請</h2>
                        <div className="mt-4 space-y-3">
                            {chargeRequests.map((req) => {
                                const status = getStatusLabel(req.status);
                                return (
                                    <div key={req.id} className="flex items-center justify-between rounded-xl bg-[#0a0a0f] border border-fuchsia-500/20 p-4">
                                        <div>
                                            <p className="font-bold">¥{req.amount.toLocaleString()}</p>
                                            <p className="text-xs text-white/60 font-mono">識別コード: {req.identifierCode}</p>
                                            <p className="text-xs text-white/60">{new Date(req.createdAt).toLocaleDateString("ja-JP")}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Credit History */}
                <section className="mt-8 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-[#0f0f18] to-[#1a0a20] p-8">
                    <h2 className="text-xl font-bold uppercase tracking-wider text-fuchsia-400">利用履歴</h2>
                    {history.length === 0 ? (
                        <p className="mt-4 text-white/60">履歴がありません</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {history.map((item) => {
                                const typeLabel = getHistoryTypeLabel(item.type);
                                return (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#0a0a0f] border border-fuchsia-500/20 p-4">
                                        <div>
                                            <p className="font-bold">{item.description}</p>
                                            <p className={`text-xs font-bold uppercase tracking-wider ${typeLabel.color}`}>{typeLabel.text}</p>
                                            <p className="text-xs text-white/60">{new Date(item.createdAt).toLocaleDateString("ja-JP")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${item.amount > 0 ? "text-fuchsia-400" : "text-red-400"}`}>
                                                {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}円
                                            </p>
                                            <p className="text-xs text-white/60">残高: ¥{item.balance.toLocaleString()}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {showChargeModal && (
                <ChargeModal
                    handle={handle}
                    tier={tier}
                    variant="neon-pro"
                    onClose={() => { setShowChargeModal(false); fetchCredits(); fetchChargeRequests(); }}
                    onSuccess={() => { fetchCredits(); fetchChargeRequests(); }}
                />
            )}

            <footer className="relative mt-12 border-t border-fuchsia-500/20 bg-[#0a0a0f]/80 py-8">
                <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-white/40 uppercase tracking-wider">
                    <p>©CocoBa</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-fuchsia-400 transition">利用規約</a>
                        <a href="#" className="hover:text-fuchsia-400 transition">プライバシー</a>
                        <a href="#" className="hover:text-fuchsia-400 transition">特商法表記</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function NeonProCreditsPage() {
  return (
    <Suspense>
      <NeonProCreditsPageContent />
    </Suspense>
  );
}
