"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { searchBanks, searchBranches } from "@/lib/bank-data";

type AccountType = "SAVINGS" | "CHECKING";

export default function EditBankAccountPage() {
    const params = useParams();
    const router = useRouter();
    const handle = params.handle as string;

    const [step, setStep] = useState(1);
    const [bankCode, setBankCode] = useState("");
    const [bankName, setBankName] = useState("");
    const [branchCode, setBranchCode] = useState("");
    const [branchName, setBranchName] = useState("");
    const [accountType, setAccountType] = useState<AccountType | "">("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");

    const [bankSearch, setBankSearch] = useState("");
    const [branchSearch, setBranchSearch] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredBanks = searchBanks(bankSearch);
    const filteredBranches = bankCode ? searchBranches(bankCode, branchSearch) : [];

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!bankCode) newErrors.bank = "金融機関を選択してください";
                break;
            case 2:
                if (!branchCode) newErrors.branch = "支店を選択してください";
                break;
            case 3:
                if (!accountType) newErrors.accountType = "口座種別を選択してください";
                break;
            case 4:
                if (!accountNumber) {
                    newErrors.accountNumber = "口座番号を入力してください";
                } else if (!/^\d{7}$/.test(accountNumber)) {
                    newErrors.accountNumber = "7桁の半角数字で入力してください";
                }
                break;
            case 5:
                if (!accountHolder) {
                    newErrors.accountHolder = "口座名義を入力してください";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 5) {
                setStep(step + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setErrors({});
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`/api/creators/${handle}/bank-account`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bankCode,
                    bankName,
                    branchCode,
                    branchName,
                    accountType,
                    accountNumber,
                    accountHolder,
                }),
            });

            if (response.ok) {
                router.push(`/creators/${handle}/earnings`);
            } else {
                alert("保存に失敗しました");
            }
        } catch (error) {
            console.error("Error saving bank account:", error);
            alert("エラーが発生しました");
        }
    };

    const steps = [
        { number: 1, label: "金融機関" },
        { number: 2, label: "支店" },
        { number: 3, label: "口座種別" },
        { number: 4, label: "口座番号" },
        { number: 5, label: "口座名義" },
    ];

    return (
        <main className="min-h-screen bg-white px-4 py-6 text-black sm:px-6 sm:py-10 lg:px-12">
            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold sm:text-3xl">振込口座の編集</h1>
                </header>

                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex min-w-0 items-start justify-between overflow-x-auto pb-2">
                        {steps.map((s, index) => (
                            <div key={s.number} className="flex shrink-0 items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm sm:h-10 sm:w-10 sm:text-base ${step >= s.number
                                            ? "bg-blue-600 text-white"
                                            : "bg-neutral-200 text-neutral-500"
                                            }`}
                                    >
                                        {s.number}
                                    </div>
                                    <p
                                        className={`mt-2 max-w-16 text-center text-[10px] leading-tight sm:max-w-none sm:text-xs ${step >= s.number ? "text-blue-600 font-semibold" : "text-neutral-500"
                                            }`}
                                    >
                                        {s.label}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`mx-2 h-0.5 w-6 sm:w-12 ${step > s.number ? "bg-blue-600" : "bg-neutral-200"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:p-8">
                    {/* Step 1: Bank Selection */}
                    {step === 1 && (
                        <div>
                            <h2 className="mb-6 text-xl font-semibold">金融機関を選択</h2>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    金融機関名を検索
                                </label>
                                <input
                                    type="text"
                                    value={bankSearch}
                                    onChange={(e) => setBankSearch(e.target.value)}
                                    placeholder="銀行名またはコードで検索（例: みずほ、mufg、0001）"
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="max-h-96 space-y-2 overflow-y-auto">
                                {filteredBanks.map((bank) => (
                                    <button
                                        key={bank.code}
                                        onClick={() => {
                                            setBankCode(bank.code);
                                            setBankName(bank.name);
                                        }}
                                        className={`w-full rounded-2xl border p-4 text-left transition-colors ${bankCode === bank.code
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-black/10 hover:bg-neutral-50"
                                            }`}
                                    >
                                        <p className="font-semibold">{bank.name}</p>
                                        <p className="text-sm text-neutral-500">コード: {bank.code}</p>
                                    </button>
                                ))}
                            </div>
                            {errors.bank && <p className="mt-2 text-sm text-red-600">{errors.bank}</p>}
                        </div>
                    )}

                    {/* Step 2: Branch Selection */}
                    {step === 2 && (
                        <div>
                            <h2 className="mb-6 text-xl font-semibold">支店を選択</h2>
                            <div className="mb-4 rounded-2xl bg-neutral-50 p-4">
                                <p className="text-sm text-neutral-500">選択した金融機関</p>
                                <p className="font-semibold">{bankName}</p>
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    支店名を検索
                                </label>
                                <input
                                    type="text"
                                    value={branchSearch}
                                    onChange={(e) => setBranchSearch(e.target.value)}
                                    placeholder="支店名またはコードで検索（例: 本店、ほんてん、001）"
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="max-h-96 space-y-2 overflow-y-auto">
                                {filteredBranches.length > 0 ? (
                                    filteredBranches.map((branch) => (
                                        <button
                                            key={branch.code}
                                            onClick={() => {
                                                setBranchCode(branch.code);
                                                setBranchName(branch.name);
                                            }}
                                            className={`w-full rounded-2xl border p-4 text-left transition-colors ${branchCode === branch.code
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-black/10 hover:bg-neutral-50"
                                                }`}
                                        >
                                            <p className="font-semibold">{branch.name}</p>
                                            <p className="text-sm text-neutral-500">コード: {branch.code}</p>
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-neutral-500 py-8">
                                        支店データがありません
                                    </p>
                                )}
                            </div>
                            {errors.branch && <p className="mt-2 text-sm text-red-600">{errors.branch}</p>}
                        </div>
                    )}

                    {/* Step 3: Account Type */}
                    {step === 3 && (
                        <div>
                            <h2 className="mb-6 text-xl font-semibold">口座種別を選択</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setAccountType("SAVINGS")}
                                    className={`w-full rounded-2xl border p-4 text-left transition-colors sm:p-6 ${accountType === "SAVINGS"
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-black/10 hover:bg-neutral-50"
                                        }`}
                                >
                                    <p className="text-lg font-semibold">普通預金</p>
                                </button>
                                <button
                                    onClick={() => setAccountType("CHECKING")}
                                    className={`w-full rounded-2xl border p-4 text-left transition-colors sm:p-6 ${accountType === "CHECKING"
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-black/10 hover:bg-neutral-50"
                                        }`}
                                >
                                    <p className="text-lg font-semibold">当座預金</p>
                                </button>
                            </div>
                            {errors.accountType && (
                                <p className="mt-2 text-sm text-red-600">{errors.accountType}</p>
                            )}
                        </div>
                    )}

                    {/* Step 4: Account Number */}
                    {step === 4 && (
                        <div>
                            <h2 className="mb-6 text-xl font-semibold">口座番号を入力</h2>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    口座番号（7桁の半角数字）
                                </label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, "");
                                        if (value.length <= 7) {
                                            setAccountNumber(value);
                                        }
                                    }}
                                    placeholder="1234567"
                                    maxLength={7}
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 text-lg tracking-wider focus:border-blue-500 focus:outline-none"
                                />
                                <p className="mt-2 text-sm text-neutral-500">
                                    {accountNumber.length}/7桁
                                </p>
                            </div>
                            {errors.accountNumber && (
                                <p className="mt-2 text-sm text-red-600">{errors.accountNumber}</p>
                            )}
                        </div>
                    )}

                    {/* Step 5: Account Holder */}
                    {step === 5 && (
                        <div>
                            <h2 className="mb-6 text-xl font-semibold">口座名義を入力</h2>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    口座名義
                                </label>
                                <input
                                    type="text"
                                    value={accountHolder}
                                    onChange={(e) => setAccountHolder(e.target.value)}
                                    placeholder="ヤマダ　タロウ"
                                    className="w-full rounded-2xl border border-black/10 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            {errors.accountHolder && (
                                <p className="mt-2 text-sm text-red-600">{errors.accountHolder}</p>
                            )}

                            {/* Confirmation */}
                            <div className="mt-8 rounded-2xl bg-neutral-50 p-4 sm:p-6">
                                <h3 className="mb-4 font-semibold">入力内容の確認</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                                        <span className="text-neutral-600">金融機関:</span>
                                        <span className="font-semibold">{bankName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                                        <span className="text-neutral-600">支店:</span>
                                        <span className="font-semibold">{branchName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                                        <span className="text-neutral-600">口座種別:</span>
                                        <span className="font-semibold">
                                            {accountType === "SAVINGS" ? "普通" : "当座"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                                        <span className="text-neutral-600">口座番号:</span>
                                        <span className="font-semibold">{accountNumber}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                                        <span className="text-neutral-600">口座名義:</span>
                                        <span className="font-semibold">{accountHolder}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-3">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold transition-colors hover:border-black/40 sm:px-6 sm:text-base"
                            >
                                戻る
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:px-6 sm:text-base"
                        >
                            {step === 5 ? "保存する" : "次へ"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
