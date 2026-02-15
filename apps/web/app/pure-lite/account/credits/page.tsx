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

function PureLiteCreditsPageContent() {
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
            case "PENDING": return { text: "振込待ち", color: "bg-yellow-400/20 text-yellow-400" };
            case "TRANSFERRED": return { text: "確認中", color: "bg-blue-400/20 text-blue-400" };
            case "APPROVED": return { text: "完了", color: "bg-green-400/20 text-green-400" };
            case "REJECTED": return { text: "却下", color: "bg-red-400/20 text-red-400" };
            case "EXPIRED": return { text: "期限切れ", color: "bg-gray-400/20 text-gray-400" };
            default: return { text: status, color: "bg-gray-400/20 text-gray-400" };
        }
    };

    const getHistoryTypeLabel = (type: string) => {
        switch (type) {
            case "CHARGE": return { text: "チャージ", color: "text-pink-400" };
            case "PURCHASE": return { text: "購入", color: "text-orange-400" };
            case "SUBSCRIBE": return { text: "購読", color: "text-purple-400" };
            case "REFUND": return { text: "返金", color: "text-green-400" };
            default: return { text: type, color: "text-gray-400" };
        }
    };

    return (
        <div className="min-h-screen bg-[#fff8f5] text-[#2d2a26]">
            <header className="border-b border-[#f3e8e2] bg-white/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white">
                            P
                        </span>
                        Pure Lite
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-full bg-pink-200 overflow-hidden flex items-center justify-center">
                            <span className="text-sm text-pink-600">👤</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: handle ? `/${handle}/login` : "/pure-lite/login" })}
                            className="text-sm text-[#2d2a26]/60 hover:text-[#2d2a26]"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-10">
                <Link
                    href="/pure-lite/content"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full text-[#2d2a26]/60 hover:text-[#2d2a26] hover:bg-pink-100 mb-6 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                </Link>

                <h1 className="text-3xl font-semibold">クレジット管理</h1>

                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-[#2d2a26]/60">
                    <Link href="/pure-lite/account" className="pb-2 hover:text-[#2d2a26]">アカウント情報</Link>
                    <Link href="/pure-lite/account/billing" className="pb-2 hover:text-[#2d2a26]">プランとお支払い</Link>
                    <Link href="/pure-lite/account/credits" className="border-b-2 border-pink-400 pb-2 text-[#2d2a26]">クレジット</Link>
                </div>

                {/* Credit Balance */}
                <section className="mt-8 rounded-[24px] border border-[#f3e8e2] bg-white p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-[#2d2a26]/60">クレジット残高</p>
                            <p className="text-4xl font-bold text-pink-500">¥{(credits || 0).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => setShowChargeModal(true)}
                            className="rounded-full bg-gradient-to-r from-pink-400 to-rose-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                        >
                            チャージする
                        </button>
                    </div>

                    {/* Trust Rank Display */}
                    <TrustRankDisplay
                        tier={tier}
                        trustScore={trustScore}
                        variant="pure-lite"
                        className="pt-6 border-t border-[#f3e8e2]"
                    />
                </section>

                {/* Charge Requests */}
                {chargeRequests && chargeRequests.length > 0 && (
                    <section className="mt-8 rounded-[24px] border border-[#f3e8e2] bg-white p-8">
                        <h2 className="text-xl font-semibold">チャージ申請</h2>
                        <div className="mt-4 space-y-3">
                            {chargeRequests.map((req) => {
                                const status = getStatusLabel(req.status);
                                return (
                                    <div key={req.id} className="flex items-center justify-between rounded-xl bg-[#fff8f5] p-4">
                                        <div>
                                            <p className="font-semibold">¥{req.amount.toLocaleString()}</p>
                                            <p className="text-xs text-[#2d2a26]/60">識別コード: {req.identifierCode}</p>
                                            <p className="text-xs text-[#2d2a26]/60">{new Date(req.createdAt).toLocaleDateString("ja-JP")}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Credit History */}
                <section className="mt-8 rounded-[24px] border border-[#f3e8e2] bg-white p-8">
                    <h2 className="text-xl font-semibold">利用履歴</h2>
                    {history.length === 0 ? (
                        <p className="mt-4 text-[#2d2a26]/60">履歴がありません</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {history.map((item) => {
                                const typeLabel = getHistoryTypeLabel(item.type);
                                return (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#fff8f5] p-4">
                                        <div>
                                            <p className="font-semibold">{item.description}</p>
                                            <p className={`text-xs ${typeLabel.color}`}>{typeLabel.text}</p>
                                            <p className="text-xs text-[#2d2a26]/60">{new Date(item.createdAt).toLocaleDateString("ja-JP")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${item.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                                                {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}円
                                            </p>
                                            <p className="text-xs text-[#2d2a26]/60">残高: ¥{item.balance.toLocaleString()}</p>
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
                    variant="pure-lite"
                    onClose={() => { setShowChargeModal(false); fetchCredits(); fetchChargeRequests(); }}
                    onSuccess={() => { fetchCredits(); fetchChargeRequests(); }}
                />
            )}

            <footer className="mt-12 border-t border-[#f3e8e2] bg-white py-8">
                <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-[#2d2a26]/40">
                    <p>©CocoBa</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-pink-400">利用規約</a>
                        <a href="#" className="hover:text-pink-400">プライバシーポリシー</a>
                        <a href="#" className="hover:text-pink-400">特定商取引法に基づく表記</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function PureLiteCreditsPage() {
  return (
    <Suspense>
      <PureLiteCreditsPageContent />
    </Suspense>
  );
}
