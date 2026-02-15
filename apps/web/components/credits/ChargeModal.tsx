"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ChargeStep = "bank-info" | "confirm" | "input" | "done";

interface BankInfo {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
}

interface ThemeStyle {
    text: string;
    textMuted: string;
    accent: string;
    modal: string;
    inputClass: string;
    primaryBtn: string;
    secondaryBtn: string;
    infoBox: string;
    infoText: string;
    copyBtn: string;
    row: string;
    divider: string;
    stepActive: string;
    stepDone: string;
    stepInactive: string;
}

const THEME_STYLES: Record<string, ThemeStyle> = {
    "creator-pro": {
        text: "text-white",
        textMuted: "text-white/60",
        accent: "text-cyan-400",
        modal: "bg-[#161b22] border border-gray-800",
        inputClass: "border-gray-700 bg-[#0d1117] text-white focus:border-cyan-400",
        primaryBtn: "bg-cyan-500 text-black hover:bg-cyan-400",
        secondaryBtn: "border border-gray-700 text-white hover:bg-white/10",
        infoBox: "bg-cyan-400/10 border border-cyan-400/30",
        infoText: "text-cyan-400",
        copyBtn: "text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition",
        row: "bg-[#0d1117] border border-gray-800",
        divider: "border-gray-800",
        stepActive: "bg-cyan-400/20 text-cyan-400",
        stepDone: "bg-cyan-400/20 text-cyan-400",
        stepInactive: "bg-white/10 text-white/30",
    },
    "neon-pro": {
        text: "text-white",
        textMuted: "text-white/60",
        accent: "text-fuchsia-400",
        modal: "border border-fuchsia-500/30 bg-gradient-to-br from-[#0f0f18] to-[#1a0a20]",
        inputClass: "border-fuchsia-500/30 bg-[#0a0a0f] text-white focus:border-fuchsia-500",
        primaryBtn: "bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-black",
        secondaryBtn: "border border-fuchsia-500/30 text-white hover:bg-fuchsia-500/10",
        infoBox: "bg-fuchsia-500/10 border border-fuchsia-500/30",
        infoText: "text-fuchsia-400",
        copyBtn: "text-xs px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30 transition",
        row: "bg-[#0a0a0f] border border-fuchsia-500/20",
        divider: "border-fuchsia-500/20",
        stepActive: "bg-fuchsia-500/20 text-fuchsia-400",
        stepDone: "bg-fuchsia-500/20 text-fuchsia-400",
        stepInactive: "bg-white/10 text-white/30",
    },
    "pure-lite": {
        text: "text-[#2d2a26]",
        textMuted: "text-[#2d2a26]/60",
        accent: "text-pink-500",
        modal: "bg-white",
        inputClass: "border-[#f3e8e2] bg-[#fff8f5] text-[#2d2a26] focus:border-pink-400",
        primaryBtn: "bg-gradient-to-r from-pink-400 to-rose-500 text-white hover:opacity-90",
        secondaryBtn: "border border-[#f3e8e2] text-[#2d2a26] hover:bg-[#fff8f5]",
        infoBox: "bg-pink-50 border border-pink-200",
        infoText: "text-pink-600",
        copyBtn: "text-xs px-2 py-0.5 rounded bg-pink-100 text-pink-600 hover:bg-pink-200 transition",
        row: "bg-[#fff8f5] border border-[#f3e8e2]",
        divider: "border-[#f3e8e2]",
        stepActive: "bg-pink-100 text-pink-600",
        stepDone: "bg-pink-100 text-pink-600",
        stepInactive: "bg-gray-100 text-gray-400",
    },
    "studio-pro": {
        text: "text-white",
        textMuted: "text-white/60",
        accent: "text-[#2f6dff]",
        modal: "bg-[#070e1e] border border-white/10",
        inputClass: "border-white/10 bg-[#030814] text-white focus:border-[#2f6dff]",
        primaryBtn: "bg-[#2f6dff] text-white hover:bg-[#2563eb]",
        secondaryBtn: "border border-white/20 text-white hover:bg-white/10",
        infoBox: "bg-[#2f6dff]/10 border border-[#2f6dff]/30",
        infoText: "text-[#2f6dff]",
        copyBtn: "text-xs px-2 py-0.5 rounded bg-[#2f6dff]/20 text-[#2f6dff] hover:bg-[#2f6dff]/30 transition",
        row: "bg-[#030814] border border-white/10",
        divider: "border-white/10",
        stepActive: "bg-[#2f6dff]/20 text-[#2f6dff]",
        stepDone: "bg-[#2f6dff]/20 text-[#2f6dff]",
        stepInactive: "bg-white/10 text-white/30",
    },
    "velvet-pro": {
        text: "text-white",
        textMuted: "text-white/60",
        accent: "text-yellow-400",
        modal: "bg-[#151316] border border-white/10",
        inputClass: "border-white/10 bg-[#0b0a0d] text-white focus:border-yellow-400",
        primaryBtn: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:opacity-90",
        secondaryBtn: "border border-white/20 text-white hover:bg-white/10",
        infoBox: "bg-yellow-400/10 border border-yellow-400/30",
        infoText: "text-yellow-400",
        copyBtn: "text-xs px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 transition",
        row: "bg-[#0b0a0d] border border-white/10",
        divider: "border-white/10",
        stepActive: "bg-yellow-400/20 text-yellow-400",
        stepDone: "bg-yellow-400/20 text-yellow-400",
        stepInactive: "bg-white/10 text-white/30",
    },
    "zine-lite": {
        text: "text-white",
        textMuted: "text-white/60",
        accent: "text-green-400",
        modal: "bg-[#111111] border border-white/10",
        inputClass: "border-white/10 bg-black text-white focus:border-green-400",
        primaryBtn: "bg-gradient-to-r from-green-400 to-emerald-500 text-black hover:opacity-90",
        secondaryBtn: "border border-white/20 text-white hover:bg-white/10",
        infoBox: "bg-green-400/10 border border-green-400/30",
        infoText: "text-green-400",
        copyBtn: "text-xs px-2 py-0.5 rounded bg-green-400/20 text-green-400 hover:bg-green-400/30 transition",
        row: "bg-black border border-white/10",
        divider: "border-white/10",
        stepActive: "bg-green-400/20 text-green-400",
        stepDone: "bg-green-400/20 text-green-400",
        stepInactive: "bg-white/10 text-white/30",
    },
};

