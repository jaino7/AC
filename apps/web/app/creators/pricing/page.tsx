"use client";

import Link from "next/link";
import { useState } from "react";

type BillingCycle = "monthly" | "yearly";

type Plan = {
    id: string;
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    description: string;
    features: string[];
    highlighted?: boolean;
    cta: string;
};

const plans: Plan[] = [
    {
        id: "lite",
        name: "Lite",
        price: {
            monthly: 2980,
            yearly: 29800, // 2ヶ月分お得
        },
        description: "成長中のクリエイターに最適",
        features: [
            "200GB ストレージ",
            "販売手数料 5.0%",
            "独自ドメイン & 追加テーマ",
        ],
        highlighted: true,
        cta: "Liteを選択",
    },
    {
        id: "business",
        name: "Business",
        price: {
            monthly: 19800,
            yearly: 198000,
        },
        description: "大規模な収益化に対応",
        features: [
            "1TB ストレージ",
            "販売手数料 2.8%",
            "優先サポート",
        ],
        cta: "Businessを選択",
    },
];

const comparisonFeatures = [
    { name: "月額料金", free: "0円", lite: "2,980円 (年払い: 29,800円)", business: "19,800円 (年払い: 198,000円)" },
    { name: "販売手数料", free: "8%", lite: "5%", business: "2.8%" },
    { name: "ストレージ", free: "15GB", lite: "200GB", business: "1TB" },
    { name: "独自ドメイン", free: "×", lite: "○", business: "○" },
    { name: "カスタム設定", free: "標準のみ", lite: "追加テーマ", business: "カスタマイズOK" },
    { name: "サポート対応", free: "通常", lite: "優先", business: "最優先" },
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

    return (
        <main className="min-h-screen bg-white text-black">
            {/* Hero Section */}
            <section className="px-6 py-16 text-center">
                <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                    クリエイティビティを加速する
                    <br />
                    <span className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">プランを選択</span>
                </h1>

                {/* Billing Toggle */}
                <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${billingCycle === "monthly"
                            ? "bg-black text-white"
                            : "bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-400"
                            }`}
                    >
                        月払い
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${billingCycle === "yearly"
                            ? "bg-black text-white"
                            : "bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-400"
                            }`}
                    >
                        年払い（2ヶ月分お得）
                    </button>

                </div>
            </section>

            {/* Pricing Cards */}
            <section className="mx-auto max-w-7xl px-6 pb-16">
                <div className="grid gap-8 md:grid-cols-2">
                    {plans.filter(plan => plan.id !== "starter").map((plan) => {
                        const price = plan.price[billingCycle];
                        const isPopular = plan.highlighted;

                        return (
                            <div
                                key={plan.id}
                                className="relative rounded-2xl border-2 border-blue-600 bg-white p-10 text-black transition-all shadow-lg hover:shadow-xl"
                            >
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                                    <p className="mt-2 text-sm text-neutral-600">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mt-6 text-center">
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-bold">
                                            ¥
                                            {billingCycle === "yearly" && price > 0
                                                ? Math.floor(price / 12).toLocaleString("ja-JP")
                                                : price.toLocaleString("ja-JP")}
                                        </span>
                                        <span className="text-sm text-neutral-600">
                                            /月
                                        </span>
                                    </div>
                                    {price === 0 ? (
                                        <p className="mt-1 text-xs text-neutral-500">
                                            永久無料
                                        </p>
                                    ) : billingCycle === "yearly" ? (
                                        <p className="mt-1 text-xs text-neutral-500">
                                            年間 ¥{price.toLocaleString("ja-JP")}
                                        </p>
                                    ) : null}
                                </div>

                                <Link
                                    href="/creators/dashboard"
                                    className="mt-8 block w-full rounded-full bg-blue-600 py-4 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                                >
                                    設定画面からプランを選択
                                </Link>

                                <ul className="mt-8 space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3 text-base">
                                            <svg className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-neutral-700">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Comparison Table */}
            <section className="border-t border-black/10 bg-neutral-50 px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-4 text-center text-4xl font-bold">
                        プラン比較
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="px-6 py-4 text-left font-bold">機能</th>
                                    <th className="px-6 py-4 text-center font-bold">Free</th>
                                    <th className="px-6 py-4 text-center font-bold">Lite</th>
                                    <th className="px-6 py-4 text-center font-bold">Business</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonFeatures.map((feature, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-black/10 transition-colors hover:bg-white"
                                    >
                                        <td className="px-6 py-5 font-semibold">{feature.name}</td>
                                        <td className="px-6 py-5 text-center text-neutral-600">
                                            {feature.free}
                                        </td>
                                        <td className="px-6 py-5 text-center font-semibold">
                                            {feature.lite}
                                        </td>
                                        <td className="px-6 py-5 text-center font-semibold">
                                            {feature.business}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    );
}
