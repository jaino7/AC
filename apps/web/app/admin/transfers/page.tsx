"use client";

import { useState, useEffect, useCallback } from "react";

type TabType = "creator" | "fan";

interface CreatorTransfer {
    id: string;
    creatorName: string;
    creatorHandle: string;
    creatorUserId: string | null;
    creatorEmail: string | null;
    planType: string;
    planName: string;
    isYearly: boolean;
    amount: number;
    status: string;
    billingBalance: number;
    virtualAccountNumber: string | null;
    virtualAccountBranch: string | null;
    lastTransfer: {
        id: string;
        amount: number;
        transferorName: string;
        transferDate: string;
        status: string;
    } | null;
    createdAt: string;
}

interface FanTransfer {
    id: string;
    fanName: string;
    fanUserId: string | null;
    fanEmail: string | null;
    creatorName: string;
    creatorHandle: string;
    amount: number;
    status: string;
    virtualAccountNumber: string | null;
    virtualAccountBranch: string | null;
    tier: number;
    trustScore: number;
    currentCredits: number;
    hasClaim: boolean;
    claim: {
        id: string;
        amount: number;
        status: string;
        immediateCredit: number;
        pendingCredit: number;
        claimedAt: string;
    } | null;
    lastTransfer: {
        id: string;
        amount: number;
        transferorName: string;
        transferDate: string;
        status: string;
    } | null;
    expiresAt: string;
    createdAt: string;
}

function TierBadge({ tier }: { tier: number }) {
    const config: Record<number, { label: string; color: string }> = {
        0: { label: "Tier 0", color: "bg-gray-100 text-gray-700" },
        1: { label: "Tier 1", color: "bg-blue-100 text-blue-700" },
        2: { label: "Tier 2", color: "bg-purple-100 text-purple-700" },
    };
    const { label, color } = config[tier] ?? config[0];
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
            {label}
        </span>
    );
}

interface LookupResult {
    creator: {
        name: string;
        handle: string;
        email: string | null;
        userId: string | null;
    };
    subscription: {
        id: string;
        planName: string;
        planType: string;
        isYearly: boolean;
        amount: number;
        status: string;
        billingBalance: number;
    };
    virtualAccount: {
        accountNumber: string;
        branchName: string | null;
    };
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; color: string }> = {
        PENDING: { label: "振込待ち", color: "bg-yellow-100 text-yellow-800" },
        TRANSFERRED: { label: "申告済み", color: "bg-blue-100 text-blue-800" },
        APPROVED: { label: "承認済み", color: "bg-green-100 text-green-800" },
        ACTIVE: { label: "有効", color: "bg-green-100 text-green-800" },
        REJECTED: { label: "却下", color: "bg-red-100 text-red-800" },
        EXPIRED: { label: "期限切れ", color: "bg-gray-100 text-gray-800" },
    };
    const { label, color } = config[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
            {label}
        </span>
    );
}