const TIER_IMMEDIATE_LIMIT: Record<number, number> = { 0: 0, 1: 3000, 2: 20000 };

interface ChargeModalProps {
    handle?: string;
    tier: number;
    variant: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function ChargeModal({ handle, tier, variant, onClose, onSuccess }: ChargeModalProps) {
    const s = THEME_STYLES[variant] ?? THEME_STYLES["creator-pro"];

    const [step, setStep] = useState<ChargeStep>("bank-info");
    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
    const [bankLoading, setBankLoading] = useState(true);
    const [bankError, setBankError] = useState<string | null>(null);

    const [creatorId, setCreatorId] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [penaltyAgreed, setPenaltyAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [claimResult, setClaimResult] = useState<{ immediateCredit: number; pendingCredit: number } | null>(null);

    const immediateLimit = TIER_IMMEDIATE_LIMIT[tier] ?? 0;
    const previewImmediate = Math.min(amount, immediateLimit);
    const previewPending = Math.max(amount - immediateLimit, 0);

    useEffect(() => {
        // Fetch creator ID
        if (handle) {
            fetch(`/api/creators/profile?handle=${handle}`)
                .then((r) => r.json())
                .then((d) => { if (d.id) setCreatorId(d.id); })
                .catch(() => {});
        }

        // Fetch bank info upfront (from real pool)
        const url = handle ? `/api/fans/credits/virtual-account?handle=${handle}` : "/api/fans/credits/virtual-account";
        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error("failed");
                return r.json();
            })
            .then((d) => { setBankInfo(d.virtualAccount?.bankInfo ?? null); })
            .catch(() => { setBankError("口座情報の取得に失敗しました"); })
            .finally(() => { setBankLoading(false); });
    }, [handle]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).catch(() => {});
    };

    const handleConfirm = () => {
        if (tier === 0) {
            // Tier 0: No claim needed, just show done
            setStep("done");
        } else {
            // Tier 1+: Proceed to amount input
            setStep("input");
        }
    };

    const handleSubmit = async () => {
        if (!creatorId) {
            setError("クリエイター情報の取得に失敗しました");
            return;
        }
        if (amount < 1000 || amount > 100000) {
            setError("金額は1,000円以上100,000円以下で入力してください");
            return;
        }
        if (!penaltyAgreed) {
            setError("ペナルティへの同意が必要です");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            // Create charge request
            const chargeRes = await fetch("/api/fans/credits/charge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, creatorId }),
            });
            if (!chargeRes.ok) {
                const data = await chargeRes.json();
                setError(data.error ?? "チャージ申請の作成に失敗しました");
                return;
            }
            const chargeData = await chargeRes.json();
            const chargeRequestId = chargeData.chargeRequest?.id;

            // Submit claim
            const claimRes = await fetch("/api/fans/credits/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chargeRequestId, creatorId }),
            });
            if (!claimRes.ok) {
                const data = await claimRes.json();
                setError(data.error ?? "申告の送信に失敗しました");
                return;
            }
            const claimData = await claimRes.json();
            setClaimResult({ immediateCredit: claimData.immediateCredit, pendingCredit: claimData.pendingCredit });
            setStep("done");
            onSuccess?.();
        } catch {
            setError("処理に失敗しました");
        } finally {
            setSubmitting(false);
        }
    };

    const getStepLabel = () => {
        if (tier === 0) return ["振込先確認", "完了"];
        return ["振込先確認", "振込確認", "金額入力"];
    };

    const getStepNumber = () => {
        if (step === "bank-info") return 0;
        if (step === "confirm") return 1;
        if (step === "input") return 2;
        if (step === "done") return tier === 0 ? 1 : 2;
        return 0;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className={`w-full max-w-md rounded-2xl p-8 ${s.modal} max-h-[90vh] overflow-y-auto`}>

                {/* Step indicator */}
                {step !== "done" && (
                    <div className="flex items-center gap-2 mb-6">
                        {getStepLabel().map((label, i) => (
                            <div key={label} className="flex items-center gap-2 flex-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    getStepNumber() === i
                                        ? s.stepActive
                                        : getStepNumber() > i
                                        ? s.stepDone
                                        : s.stepInactive
                                }`}>{i + 1}</div>
                                <span className={`text-xs hidden sm:block ${
                                    getStepNumber() === i ? s.accent : s.textMuted
                                }`}>{label}</span>
                                {i < getStepLabel().length - 1 && <div className={`flex-1 h-px ${getStepNumber() > i ? "bg-current opacity-30" : "bg-white/10"}`} />}
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 1: Bank Info */}
                {step === "bank-info" && (
                    <>
                        <h3 className={`text-xl font-semibold mb-2 ${s.text}`}>振込先情報</h3>
                        <p className={`text-sm mb-4 ${s.textMuted}`}>以下の口座へ振り込んでください</p>
                        <div className={`rounded-xl p-3 mb-4 text-center ${s.infoBox}`}>
                            <p className={`font-bold ${s.infoText}`}>💴 1円 ＝ 1クレジット</p>
                        </div>
                        {bankLoading ? (
                            <p className={`text-sm text-center py-8 ${s.textMuted}`}>読み込み中...</p>
                        ) : bankError ? (
                            <p className="text-red-400 text-sm text-center py-8">{bankError}</p>
                        ) : bankInfo ? (
                            <div className={`rounded-xl p-4 mb-4 space-y-3 ${s.row}`}>
                                {[
                                    { label: "銀行名", value: bankInfo.bankName, showCopy: false },
                                    { label: "支店名", value: bankInfo.branchName, showCopy: false },
                                    { label: "口座種別", value: bankInfo.accountType, showCopy: false },
                                    { label: "口座番号", value: bankInfo.accountNumber, showCopy: true },
                                    { label: "口座名義", value: bankInfo.accountHolder, showCopy: false },
                                ].map(({ label, value, showCopy }) => (
                                    <div key={label} className="flex items-center justify-between gap-3">
                                        <span className={`text-xs flex-shrink-0 ${s.textMuted}`}>{label}</span>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`text-sm font-semibold truncate ${s.text}`}>{value}</span>
                                            {showCopy && (
                                                <button onClick={() => copyToClipboard(value)} className={s.copyBtn}>
                                                    コピー
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <div className="flex gap-3">
                            <button onClick={onClose} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${s.secondaryBtn}`}>
                                キャンセル
                            </button>
                            <button
                                onClick={() => setStep("confirm")}
                                disabled={bankLoading || !!bankError}
                                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${s.primaryBtn}`}
                            >
                                次へ →
                            </button>
                        </div>
                    </>
                )}

                {/* Step 2: Confirm Transfer */}
                {step === "confirm" && (
                    <>
                        <h3 className={`text-xl font-semibold mb-2 ${s.text}`}>振込確認</h3>
                        <p className={`text-sm mb-5 ${s.textMuted}`}>表示された口座へ振り込みを完了しましたか？</p>

                        <div className={`rounded-xl p-5 mb-5 ${s.infoBox}`}>
                            <p className={`text-sm leading-relaxed ${s.infoText}`}>
                                {tier === 0
                                    ? "入金確認は10分〜1日程度かかる場合があります。確認後、クレジットが自動的に付与されます。"
                                    : "この後、振り込んだ金額を入力いただくことで、一部のクレジットがすぐに利用可能になります。"}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setStep("bank-info")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${s.secondaryBtn}`}>
                                ← 戻る
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${s.primaryBtn}`}
                            >
                                {tier === 0 ? "振り込みました" : "申告へ進む →"}
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Amount input + declaration (Tier 1+ only) */}
                {step === "input" && (
                    <>
                        <h3 className={`text-xl font-semibold mb-2 ${s.text}`}>振込金額を申告</h3>
                        <p className={`text-sm mb-5 ${s.textMuted}`}>振り込んだ金額を入力してください</p>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {[1000, 3000, 5000, 10000, 30000, 50000].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setAmount(v)}
                                    className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                                        amount === v ? `${s.infoBox} ${s.infoText}` : s.secondaryBtn
                                    }`}
                                >
                                    ¥{v.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            min={1000}
                            max={100000}
                            value={amount || ""}
                            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                            className={`w-full rounded-xl border px-4 py-3 focus:outline-none mb-1 ${s.inputClass}`}
                            placeholder="金額を入力"
                        />
                        <p className={`text-xs mb-4 ${s.textMuted}`}>最小: ¥1,000 / 最大: ¥100,000</p>

                        {/* Preview */}
                        {amount > 0 && (
                            <div className={`rounded-xl p-4 mb-4 space-y-2 ${s.row}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs ${s.textMuted}`}>即時付与（申告後すぐ）</span>
                                    <span className={`font-bold ${s.accent}`}>+{previewImmediate.toLocaleString()}円</span>
                                </div>
                                {previewPending > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs ${s.textMuted}`}>入金確認後に付与</span>
                                        <span className="font-semibold text-orange-400">+{previewPending.toLocaleString()}円</span>
                                    </div>
                                )}
                                <div className={`pt-2 border-t ${s.divider}`}>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-semibold ${s.text}`}>合計</span>
                                        <span className={`font-bold ${s.text}`}>+{amount.toLocaleString()}円</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Penalty checkbox */}
                        <label className="flex items-start gap-3 mb-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={penaltyAgreed}
                                onChange={(e) => setPenaltyAgreed(e.target.checked)}
                                className="mt-0.5 w-4 h-4 flex-shrink-0"
                            />
                            <span className={`text-xs leading-relaxed ${s.textMuted}`}>
                                虚偽申告によるペナルティに同意します（
                                <Link href="/trust-guide" target="_blank" className={`underline ${s.accent}`}>詳細</Link>
                                ）
                            </span>
                        </label>

                        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                        <div className="flex gap-3">
                            <button onClick={() => setStep("confirm")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${s.secondaryBtn}`}>
                                ← 戻る
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || amount < 1000 || !creatorId || !penaltyAgreed}
                                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${s.primaryBtn}`}
                            >
                                {submitting ? "送信中..." : "申告する"}
                            </button>
                        </div>
                    </>
                )}

                {/* Done */}
                {step === "done" && (
                    <>
                        <h3 className={`text-xl font-semibold mb-4 ${s.accent}`}>
                            {tier === 0 ? "振込受付完了" : "申告完了"}
                        </h3>
                        {tier === 0 ? (
                            <div className={`rounded-xl p-6 mb-6 ${s.infoBox}`}>
                                <p className={`text-sm leading-relaxed ${s.infoText}`}>
                                    入金確認は10分〜1日程度かかる場合があります。しばらくお待ちください。
                                </p>
                            </div>
                        ) : claimResult && (
                            <div className={`rounded-xl p-6 mb-6 space-y-3 ${s.infoBox}`}>
                                <div className="flex justify-between items-center">
                                    <span className={`text-sm ${s.textMuted}`}>即時付与</span>
                                    <span className={`font-bold text-lg ${s.infoText}`}>+{claimResult.immediateCredit.toLocaleString()}円</span>
                                </div>
                                {claimResult.pendingCredit > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className={`text-sm ${s.textMuted}`}>入金確認後に付与</span>
                                        <span className="font-semibold text-orange-400">+{claimResult.pendingCredit.toLocaleString()}円</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={onClose} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${s.primaryBtn}`}>
                            閉じる
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
