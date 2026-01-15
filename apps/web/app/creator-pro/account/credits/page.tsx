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

export default function CreatorProCreditsPage() {
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
            case "PENDING": return { text: "振込待ち", color: "bg-yellow-400/20 text-yellow-400" };
            case "TRANSFERRED": return { text: "確認中", color: "bg-blue-400/20 text-blue-400" };
            case "APPROVED": return { text: "完了", color: "bg-cyan-400/20 text-cyan-400" };
            case "REJECTED": return { text: "却下", color: "bg-red-400/20 text-red-400" };
            case "EXPIRED": return { text: "期限切れ", color: "bg-gray-400/20 text-gray-400" };
            default: return { text: status, color: "bg-gray-400/20 text-gray-400" };
        }
    };

    const getHistoryTypeLabel = (type: string) => {
        switch (type) {
            case "CHARGE": return { text: "チャージ", color: "text-cyan-400" };
            case "PURCHASE": return { text: "購入", color: "text-orange-400" };
            case "SUBSCRIBE": return { text: "購読", color: "text-purple-400" };
            case "REFUND": return { text: "返金", color: "text-green-400" };
            default: return { text: type, color: "text-gray-400" };
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] text-white">
            <header className="border-b border-gray-800 bg-[#0d1117] px-6 py-4">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-3 text-lg font-semibold">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-500 text-black font-bold">
                            C
                        </span>
                        Creator Pro
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 overflow-hidden flex items-center justify-center">
                            <span className="text-sm text-black">👤</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/creator-pro/login" })}
                            className="text-sm text-white/70 hover:text-white"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-10">
                <Link
                    href="/creator-pro/content"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 mb-6 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                </Link>

                <h1 className="text-3xl font-semibold">クレジット管理</h1>

                <div className="mt-6 flex flex-wrap gap-6 text-sm font-semibold text-white/60">
                    <Link href="/creator-pro/account" className="pb-2 hover:text-white">アカウント情報</Link>
                    <Link href="/creator-pro/account/billing" className="pb-2 hover:text-white">プランとお支払い</Link>
                    <Link href="/creator-pro/account/credits" className="border-b-2 border-cyan-400 pb-2 text-white">クレジット</Link>
                </div>

                {/* Credit Balance */}
                <section className="mt-8 rounded-2xl border border-gray-800 bg-[#161b22] p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">クレジット残高</p>
                            <p className="text-4xl font-bold text-cyan-400">¥{credits.toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => setShowChargeModal(true)}
                            className="rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-black hover:bg-cyan-400 transition"
                        >
                            チャージする
                        </button>
                    </div>
                </section>

                {/* Charge Requests */}
                {chargeRequests.length > 0 && (
                    <section className="mt-8 rounded-2xl border border-gray-800 bg-[#161b22] p-8">
                        <h2 className="text-xl font-semibold">チャージ申請</h2>
                        <div className="mt-4 space-y-3">
                            {chargeRequests.map((req) => {
                                const status = getStatusLabel(req.status);
                                return (
                                    <div key={req.id} className="flex items-center justify-between rounded-xl bg-[#0d1117] border border-gray-800 p-4">
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
                <section className="mt-8 rounded-2xl border border-gray-800 bg-[#161b22] p-8">
                    <h2 className="text-xl font-semibold">利用履歴</h2>
                    {history.length === 0 ? (
                        <p className="mt-4 text-white/60">履歴がありません</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {history.map((item) => {
                                const typeLabel = getHistoryTypeLabel(item.type);
                                return (
                                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#0d1117] border border-gray-800 p-4">
                                        <div>
                                            <p className="font-semibold">{item.description}</p>
                                            <p className={`text-xs ${typeLabel.color}`}>{typeLabel.text}</p>
                                            <p className="text-xs text-white/60">{new Date(item.createdAt).toLocaleDateString("ja-JP")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${item.amount > 0 ? "text-cyan-400" : "text-red-400"}`}>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="w-full max-w-md rounded-2xl bg-[#161b22] border border-gray-800 p-8">
                        {!chargeResult ? (
                            <>
                                <h3 className="text-xl font-semibold">クレジットをチャージ</h3>
                                <p className="mt-2 text-sm text-white/60">
                                    チャージ金額を入力し、銀行振込でお支払いください。
                                </p>
                                <div className="mt-6">
                                    <label className="block text-sm font-medium">金額（1,000円〜100,000円）</label>
                                    <input
                                        type="number"
                                        value={chargeAmount}
                                        onChange={(e) => setChargeAmount(e.target.value)}
                                        placeholder="10000"
                                        className="mt-2 w-full rounded-lg border border-gray-700 bg-[#0d1117] px-4 py-3 focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => setShowChargeModal(false)}
                                        className="flex-1 rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold hover:bg-white/10"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={handleCharge}
                                        className="flex-1 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-black hover:bg-cyan-400"
                                    >
                                        申請する
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold text-cyan-400">申請完了</h3>
                                <div className="mt-4 rounded-xl bg-[#0d1117] border border-gray-800 p-4">
                                    <p className="text-sm font-semibold">振込先情報</p>
                                    <div className="mt-2 space-y-1 text-sm text-white/80">
                                        <p>銀行名: {chargeResult.bankInfo.bankName}</p>
                                        <p>支店名: {chargeResult.bankInfo.branchName}</p>
                                        <p>口座種別: {chargeResult.bankInfo.accountType}</p>
                                        <p>口座番号: {chargeResult.bankInfo.accountNumber}</p>
                                        <p>口座名義: {chargeResult.bankInfo.accountHolder}</p>
                                    </div>
                                    <div className="mt-4 rounded-lg bg-cyan-400/10 p-3">
                                        <p className="text-xs font-semibold text-cyan-400">識別コード</p>
                                        <p className="text-lg font-bold text-cyan-400">{chargeResult.identifierCode}</p>
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
                                    className="mt-6 w-full rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-black"
                                >
                                    閉じる
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <footer className="mt-12 border-t border-gray-800 bg-[#0d1117] py-8">
                <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-white/40">
                    <p>©CocoBa</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-cyan-400">利用規約</a>
                        <a href="#" className="hover:text-cyan-400">プライバシーポリシー</a>
                        <a href="#" className="hover:text-cyan-400">特定商取引法に基づく表記</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
