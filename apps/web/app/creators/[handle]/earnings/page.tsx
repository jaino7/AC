"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

type BankAccount = {
    bankName: string;
    bankCode: string;
    branchName: string;
    branchCode: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
};

type EarningsData = {
    currentMonth: {
        year: number;
        month: number;
        earnings: number;
    };
    lastMonth: {
        year: number;
        month: number;
        earnings: number;
    };
};

type PaymentHistory = {
    date: string;
    amount: number;
};

export default function EarningsPage() {
    const params = useParams();
    const handle = params.handle as string;

    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch bank account
                const bankResponse = await fetch(`/api/creators/${handle}/bank-account`);
                if (bankResponse.ok) {
                    const bankData = await bankResponse.json();
                    setBankAccount(bankData.bankAccount);
                }

                // Fetch earnings data
                const earningsResponse = await fetch(`/api/creators/earnings/current-month`);
                if (earningsResponse.ok) {
                    const data = await earningsResponse.json();
                    setEarningsData(data);
                }

                // Fetch payment history
                const historyResponse = await fetch(`/api/creators/${handle}/payment-history`);
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setPaymentHistory(historyData.paymentHistory || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (handle) {
            fetchData();
        }
    }, [handle]);

    // Format account number to mask digits
    const formatAccountNumber = (number: string) => {
        return `**** **** **** ${number.slice(-4)}`;
    };

    return (
        <main className="min-h-screen bg-white px-0 py-6 md:px-6 md:py-10 text-black lg:px-12">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <header className="mb-8 px-4 md:px-0">
                    <h1 className="text-3xl font-semibold">収益と支払い</h1>
                </header>

                <div className="space-y-6 md:space-y-8">
                    {/* ウォレットカード */}
                    <div className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                        <h2 className="mb-6 text-lg font-semibold">お支払い額</h2>
                        <div className="space-y-4">
                            <div>
                                {isLoading ? (
                                    <div className="h-12 w-48 animate-pulse rounded bg-neutral-100"></div>
                                ) : (
                                    <p className="text-5xl font-bold">
                                        ¥{earningsData?.lastMonth?.earnings?.toLocaleString() || 0}
                                    </p>
                                )}
                            </div>

                            <p className="text-xs text-neutral-500">
                                ※毎月末締め、翌月末払い。残高¥5,000以上で振込されます。（手数料無料）
                            </p>
                        </div>
                    </div>

                    {/* 振込口座カード */}
                    <div className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">振込口座</h2>
                            <Link href={`/creators/${handle}/earnings/edit-bank-account`}>
                                <button className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-black/40">
                                    {bankAccount ? "編集" : "登録"}
                                </button>
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <p className="text-neutral-500">読み込み中...</p>
                            </div>
                        ) : bankAccount ? (
                            <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                                    🏦
                                </div>
                                <div>
                                    <p className="font-semibold">{bankAccount.bankName}</p>
                                    <p className="text-sm text-neutral-600">
                                        {formatAccountNumber(bankAccount.accountNumber)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-neutral-50 p-6 text-center">
                                <p className="text-neutral-600">振込口座が登録されていません</p>
                                <p className="mt-2 text-sm text-neutral-500">
                                    「登録」ボタンから振込口座を設定してください
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 支払い履歴カード */}
                    <div className="rounded-none md:rounded-3xl border-y md:border border-black/10 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                        <h2 className="mb-6 text-lg font-semibold">支払い履歴</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-black/10">
                                        <th className="pb-3 text-left text-sm font-semibold text-neutral-500">日付</th>
                                        <th className="pb-3 text-right text-sm font-semibold text-neutral-500">金額</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={2} className="py-8 text-center text-neutral-500">
                                                読み込み中...
                                            </td>
                                        </tr>
                                    ) : paymentHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="py-8 text-center text-sm text-neutral-400">
                                                支払い履歴がありません
                                            </td>
                                        </tr>
                                    ) : (
                                        paymentHistory.map((payment, index) => (
                                            <tr key={index} className="border-b border-black/5 last:border-b-0">
                                                <td className="py-4 text-sm">{payment.date}</td>
                                                <td className="py-4 text-right font-semibold">¥{payment.amount.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
