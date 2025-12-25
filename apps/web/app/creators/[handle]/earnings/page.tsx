"use client";

export default function EarningsPage() {
    return (
        <main className="min-h-screen bg-white px-6 py-10 text-black lg:px-12">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold">収益と支払い</h1>
                </header>

                <div className="space-y-6">
                    {/* ウォレットカード */}
                    <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                        <h2 className="mb-6 text-lg font-semibold">ウォレット</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2 text-sm text-neutral-500">お支払い額</p>
                                <p className="text-5xl font-bold">¥124,000</p>
                            </div>

                            <p className="text-xs text-neutral-500">
                                ※毎月末締め、翌月末払い。残高¥5,000以上で振込されます。（手数料無料）
                            </p>
                        </div>
                    </div>

                    {/* 振込口座カード */}
                    <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">振込口座</h2>
                            <button className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-black/40">
                                編集
                            </button>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                                🏦
                            </div>
                            <div>
                                <p className="font-semibold">三井住友銀行</p>
                                <p className="text-sm text-neutral-600">**** **** **** 1234</p>
                            </div>
                        </div>
                    </div>

                    {/* 支払い履歴カード */}
                    <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                        <h2 className="mb-6 text-lg font-semibold">支払い履歴</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-black/10">
                                        <th className="pb-3 text-left text-sm font-semibold text-neutral-500">日付</th>
                                        <th className="pb-3 text-left text-sm font-semibold text-neutral-500">金額</th>
                                        <th className="pb-3 text-left text-sm font-semibold text-neutral-500">ステータス</th>
                                        <th className="pb-3 text-left text-sm font-semibold text-neutral-500">請求書</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-black/5">
                                        <td className="py-4 text-sm">2024/11/30</td>
                                        <td className="py-4 font-semibold">¥124,000</td>
                                        <td className="py-4">
                                            <span className="text-sm font-semibold text-yellow-600">処理中</span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-neutral-400 hover:text-black">↓</button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-black/5">
                                        <td className="py-4 text-sm">2024/10/31</td>
                                        <td className="py-4 font-semibold">¥150,000</td>
                                        <td className="py-4">
                                            <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                                <span className="inline-block h-2 w-2 rounded-full bg-green-600"></span>
                                                振込完了
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-neutral-400 hover:text-black">↓</button>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-black/5">
                                        <td className="py-4 text-sm">2024/09/30</td>
                                        <td className="py-4 font-semibold">¥125,500</td>
                                        <td className="py-4">
                                            <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                                <span className="inline-block h-2 w-2 rounded-full bg-green-600"></span>
                                                振込完了
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-neutral-400 hover:text-black">↓</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 text-sm">2024/08/30</td>
                                        <td className="py-4 font-semibold">¥125,500</td>
                                        <td className="py-4">
                                            <span className="flex items-center gap-2 text-sm font-semibold text-red-600">
                                                <span className="inline-block h-2 w-2 rounded-full bg-red-600"></span>
                                                振込失敗
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-neutral-400 hover:text-black">↓</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
