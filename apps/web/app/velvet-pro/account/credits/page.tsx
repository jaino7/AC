"use client";

import { useState, useEffect } from "react";
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

interface VelvetProCreditsPageProps {
    handle?: string;
    displayName?: string;
    logoUrl?: string | null;
}

export default function VelvetProCreditsPage({ handle }: VelvetProCreditsPageProps = {}) {
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
            case "PENDING": return { text: "振込待ち", color: "bg-amber-400/20 text-amber-400" };
            case "TRANSFERRED": return { text: "確認中", color: "bg-blue-400/20 text-blue-400" };
            case "APPROVED": return { text: "完了", color: "bg-yellow-400/20 text-yellow-400" };
            case "REJECTED": return { text: "却下", color: "bg-red-400/20 text-red-400" };
            case "EXPIRED": return { text: "期限切れ", color: "bg-gray-400/20 text-gray-400" };
            default: return { text: status, color: "bg-gray-400/20 text-gray-400" };
        }
    };

    const getHistoryTypeLabel = (type: string) => {
        switch (type) {
            case "CHARGE": return { text: "チャージ", color: "text-yellow-400" };
            case "PURCHASE": return { text: "購入", color: "text-orange-400" };
            case "SUBSCRIBE": return { text: "購読", color: "text-purple-400" };
            case "REFUND": return { text: "返金", color: "text-green-400" };
            default: return { text: type, color: "text-gray-400" };
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0a0d] text-white">
            <header className="border-b border-white/10 bg-[#0c0b0f]/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                        <span className="text-yellow-400">💎</span>
                        Velvet Pro
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="rounded-full bg-white/10 px-3 py-2">🔔</button>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ffe9b5] to-[#f4c76b] overflow-hidden"></div>
                        <button
                            onClick={() => signOut({ callbackUrl: handle ? `/${handle}/login` : "/velvet-pro/login" })}
                            className="text-sm text-white/60 hover:text-white"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-4xl px-4 py-10">
                <h1 className="text-3xl font-semibold">クレジット管理</h1>

                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
                    <Link href="/velvet-pro/account" className="pb-2 hover:text-white">アカウント情報</Link>
                    <Link href="/velvet-pro/account/billing" className="pb-2 hover:text-white">プランとお支払い</Link>
                    <Link href="/velvet-pro/account/credits" className="border-b-2 border-yellow-400 pb-2 text-white">クレジット</Link>
                    <Link href="/velvet-pro/account/security" className="pb-2 hover:text-white">セキュリティ</Link>
                </div>

                {/* Credit Balance */}
                <section className="mt-8 rounded-[32px] border border-white/10 bg-[#151316] p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-white/60">クレジット残高</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">¥{(credits || 0).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => setShowChargeModal(true)}
                            className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 text-sm font-semibold text-black hover:opacity-90 transition"
                        >
                            チャージする
                        </button>
                    </div>

                    {/* Trust Rank Display */}
                    <TrustRankDisplay
                        tier={tier}
                        trustScore={trustScore}
                        variant="velvet-pro"
                        className="pt-6 border-t border-white/10"
                    />
                </section>

                {/* Charge Requests */}
                {chargeRequests && chargeRequests.length > 0 && (
                    <section className="mt-8 rounded-[32px] border border-white/10 bg-[#151316] p-8">
                        <h2 className="text-xl font-semibold">チャージ申請</h2>
                        <div className="mt-4 space-y-3">
                            {chargeRequests.map((req) => {
                                const status = getStatusLabel(req.status);
                                return (
                                    <div key={req.id} className="flex items-center justify-between rounded-2xl bg-[#0b0a0d] border border-white/10 p-4">
                                        <div>
                                            <p className="font-semibold">¥{req.amount.toLocaleString()}</p>
                                            <p className="text-xs text-white/60">識別コード: {req.identifierCode}</p>
                                            <p className="text-xs text-white/60">{new Date(req.createdAt).toLocaleDateString("ja-JP")}</p>
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
                <section className="mt-8 rounded-[32px] border border-white/10 bg-[#151316] p-8">
                    <h2 className="text-xl font-semibold">利用履歴</h2>
                    {history.length === 0 ? (
                        <p className="mt-4 text-white/60">履歴がありません</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {history.map((item) => {
                                const typeLabel = getHistoryTypeLabel(item.type);
                                return (
                                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#0b0a0d] border border-white/10 p-4">
                                        <div>
                                            <p className="font-semibold">{item.description}</p>
                                            <p className={`text-xs ${typeLabel.color}`}>{typeLabel.text}</p>
                                            <p className="text-xs text-white/60">{new Date(item.createdAt).toLocaleDateString("ja-JP")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${item.amount > 0 ? "text-yellow-400" : "text-red-400"}`}>
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
                    variant="velvet-pro"
                    onClose={() => { setShowChargeModal(false); fetchCredits(); fetchChargeRequests(); }}
                    onSuccess={() => { fetchCredits(); fetchChargeRequests(); }}
                />
            )}

            <footer className="mt-12 border-t border-white/10 bg-[#0c0b0f] py-8">
                <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-white/40">
                    <p>©CocoBa</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-purple-400">利用規約</a>
                        <a href="#" className="hover:text-purple-400">プライバシーポリシー</a>
                        <a href="#" className="hover:text-purple-400">特定商取引法に基づく表記</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