export default function AdminTransfersPage() {
    const [tab, setTab] = useState<TabType>("creator");
    const [creatorTransfers, setCreatorTransfers] = useState<CreatorTransfer[]>([]);
    const [fanTransfers, setFanTransfers] = useState<FanTransfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [tier0Amounts, setTier0Amounts] = useState<Record<string, number>>({});

    // Account number lookup state
    const [searchAccountNumber, setSearchAccountNumber] = useState("");
    const [searching, setSearching] = useState(false);
    const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [addAmount, setAddAmount] = useState<number>(0);
    const [updating, setUpdating] = useState(false);

    const handleLookup = async () => {
        if (!searchAccountNumber.trim()) return;
        setSearching(true);
        setLookupResult(null);
        setLookupError(null);
        setAddAmount(0);
        try {
            const res = await fetch(`/api/admin/creators/lookup?accountNumber=${encodeURIComponent(searchAccountNumber.trim())}`);
            const data = await res.json();
            if (!res.ok) {
                setLookupError(data.error || "検索に失敗しました");
                return;
            }
            setLookupResult(data);
        } catch {
            setLookupError("検索に失敗しました");
        } finally {
            setSearching(false);
        }
    };

    const handleBillingUpdate = async () => {
        if (!lookupResult || addAmount <= 0) return;
        if (!confirm(`${lookupResult.creator.name}に¥${addAmount.toLocaleString()}を加算しますか？`)) return;

        setUpdating(true);
        try {
            const res = await fetch("/api/admin/creators/billing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscriptionId: lookupResult.subscription.id,
                    amount: addAmount,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ text: data.error || "更新に失敗しました", type: "error" });
                return;
            }
            setMessage({ text: data.message + ` (¥${data.previousBalance.toLocaleString()} → ¥${data.newBalance.toLocaleString()})`, type: "success" });
            // Update the local result
            setLookupResult({
                ...lookupResult,
                subscription: {
                    ...lookupResult.subscription,
                    billingBalance: data.newBalance,
                },
            });
            setAddAmount(0);
        } catch {
            setMessage({ text: "更新に失敗しました", type: "error" });
        } finally {
            setUpdating(false);
        }
    };

    const fetchTransfers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/transfers?type=${tab}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            if (tab === "creator") {
                setCreatorTransfers(data.transfers);
            } else {
                setFanTransfers(data.transfers);
            }
        } catch {
            setMessage({ text: "データの取得に失敗しました", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        fetchTransfers();
    }, [fetchTransfers]);

    const handleConfirm = async (type: TabType, id: string, actualAmount?: number) => {
        if (!confirm("振込を確認して処理を実行しますか？")) return;

        setConfirming(id);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/transfers/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, id, actualAmount }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage({ text: data.error || "処理に失敗しました", type: "error" });
                return;
            }
            setMessage({ text: data.message, type: "success" });
            // Refresh the list
            await fetchTransfers();
        } catch {
            setMessage({ text: "処理に失敗しました", type: "error" });
        } finally {
            setConfirming(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <main className="px-6 py-10 lg:px-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">振込確認管理</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        クリエイター・ファンの振込を確認し、プラン有効化やクレジット配布を行います
                    </p>
                </header>

                {/* Flash message */}
                {message && (
                    <div
                        className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${message.type === "success"
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-red-200 bg-red-50 text-red-800"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Account Number Lookup Section */}
                <div className="mb-8 rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">🔍 口座番号からクリエイター検索</h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="口座番号を入力"
                            value={searchAccountNumber}
                            onChange={(e) => setSearchAccountNumber(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={handleLookup}
                            disabled={searching || !searchAccountNumber.trim()}
                            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {searching ? "検索中..." : "検索"}
                        </button>
                    </div>

                    {lookupError && (
                        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                            {lookupError}
                        </div>
                    )}

                    {lookupResult && (
                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {lookupResult.creator.name}
                                        </h3>
                                        <span className="text-sm text-gray-500">@{lookupResult.creator.handle}</span>
                                        <StatusBadge status={lookupResult.subscription.status} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                                        <div>
                                            <span className="text-gray-500">プラン</span>
                                            <p className="font-semibold text-gray-900">
                                                {lookupResult.subscription.planName}
                                                <span className="ml-1 text-xs text-gray-500">
                                                    ({lookupResult.subscription.isYearly ? "年額" : "月額"})
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">プラン料金</span>
                                            <p className="font-semibold text-gray-900">
                                                ¥{lookupResult.subscription.amount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">口座番号</span>
                                            <p className="font-mono font-semibold text-gray-900">
                                                {lookupResult.virtualAccount.accountNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">プリペイド残高</span>
                                            <p className="text-lg font-bold text-indigo-700">
                                                ¥{lookupResult.subscription.billingBalance.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {lookupResult.creator.email && (
                                        <p className="text-xs text-gray-400">Email: {lookupResult.creator.email}</p>
                                    )}
                                </div>
                            </div>

                            {/* Billing balance update */}
                            <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-200 bg-white px-4 py-3">
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">入金額:</span>
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="金額（円）"
                                    value={addAmount || ""}
                                    onChange={(e) => setAddAmount(parseInt(e.target.value) || 0)}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleBillingUpdate}
                                    disabled={updating || addAmount <= 0}
                                    className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
                                >
                                    {updating ? "処理中..." : `残高に +¥${(addAmount || 0).toLocaleString()} 加算`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-1 rounded-2xl bg-gray-100 p-1">
                    <button
                        onClick={() => setTab("creator")}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === "creator"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        🏢 クリエイター
                        {creatorTransfers.length > 0 && tab !== "creator" && (
                            <span className="ml-2 inline-block rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                                {creatorTransfers.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab("fan")}
                        className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === "fan"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        👤 ファン
                        {fanTransfers.length > 0 && tab !== "fan" && (
                            <span className="ml-2 inline-block rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                                {fanTransfers.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-16 text-center text-gray-500">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        読み込み中...
                    </div>
                )}

                {/* Creator Tab */}
                {!loading && tab === "creator" && (
                    <>
                        {creatorTransfers.length === 0 ? (
                            <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center">
                                <p className="text-lg font-medium text-gray-400">保留中の振込はありません</p>
                                <p className="mt-2 text-sm text-gray-400">
                                    クリエイターがプランを選択すると、ここに表示されます
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {creatorTransfers.map((t) => (
                                    <div
                                        key={t.id}
                                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            {/* Left: Info */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {t.creatorName}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">@{t.creatorHandle}</span>
                                                    <StatusBadge status={t.status} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                                                    <div>
                                                        <span className="text-gray-500">プラン</span>
                                                        <p className="font-semibold text-gray-900">
                                                            {t.planName}
                                                            <span className="ml-1 text-xs text-gray-500">
                                                                ({t.isYearly ? "年額" : "月額"})
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">金額</span>
                                                        <p className="font-semibold text-gray-900">
                                                            ¥{t.amount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">口座番号</span>
                                                        <p className="font-mono font-semibold text-gray-900">
                                                            {t.virtualAccountNumber ?? "—"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">申請日時</span>
                                                        <p className="font-medium text-gray-700">
                                                            {formatDate(t.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>


                                                {t.lastTransfer && (
                                                    <div className="rounded-xl bg-green-50 px-4 py-2 text-sm">
                                                        <span className="font-medium text-green-800">
                                                            💰 入金あり: ¥{t.lastTransfer.amount.toLocaleString()}（{t.lastTransfer.transferorName}、{formatDate(t.lastTransfer.transferDate)}）
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-1 text-xs text-gray-400">
                                                    {t.creatorUserId && <span>ID: {t.creatorUserId}</span>}
                                                    {t.creatorEmail && <span>Email: {t.creatorEmail}</span>}
                                                </div>
                                            </div>

                                            {/* Right: Action */}
                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={() => handleConfirm("creator", t.id)}
                                                    disabled={confirming === t.id}
                                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {confirming === t.id ? "処理中..." : "✓ 振込確認 → プラン有効化"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Fan Tab */}
                {!loading && tab === "fan" && (
                    <>
                        {fanTransfers.length === 0 ? (
                            <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center">
                                <p className="text-lg font-medium text-gray-400">保留中の振込はありません</p>
                                <p className="mt-2 text-sm text-gray-400">
                                    ファンがチャージ申請すると、ここに表示されます
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fanTransfers.map((t) => (
                                    <div
                                        key={t.id}
                                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            {/* Left: Info */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {t.fanName}
                                                    </h3>
                                                    <span className="text-sm text-gray-500">→ {t.creatorName}</span>
                                                    <TierBadge tier={t.tier} />
                                                    <StatusBadge status={t.status} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                                                    <div>
                                                        <span className="text-gray-500">申請金額</span>
                                                        <p className="font-semibold text-gray-900">
                                                            {t.amount === 0 ? (
                                                                <span className="text-amber-600">未確定</span>
                                                            ) : (
                                                                `¥${t.amount.toLocaleString()}`
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">口座番号</span>
                                                        <p className="font-mono font-semibold text-gray-900">
                                                            {t.virtualAccountNumber ?? "—"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">現在のクレジット</span>
                                                        <p className="font-semibold text-gray-900">
                                                            ¥{t.currentCredits.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">信頼スコア</span>
                                                        <p className="font-semibold text-gray-900">{t.trustScore}</p>
                                                    </div>
                                                </div>

                                                {/* Tier 0 amount input */}
                                                {t.amount === 0 && !t.claim && (
                                                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                                        <p className="mb-2 text-xs font-semibold text-amber-700">
                                                            📋 Tier 0 振込申告 — 実際の振込金額を入力してください
                                                        </p>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            placeholder="振込金額（円）"
                                                            value={tier0Amounts[t.id] || ""}
                                                            onChange={(e) =>
                                                                setTier0Amounts((prev) => ({
                                                                    ...prev,
                                                                    [t.id]: parseInt(e.target.value) || 0,
                                                                }))
                                                            }
                                                            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                                        />
                                                    </div>
                                                )}

                                                {/* Claim info */}
                                                {t.claim && (
                                                    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                                                        <p className="mb-1 text-xs font-semibold text-blue-700">
                                                            📋 申告あり（{formatDate(t.claim.claimedAt)}）
                                                        </p>
                                                        <div className="flex gap-6 text-sm">
                                                            <div>
                                                                <span className="text-blue-600">申告金額:</span>{" "}
                                                                <span className="font-bold text-blue-900">
                                                                    ¥{t.claim.amount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-green-600">即時付与済み:</span>{" "}
                                                                <span className="font-bold text-green-800">
                                                                    ¥{t.claim.immediateCredit.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-orange-600">保留中:</span>{" "}
                                                                <span className="font-bold text-orange-800">
                                                                    ¥{t.claim.pendingCredit.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {t.lastTransfer && (
                                                    <div className="rounded-xl bg-green-50 px-4 py-2 text-sm">
                                                        <span className="font-medium text-green-800">
                                                            💰 入金あり: ¥{t.lastTransfer.amount.toLocaleString()}（{t.lastTransfer.transferorName}、{formatDate(t.lastTransfer.transferDate)}）
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex gap-4 text-xs text-gray-400">
                                                    <span>申請日: {formatDate(t.createdAt)}</span>
                                                    <span>期限: {formatDate(t.expiresAt)}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 text-xs text-gray-400">
                                                    {t.fanUserId && <span>ID: {t.fanUserId}</span>}
                                                    {t.fanEmail && <span>Email: {t.fanEmail}</span>}
                                                </div>
                                            </div>

                                            {/* Right: Action */}
                                            <div className="flex-shrink-0">
                                                <button
                                                    onClick={() => handleConfirm(
                                                        "fan",
                                                        t.id,
                                                        t.amount === 0 && !t.claim ? tier0Amounts[t.id] : undefined
                                                    )}
                                                    disabled={
                                                        confirming === t.id ||
                                                        (t.amount === 0 && !t.claim && !(tier0Amounts[t.id] > 0))
                                                    }
                                                    className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    {confirming === t.id
                                                        ? "処理中..."
                                                        : t.amount === 0 && !t.claim
                                                            ? `✓ 確認 → +¥${(tier0Amounts[t.id] || 0).toLocaleString()} 付与`
                                                            : t.claim
                                                                ? `✓ 確認 → +¥${t.claim.pendingCredit.toLocaleString()} 付与`
                                                                : `✓ 確認 → +¥${t.amount.toLocaleString()} 付与`}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
