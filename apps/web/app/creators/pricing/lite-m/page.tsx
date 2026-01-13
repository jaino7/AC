"use client";

export default function LiteMonthlyPlanPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 py-16">
            <div className="mx-auto max-w-md">
                <div className="rounded-3xl border-2 border-neutral-200 bg-white p-8 shadow-lg">
                    {/* プラン名と説明 */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-neutral-900">Lite</h1>
                        <p className="mt-3 text-neutral-600">
                            成長中のクリエイターに最適なプラン
                        </p>
                    </div>

                    {/* 価格表示 */}
                    <div className="mt-8 text-center">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold text-neutral-900">
                                ¥4,980
                            </span>
                            <span className="text-xl text-neutral-600">/月</span>
                        </div>
                        <p className="mt-2 text-sm text-neutral-500">
                            月払いプラン
                        </p>
                    </div>

                    {/* CTAボタン */}
                    <button className="mt-8 w-full rounded-full bg-blue-600 py-4 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg">
                        Liteを利用
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
                                <h3 className="font-semibold text-neutral-900">500GB ストレージ</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    画像、動画、ファイルを大量にアップロード可能
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
                                <h3 className="font-semibold text-neutral-900">販売手数料 7.0%</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    収益の93%があなたのもの
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
                                <h3 className="font-semibold text-neutral-900">独自ドメイン</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    自分のブランドでサイトを運営
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">追加テーマ</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    プロフェッショナルなデザインテンプレートにアクセス
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900">優先サポート</h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                    問題が発生した際に迅速に対応
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
