"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

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

export default function NeonProCreditsPage() {
    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState<CreditHistory[]>([]);
    const [chargeRequests, setChargeRequests] = useState<ChargeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showChargeModal, setShowChargeModal] = useState(false);
    const [chargeAmount, setChargeAmount] = useState("");
    const [chargeResult, setChargeResult] = useState<any>(null);

    useEffect(() => {
        fetchCredits();
        fetchChargeRequests();
    }, []);

    const fetchCredits = async () => {
        try {
            const res = await fetch("/api/fans/credits");
            if (res.ok) {
                const data = await res.json();
                setCredits(data.credits);
                setHistory(data.history);
            }
        } catch (error) {
            console.error("Failed to fetch credits:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChargeRequests = async () => {
        try {
            const res = await fetch("/api/fans/credits/charge-requests");
            if (res.ok) {
                const data = await res.json();
                setChargeRequests(data.chargeRequests);
            }
        } catch (error) {
            console.error("Failed to fetch charge requests:", error);
        }
    };

    const handleCharge = async () => {
        const amount = parseInt(chargeAmount);
        if (isNaN(amount) || amount < 1000) {
            alert("チャージ金額は1,000円以上で入力してください");
            return;
        }

        try {
            const res = await fetch("/api/fans/credits/charge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount })
            });

            if (res.ok) {
                const data = await res.json();
                setChargeResult(data.chargeRequest);
                setChargeAmount("");
                fetchChargeRequests();
            } else {
                const error = await res.json();
                alert(error.error);
            }
        } catch (error) {
            console.error("Failed to create charge request:", error);
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
                            onClick={() => signOut({ callbackUrl: "/neon-pro/login" })}
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
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60 uppercase tracking-wider">クレジット残高</p>
                            <p className="text-5xl font-black bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                ¥{credits.toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowChargeModal(true)}
                            className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition"
                        >
                            チャージする
                        </button>
                    </div>
                </section>

                {/* Charge Requests */}
                {chargeRequests.length > 0 && (
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

            {/* Charge Modal */}
            {showChargeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                    <div className="w-full max-w-md rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-[#0f0f18] to-[#1a0a20] p-8 shadow-[0_0_50px_rgba(217,70,239,0.2)]">
                        {!chargeResult ? (
                            <>
                                <h3 className="text-xl font-bold uppercase tracking-wider bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                                    クレジットをチャージ
                                </h3>
                                <p className="mt-2 text-sm text-white/60">
                                    チャージ金額を入力し、銀行振込でお支払いください。
                                </p>
                                <div className="mt-6">
                                    <label className="block text-sm font-medium uppercase tracking-wider text-white/80">金額（1,000円〜100,000円）</label>
                                    <input
                                        type="number"
                                        value={chargeAmount}
                                        onChange={(e) => setChargeAmount(e.target.value)}
                                        placeholder="10000"
                                        className="mt-2 w-full rounded-lg border border-fuchsia-500/30 bg-[#0a0a0f] px-4 py-3 focus:border-fuchsia-500 focus:outline-none focus:shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                                    />
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setShowChargeModal(false)}
                                        className="flex-1 rounded-lg border border-fuchsia-500/30 px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-fuchsia-500/10 transition"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={handleCharge}
                                        className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition"
                                    >
                                        申請する
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold uppercase tracking-wider text-fuchsia-400">申請完了</h3>
                                <div className="mt-4 rounded-xl bg-[#0a0a0f] border border-fuchsia-500/20 p-4">
                                    <p className="text-sm font-bold uppercase tracking-wider">振込先情報</p>
                                    <div className="mt-2 space-y-1 text-sm text-white/80 font-mono">
                                        <p>銀行名: {chargeResult.bankInfo.bankName}</p>
                                        <p>支店名: {chargeResult.bankInfo.branchName}</p>
                                        <p>口座種別: {chargeResult.bankInfo.accountType}</p>
                                        <p>口座番号: {chargeResult.bankInfo.accountNumber}</p>
                                        <p>口座名義: {chargeResult.bankInfo.accountHolder}</p>
                                    </div>
                                    <div className="mt-4 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 p-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">識別コード</p>
                                        <p className="text-lg font-black font-mono text-fuchsia-400">{chargeResult.identifierCode}</p>
                                        <p className="mt-1 text-xs text-white/60">{chargeResult.instructions}</p>
                                    </div>
                                    <p className="mt-4 text-xs text-white/60">
                                        有効期限: {new Date(chargeResult.expiresAt).toLocaleDateString("ja-JP")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowChargeModal(false);
                                        setChargeResult(null);
                                    }}
                                    className="mt-6 w-full rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black"
                                >
                                    閉じる
                                </button>
                            </>
                        )}
                    </div>
                </div>
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
