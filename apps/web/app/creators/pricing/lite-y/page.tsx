"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LiteYearlyPlanPage() {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState<any>(null);
    const router = useRouter();
    const { data: session, status } = useSession();

    const planDetails = {
        name: "Lite",
        type: "LITE",
        isYearly: true,
        price: 40000,
        monthlyEquivalent: Math.floor(40000 / 12),
        description: "成長中のクリエイターに最適なプラン",
        features: [
            { title: "200GB ストレージ", description: "画像、動画、ファイルを大量にアップロード可能" },
            { title: "販売手数料 6.0%", description: "収益の94%があなたのもの" },
            { title: "独自ドメイン", description: "自分のブランドでサイトを運営" },
            { title: "追加テーマ", description: "プロフェッショナルなデザインテンプレートにアクセス" },
            { title: "優先サポート", description: "問題が発生した際に迅速に対応" },
        ],
    };

    const handlePurchase = async () => {
        // Check authentication
        if (status === "unauthenticated") {
            alert("このプランを利用するにはログインが必要です");
            router.push("/creators/login");
            return;
        }

        if (status === "loading") {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/payments/creator-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planType: planDetails.type,
                    isYearly: planDetails.isYearly,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "支払い情報の取得に失敗しました");
            }

            const data = await response.json();
            setPaymentInfo(data);
            setShowModal(true);
        } catch (error) {
            console.error("Error:", error);
            alert(error instanceof Error ? error.message : "エラーが発生しました。もう一度お試しください。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 py-16">
            <div className="mx-auto max-w-md">
                <div className="rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-lg">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-neutral-900">{planDetails.name}</h1>
                        <p className="mt-3 text-neutral-600">{planDetails.description}</p>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold text-neutral-900">
                                ¥{planDetails.monthlyEquivalent.toLocaleString()}
                            </span>
                            <span className="text-xl text-neutral-600">/月</span>
                        </div>
                        <p className="mt-2 text-sm text-neutral-500">
                            年払い ¥{planDetails.price.toLocaleString()}（2ヶ月分お得）
                        </p>
                    </div>

                    <button
                        onClick={handlePurchase}
                        disabled={loading || status === "loading"}
                        className="mt-8 w-full rounded-full bg-blue-600 py-4 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50"
                    >
                        {loading ? "処理中..." : status === "unauthenticated" ? "ログインして利用" : "Liteを利用"}
                    </button>

                    <div className="mt-10 space-y-6">
                        {planDetails.features.map((feature, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900">{feature.title}</h3>
                                    <p className="mt-1 text-sm text-neutral-600">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && paymentInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-neutral-900">お振込のご案内</h2>
                            <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-lg bg-blue-50 p-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600">お支払い金額</span>
                                    <span className="text-3xl font-bold text-blue-600">¥{paymentInfo.amount.toLocaleString()}</span>
                                </div>
                                <div className="mt-2 text-sm text-neutral-600">{planDetails.name}プラン（年払い）</div>
                            </div>

                            <div className="space-y-4 rounded-lg border-2 border-neutral-200 p-6">
                                <h3 className="font-bold text-neutral-900">振込先口座</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">金融機関</span>
                                        <span className="font-semibold">GMOあおぞらネット銀行</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">支店名</span>
                                        <span className="font-semibold">{paymentInfo.virtualAccount.branchName || `${paymentInfo.virtualAccount.branchCode || "法人第一"}支店`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">口座種別</span>
                                        <span className="font-semibold">普通</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">口座番号</span>
                                        <span className="font-mono text-lg font-bold text-blue-600">{paymentInfo.virtualAccount.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">口座名義</span>
                                        <span className="font-semibold">{paymentInfo.virtualAccount.accountName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-neutral-50 p-6">
                                <h4 className="mb-3 font-bold text-neutral-900">ご注意</h4>
                                <ul className="space-y-2 text-sm text-neutral-600">
                                    <li>• 振込手数料はお客様のご負担となります</li>
                                    <li>• 入金確認は10分〜1日程度かかる場合があります</li>
                                    <li>• 入金確認後、自動的にプランが有効化されます</li>
                                    <li>• プリペイド残高にプラン額を入れておくと、更新日に自動引き落としされます</li>
                                </ul>
                            </div>

                            <button onClick={() => setShowModal(false)} className="w-full rounded-full bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700">
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
