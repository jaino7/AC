"use client";

import { useState, useEffect, useCallback } from "react";

interface BankAccount {
    bankName: string;
    bankCode: string;
    branchName: string;
    branchCode: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
}

interface Payout {
    id: string;
    amount: number;
    status: string;
    periodMonth: string;
    createdAt: string;
    processedAt: string | null;
    note: string | null;
    creator: {
        displayName: string;
        handle: string;
        user: { email: string | null };
    };
    bankAccount: BankAccount;
}

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [notes, setNotes] = useState<Record<string, string>>({});

    const fetchPayouts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/creator-payouts");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setPayouts(data.payouts);
        } catch {
            setMessage({ text: "データの取得に失敗しました", type: "error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    const handleComplete = async (id: string, creatorName: string, amount: number) => {
        if (!confirm(`${creatorName} への ¥${amount.toLocaleString()} の振込を完了にしますか？\n\n実際に振込が完了していることを確認してから実行してください。`)) {
            return;
        }

        setProcessing(id);
        setMessage(null);
        try {
            const res = await fetch(`/api/admin/creator-payouts/${id}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: notes[id] || undefined }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ text: data.error || "処理に失敗しました", type: "error" });
                return;
            }
            setMessage({ text: `${creatorName} への振込を完了しました`, type: "success" });
            await fetchPayouts();
        } catch {
            setMessage({ text: "処理に失敗しました", type: "error" });
        } finally {
            setProcessing(null);
        }
    };

    const accountTypeLabel = (type: string) =>
        type === "SAVINGS" ? "普通" : type === "CHECKING" ? "当座" : type;

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <main className="px-6 py-10 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">クリエイター振込管理</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        月次精算で生成された振込待ちレコードです。実際に銀行振込を行ってから「振込完了」ボタンを押してください。
                    </p>
                </header>

                {message && (
                    <div
                        className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${
                            message.type === "success"
                                ? "border-green-200 bg-green-50 text-green-800"
                                : "border-red-200 bg-red-50 text-red-800"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="py-16 text-center text-gray-500">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        読み込み中...
                    </div>
                ) : payouts.length === 0 ? (
                    <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center">
                        <p className="text-lg font-medium text-gray-400">振込待ちのクリエイターはいません</p>
                        <p className="mt-2 text-sm text-gray-400">
                            月末精算バッチが実行されると、残高 ¥5,000 以上のクリエイターがここに表示されます
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payouts.map((p) => (
                            <div key={p.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    {/* 左: クリエイター情報 */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {p.creator.displayName}
                                            </h3>
                                            <span className="text-sm text-gray-500">@{p.creator.handle}</span>
                                            <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                                                {p.periodMonth} 分
                                            </span>
                                        </div>

                                        {/* 振込金額 */}
                                        <div className="rounded-2xl bg-blue-50 px-5 py-4">
                                            <p className="text-xs text-blue-600 font-medium mb-1">振込金額</p>
                                            <p className="text-3xl font-bold text-blue-900">
                                                ¥{p.amount.toLocaleString()}
                                            </p>
                                        </div>

                                        {/* 振込先口座 */}
                                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">振込先口座</p>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                                <div>
                                                    <span className="text-gray-500">金融機関</span>
                                                    <p className="font-semibold text-gray-900">
                                                        {p.bankAccount.bankName}（{p.bankAccount.bankCode}）
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">支店</span>
                                                    <p className="font-semibold text-gray-900">
                                                        {p.bankAccount.branchName}（{p.bankAccount.branchCode}）
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">口座種別</span>
                                                    <p className="font-semibold text-gray-900">
                                                        {accountTypeLabel(p.bankAccount.accountType)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">口座番号</span>
                                                    <p className="font-mono font-semibold text-gray-900">
                                                        {p.bankAccount.accountNumber}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-500">口座名義</span>
                                                    <p className="font-semibold text-gray-900">
                                                        {p.bankAccount.accountHolder}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 text-xs text-gray-400">
                                            {p.creator.user.email && <span>Email: {p.creator.user.email}</span>}
                                            <span>生成日時: {formatDate(p.createdAt)}</span>
                                        </div>

                                        {/* 備考 */}
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                                備考（任意）
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="振込日・参照番号など"
                                                value={notes[p.id] || ""}
                                                onChange={(e) =>
                                                    setNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* 右: アクション */}
                                    <div className="flex-shrink-0 sm:ml-6">
                                        <button
                                            onClick={() =>
                                                handleComplete(p.id, p.creator.displayName, p.amount)
                                            }
                                            disabled={processing === p.id}
                                            className="rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {processing === p.id ? "処理中..." : "✓ 振込完了"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
