"use client";

import { useState } from "react";
import { Copy, Check, Info, Building2, CreditCard, AlertCircle } from "lucide-react";

interface TransactionResponse {
    transactionId: string;
    amount: number;
    status: string;
    identifierCode: string;
    bankInfo: {
        bankName: string;
        branchName: string;
        accountType: string;
        accountNumber: string;
        accountHolder: string;
        transferInstructions: string;
    };
    expiresAt: string;
}

interface BankTransferInstructionsProps {
    transaction: TransactionResponse;
    onBack?: () => void;
}

export function BankTransferInstructions({
    transaction,
    onBack,
}: BankTransferInstructionsProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const expiresDate = new Date(transaction.expiresAt);

    return (
        <div className="space-y-6">
            {/* 重要な注意事項 */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">
                            振込依頼人名の変更が必須です
                        </h3>
                        <p className="text-sm text-blue-800">
                            ご入金を正確に確認するため、振込依頼人名を必ず以下の形式に変更してください。
                        </p>
                    </div>
                </div>
            </div>

            {/* 振込依頼人名 */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-bold text-indigo-900">振込依頼人名（必須変更）</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-indigo-300">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs text-neutral-600 mb-1">以下の形式で入力してください</p>
                            <p className="text-2xl font-mono font-bold text-neutral-900">
                                <span className="text-indigo-600">{transaction.identifierCode}</span>
                                {" "}
                                <span className="text-neutral-400">ヤマダタロウ</span>
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                （{transaction.identifierCode} + 半角スペース + あなたの名前）
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                copyToClipboard(transaction.identifierCode, "identifier")
                            }
                            className="flex-shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            {copiedField === "identifier" ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    <span className="text-sm font-semibold">コピー完了</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    <span className="text-sm font-semibold">IDをコピー</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 振込先情報 */}
            <div className="rounded-xl border-2 border-neutral-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-neutral-700" />
                    <h3 className="font-bold text-neutral-900">振込先口座</h3>
                </div>

                <div className="space-y-4">
                    {/* 銀行名 */}
                    <div>
                        <p className="text-xs text-neutral-600 mb-1">銀行名</p>
                        <p className="text-lg font-semibold text-neutral-900">
                            {transaction.bankInfo.bankName}
                        </p>
                    </div>

                    {/* 支店名 */}
                    <div>
                        <p className="text-xs text-neutral-600 mb-1">支店名</p>
                        <p className="text-lg font-semibold text-neutral-900">
                            {transaction.bankInfo.branchName}
                        </p>
                    </div>

                    {/* 口座種別 */}
                    <div>
                        <p className="text-xs text-neutral-600 mb-1">口座種別</p>
                        <p className="text-lg font-semibold text-neutral-900">
                            {transaction.bankInfo.accountType}
                        </p>
                    </div>

                    {/* 口座番号 */}
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-xs text-neutral-600 mb-1">口座番号</p>
                                <p className="text-2xl font-mono font-bold text-neutral-900">
                                    {transaction.bankInfo.accountNumber}
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    copyToClipboard(
                                        transaction.bankInfo.accountNumber,
                                        "accountNumber"
                                    )
                                }
                                className="flex-shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 transition-colors flex items-center gap-2"
                            >
                                {copiedField === "accountNumber" ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span className="text-sm font-semibold">コピー完了</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        <span className="text-sm font-semibold">コピー</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 口座名義 */}
                    <div>
                        <p className="text-xs text-neutral-600 mb-1">口座名義</p>
                        <p className="text-lg font-semibold text-neutral-900">
                            {transaction.bankInfo.accountHolder}
                        </p>
                    </div>

                    {/* 振込金額 */}
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                        <p className="text-xs text-neutral-600 mb-1">振込金額</p>
                        <p className="text-3xl font-bold text-neutral-900">
                            ¥{transaction.amount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* 信頼性向上の注釈 */}
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-yellow-900">
                            <strong>※ 口座名義について：</strong>
                            銀行の規定により代表者名が併記されていますが、運営事務局の正規の管理口座です。安心してお振込みください。
                        </p>
                    </div>
                </div>
            </div>

            {/* 有効期限 */}
            <div className="text-center text-sm text-neutral-600">
                <p>
                    振込有効期限:{" "}
                    <span className="font-semibold text-neutral-900">
                        {expiresDate.toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                </p>
            </div>

            {/* アクションボタン */}
            {onBack && (
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 rounded-xl border-2 border-neutral-300 bg-white px-6 py-3 font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                        プラン選択に戻る
                    </button>
                </div>
            )}
        </div>
    );
}
