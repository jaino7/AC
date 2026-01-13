"use client";

export default function BusinessYearlyPlanPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 py-16">
            <div className="mx-auto max-w-md">
                <div className="rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-lg">
                    {/* プラン名と説明 */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-neutral-900">Business</h1>
                        <p className="mt-3 text-neutral-600">
                            大規模な収益化に対応したプロフェッショナルプラン
                        </p>
                    </div>

                    {/* 価格表示 */}
                    <div className="mt-8 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold text-neutral-900">
                                ¥24,833
                            </span>
                            <span className="text-xl text-neutral-600">/月</span>
                        </div>
                        <p className="mt-2 text-sm text-neutral-500">
                            年払いプラン（年間 ¥298,000）
                        </p>
                        <p className="mt-1 text-xs text-blue-600 font-semibold">
                            約2ヶ月分お得！
                        </p>
                    </div>

                    {/* CTAボタン */}
                    <button className="mt-8 w-full rounded-full bg-blue-600 py-4 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg">
                        Businessを利用
                    </button>

                    {/* 特典リスト */}
                    <div className="mt-10 space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">無制限ストレージ</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    容量を気にせず無制限にコンテンツをアップロード
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">販売手数料 3.0%</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    収益の97%があなたのもの。最高の還元率
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">独自ドメイン &amp; カスタマイズ</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    完全にカスタマイズされたブランド体験を提供
                                </p>
                            </div>
                        </div>



                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">最優先サポート</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    専任チームによる24時間以内の対応保証
                                </p>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </main>
    );
}
