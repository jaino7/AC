"use client";

import { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { BankTransferInstructions } from "./BankTransferInstructions";

interface Plan {
    id: string;
    name: string;
    price: number;
    description: string | null;
    features?: string[];
}

interface PlanSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    plans: Plan[];
    creatorId: string;
    userId?: string;
}

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

type Step = "select" | "transfer";

export function PlanSelectionModal({
    isOpen,
    onClose,
    plans,
    creatorId,
    userId,
}: PlanSelectionModalProps) {
    const [step, setStep] = useState<Step>("select");
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectPlan = async (plan: Plan) => {
        setSelectedPlan(plan);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: plan.id,
                    creatorId,
                    userId, // TODO: 認証後は不要
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Transaction creation failed");
            }

            const data: TransactionResponse = await response.json();
            setTransaction(data);
            setStep("transfer");
        } catch (err: any) {
            setError(err.message || "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep("select");
        setSelectedPlan(null);
        setTransaction(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                    <h2 className="text-2xl font-bold text-neutral-900">
                        {step === "select" ? "プランを選択" : "振込先情報"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-2 hover:bg-neutral-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {step === "select" && (
                        <div className="space-y-4">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => handleSelectPlan(plan)}
                                    disabled={loading}
                                    className="w-full text-left rounded-xl border-2 border-neutral-200 p-6 transition-all hover:border-black hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-neutral-900">
                                                {plan.name}
                                            </h3>
                                            {plan.description && (
                                                <p className="mt-1 text-sm text-neutral-600">
                                                    {plan.description}
                                                </p>
                                            )}
                                            {plan.features && plan.features.length > 0 && (
                                                <ul className="mt-3 space-y-1">
                                                    {plan.features.map((feature, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="flex items-center gap-2 text-sm text-neutral-700"
                                                        >
                                                            <Check className="h-4 w-4 text-green-600" />
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="ml-4 text-right">
                                            <p className="text-3xl font-bold text-neutral-900">
                                                ¥{plan.price.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-neutral-600">/月</p>
                                        </div>
                                    </div>
                                    {loading && selectedPlan?.id === plan.id && (
                                        <div className="mt-4 flex items-center justify-center">
                                            <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
                                            <span className="ml-2 text-sm text-neutral-600">
                                                処理中...
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === "transfer" && transaction && (
                        <BankTransferInstructions
                            transaction={transaction}
                            onBack={() => setStep("select")}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
