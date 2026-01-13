"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Fan = {
    id: string;
    name: string;
    avatar: string;
    // Plan related
    plan?: { name: string; id: string };
    planDurationMonths?: number;
    lastUpdated?: string;

    // Purchase related
    purchasedTitles?: string[];
    purchaseCount?: number;
    lastPurchasedDate?: string;

    hasTwitter: boolean;
    totalSupport: number;
    status: "active" | "inactive";
};

type AnalyticsData = {
    plans: {
        revenue30d: number;
        planMembers: number;
        acquiredMembers30d: number;
        cancellations30d: number;
    };
    purchases: {
        revenue30d: number;
        purchaseCount30d: number;
        purchaserCount30d: number;
        averagePrice: number;
    };
    charts: {
        planA: Array<{ date: string; count: number }>;
        planB: Array<{ date: string; count: number }>;
        purchases: Array<{ date: string; count: number }>;
    };
};

export default function FanManagementPage() {
    const params = useParams();
    const handle = params.handle as string;

    const [activeTab, setActiveTab] = useState<"plans" | "purchases">("plans");
    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState("全て");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [fans, setFans] = useState<Fan[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch fans data
    useEffect(() => {
        const fetchFans = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/creators/${handle}/fans?tab=${activeTab}&planFilter=${planFilter}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch fans");
                }

                const data = await response.json();
                setFans(data.fans || []);
            } catch (err) {
                console.error("Error fetching fans:", err);
                setError("ファンデータの取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        if (handle) {
            fetchFans();
        }
    }, [handle, activeTab, planFilter]);

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`/api/creators/${handle}/analytics/fans`);

                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                const data = await response.json();
                setAnalytics(data);
            } catch (err) {
                console.error("Error fetching analytics:", err);
            }
        };

        if (handle) {
            fetchAnalytics();
        }
    }, [handle]);

    // Filter fans based on active tab
    const filteredFans = fans
        .filter(fan => {
            if (activeTab === "plans") {
                // Must have a plan
                if (!fan.plan) return false;

                // Apply plan filter
                if (planFilter !== "全て" && fan.plan.name !== planFilter) {
                    return false;
                }

                return true;
            } else {
                return (fan.purchaseCount ?? 0) > 0;
            }
        })
        .sort((a, b) => {
            if (activeTab === "plans") {
                // Sort by lastUpdated (newest first)
                const dateA = new Date(a.lastUpdated ?? "1970-01-01");
                const dateB = new Date(b.lastUpdated ?? "1970-01-01");
                return dateB.getTime() - dateA.getTime();
            } else {
                // Sort by lastPurchasedDate (newest first)
                const dateA = new Date(a.lastPurchasedDate ?? "1970-01-01");
                const dateB = new Date(b.lastPurchasedDate ?? "1970-01-01");
                return dateB.getTime() - dateA.getTime();
            }
        });

    return (
        <main className="min-h-screen bg-white text-black">
            {/* ページヘッダー */}
            <header className="px-6 py-10 lg:px-12">
                <h1 className="text-3xl font-semibold">ファン管理</h1>
            </header>

            {/* タブ切り替え - 固定 */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 lg:px-12">
                <nav className="-mb-px flex gap-8">
                    <button
                        onClick={() => setActiveTab("plans")}
                        className={`border-b-2 py-4 text-sm font-medium transition-colors ${activeTab === "plans"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        プラン購入者
                    </button>
                    <button
                        onClick={() => setActiveTab("purchases")}
                        className={`border-b-2 py-4 text-sm font-medium transition-colors ${activeTab === "purchases"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                    >
                        単体購入者
                    </button>
                </nav>
            </div>

            <div className="space-y-8 px-6 py-10 lg:px-12">
                {/* 主要なアナリティクス */}
                <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    <h2 className="mb-6 text-lg font-semibold">主要なアナリティクス</h2>
                    <div className="grid gap-6 md:grid-cols-4">
                        {activeTab === "plans" ? (
                            <>
                                {/* 収益 */}
                                <div>
                                    <p className="text-xs text-neutral-500">収益</p>
                                    <p className="text-xs text-neutral-400">過去 30 日間</p>
                                    <p className="mt-2 text-3xl font-bold">¥5,525</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <span>↑</span>
                                        <span>240%</span>
                                    </p>
                                </div>

                                {/* プランメンバー */}
                                <div>
                                    <p className="text-xs text-neutral-500">プランメンバー</p>
                                    <p className="text-xs text-neutral-400">&nbsp;</p>
                                    <p className="mt-2 text-3xl font-bold">29</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <span>↑</span>
                                        <span>263%</span>
                                    </p>
                                </div>

                                {/* 獲得したプランメンバー */}
                                <div>
                                    <p className="text-xs text-neutral-500">獲得したプランメンバー</p>
                                    <p className="text-xs text-neutral-400">過去 30 日間</p>
                                    <p className="mt-2 text-3xl font-bold">23</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <span>↑</span>
                                        <span>999%超</span>
                                    </p>
                                </div>

                                {/* 解約 */}
                                <div>
                                    <p className="text-xs text-neutral-500">解約</p>
                                    <p className="text-xs text-neutral-400">過去 30 日間</p>
                                    <p className="mt-2 text-3xl font-bold">4</p>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* 収益 */}
                                <div>
                                    <p className="text-xs text-neutral-500">収益</p>
                                    <p className="text-xs text-neutral-400">過去 30 日間</p>
                                    <p className="mt-2 text-3xl font-bold">¥3,240</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <span>↑</span>
                                        <span>185%</span>
                                    </p>
                                </div>

                                {/*購入本数 */}
                                <div>
                                    <p className="text-xs text-neutral-500">購入本数</p>
                                    <p className="text-xs text-neutral-400">過去 30 日間</p>
                                    <p className="mt-2 text-3xl font-bold">127</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <span>↑</span>
                                        <span>312%</span>
                                    </p>
                                </div>

                                {/* 購入者数 */}
                                <div>
                                    <p className="text-xs text-neutral-500">購入者数</p>
                                    <p className="text-xs text-neutral-400">過去 30 日間</p>
                                    <p className="mt-2 text-3xl font-bold">89</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <span>↑</span>
                                        <span>267%</span>
                                    </p>
                                </div>

                                {/* 平均購入単価 */}
                                <div>
                                    <p className="text-xs text-neutral-500">平均購入単価</p>
                                    <p className="text-xs text-neutral-400">&nbsp;</p>
                                    <p className="mt-2 text-3xl font-bold">¥1,200</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-red-600">
                                        <span>↓</span>
                                        <span>12%</span>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 購入者数チャート */}
                <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    {/* 凡例 - プランのみ */}
                    {activeTab === "plans" && (
                        <div className="mb-4 flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span className="text-neutral-600">プランA</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                                <span className="text-neutral-600">プランB</span>
                            </div>
                        </div>
                    )}

                    {/* グラフ */}
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-6">
                        <div className="flex gap-4">
                            {/* Y軸ラベル */}
                            <div className="flex flex-col justify-between text-xs text-neutral-500" style={{ height: '220px' }}>
                                {(() => {
                                    const max = activeTab === "plans" ? 30 : 150;
                                    return [4, 3, 2, 1, 0].map(i => {
                                        const value = (max * i) / 4;
                                        return (
                                            <span key={i} className="text-right" style={{ width: '50px' }}>
                                                {Math.round(value)}
                                            </span>
                                        );
                                    });
                                })()}
                            </div>

                            {/* SVGグラフ */}
                            <div className="flex-1">
                                {(() => {
                                    const chartWidth = 600;
                                    const chartHeight = 220;

                                    // サンプルデータ生成
                                    const generateData = (baseValue: number, variance: number) => {
                                        const data: number[] = [];
                                        for (let i = 0; i < 30; i++) {
                                            const trend = i * 0.3;
                                            const random = (Math.random() - 0.5) * variance;
                                            data.push(Math.max(0, baseValue + trend + random));
                                        }
                                        return data;
                                    };

                                    const max = activeTab === "plans" ? 30 : 150;
                                    const pointGap = chartWidth / 29;

                                    // 日付ラベルを生成
                                    const today = new Date();
                                    const labels = [0, 7, 14, 21, 29].map(i => {
                                        const date = new Date(today);
                                        date.setDate(date.getDate() - (29 - i));
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    });

                                    if (activeTab === "plans") {
                                        // プラン購入: 2本のライン（プランA・プランB）
                                        const planAData = generateData(15, 5);
                                        const planBData = generateData(10, 4);

                                        const planASvgPoints = planAData
                                            .map((value, index) =>
                                                `${index * pointGap},${chartHeight - (value / max) * (chartHeight - 20)}`
                                            )
                                            .join(" ");

                                        const planBSvgPoints = planBData
                                            .map((value, index) =>
                                                `${index * pointGap},${chartHeight - (value / max) * (chartHeight - 20)}`
                                            )
                                            .join(" ");

                                        return (
                                            <>
                                                <svg
                                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                                    className="h-56 w-full"
                                                    preserveAspectRatio="none"
                                                >
                                                    {/* グリッドライン */}
                                                    {[0, 1, 2, 3, 4].map((i) => {
                                                        const y = (chartHeight * i) / 4;
                                                        return (
                                                            <line
                                                                key={`grid-${i}`}
                                                                x1="0"
                                                                y1={y}
                                                                x2={chartWidth}
                                                                y2={y}
                                                                stroke="#e5e7eb"
                                                                strokeWidth="1"
                                                                strokeDasharray="4 4"
                                                            />
                                                        );
                                                    })}

                                                    {/* プランAライン */}
                                                    <polyline
                                                        fill="none"
                                                        stroke="#3b82f6"
                                                        strokeWidth="4"
                                                        points={planASvgPoints}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />

                                                    {/* プランBライン */}
                                                    <polyline
                                                        fill="none"
                                                        stroke="#eab308"
                                                        strokeWidth="4"
                                                        points={planBSvgPoints}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />

                                                    {/* プランAのデータポイント */}
                                                    {planAData.map((value, index) => (
                                                        <circle
                                                            key={`a-${index}`}
                                                            cx={index * pointGap}
                                                            cy={chartHeight - (value / max) * (chartHeight - 20)}
                                                            r={5}
                                                            fill="#3b82f6"
                                                        />
                                                    ))}

                                                    {/* プランBのデータポイント */}
                                                    {planBData.map((value, index) => (
                                                        <circle
                                                            key={`b-${index}`}
                                                            cx={index * pointGap}
                                                            cy={chartHeight - (value / max) * (chartHeight - 20)}
                                                            r={5}
                                                            fill="#eab308"
                                                        />
                                                    ))}
                                                </svg>
                                                <div className="mt-4 flex justify-between text-xs text-neutral-500">
                                                    {labels.map((label, index) => (
                                                        <span key={`${label}-${index}`}>{label}</span>
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    } else {
                                        // 単体購入: 購入本数（1本のライン）
                                        const purchaseData = generateData(80, 40);

                                        const purchaseSvgPoints = purchaseData
                                            .map((value, index) =>
                                                `${index * pointGap},${chartHeight - (value / max) * (chartHeight - 20)}`
                                            )
                                            .join(" ");

                                        return (
                                            <>
                                                <svg
                                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                                    className="h-56 w-full text-black"
                                                    preserveAspectRatio="none"
                                                >
                                                    {/* グリッドライン */}
                                                    {[0, 1, 2, 3, 4].map((i) => {
                                                        const y = (chartHeight * i) / 4;
                                                        return (
                                                            <line
                                                                key={`grid-${i}`}
                                                                x1="0"
                                                                y1={y}
                                                                x2={chartWidth}
                                                                y2={y}
                                                                stroke="#e5e7eb"
                                                                strokeWidth="1"
                                                                strokeDasharray="4 4"
                                                            />
                                                        );
                                                    })}

                                                    {/* データライン */}
                                                    <polyline
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        points={purchaseSvgPoints}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />

                                                    {/* データポイント */}
                                                    {purchaseData.map((value, index) => (
                                                        <circle
                                                            key={index}
                                                            cx={index * pointGap}
                                                            cy={chartHeight - (value / max) * (chartHeight - 20)}
                                                            r={5}
                                                            fill="black"
                                                        />
                                                    ))}
                                                </svg>
                                                <div className="mt-4 flex justify-between text-xs text-neutral-500">
                                                    {labels.map((label, index) => (
                                                        <span key={`${label}-${index}`}>{label}</span>
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* 期間選択 */}
                    <div className="mt-4">
                        <select className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="7">過去 7 日間</option>
                            <option value="30" selected>過去 30 日間</option>
                            <option value="90">過去 90 日間</option>
                            <option value="365">過去 1 年間</option>
                        </select>
                    </div>
                </div>

                {/* 検索・フィルター */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/10 px-4 py-3">
                        <span className="text-neutral-400">🔍</span>
                        <input
                            type="text"
                            placeholder="名前またはメールアドレスで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none bg-transparent text-sm focus:outline-none"
                        />
                    </div>

                    {activeTab === "plans" && (
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold focus:outline-none"
                        >
                            <option value="全て">プラン: 全て</option>
                            <option value="プランA">プランA</option>
                            <option value="プランB">プランB</option>
                        </select>
                    )}
                </div>

                {/* ファンリストテーブル */}
                <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-black/10 bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        ユーザー
                                    </th>
                                    {activeTab === "plans" ? (
                                        <>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                プラン
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                合計期間
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                最終更新日
                                            </th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                購入タイトル
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                購入本数
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                                購入日
                                            </th>
                                        </>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                        メニュー
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/10">
                                {filteredFans.map((fan) => (
                                    <tr key={fan.id} className="transition-colors hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={fan.avatar}
                                                    alt={fan.name}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{fan.name}</span>
                                                    {fan.hasTwitter && <span className="text-blue-400">🐦</span>}
                                                </div>
                                            </div>
                                        </td>

                                        {activeTab === "plans" ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${fan.plan?.name === "プランA"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                    >
                                                        {fan.plan?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-600">
                                                    {fan.planDurationMonths}ヶ月
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-600">
                                                    {fan.lastUpdated}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-neutral-900">
                                                        {fan.purchasedTitles && fan.purchasedTitles.length > 0 ? (
                                                            <span>
                                                                {fan.purchasedTitles[0]}
                                                                {fan.purchasedTitles.length > 1 && (
                                                                    <span className="ml-1 text-neutral-500"> +{fan.purchasedTitles.length - 1}</span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-neutral-400">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-600">
                                                    {fan.purchaseCount}本
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-600">
                                                    {fan.lastPurchasedDate}
                                                </td>
                                            </>
                                        )}

                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === fan.id ? null : fan.id)}
                                                    className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                                                >
                                                    ...
                                                </button>
                                                {openMenuId === fan.id && (
                                                    <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-2xl border border-black/10 bg-white shadow-lg">
                                                        <button className="w-full px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-neutral-50">
                                                            詳細
                                                        </button>
                                                        <button className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-neutral-50">
                                                            ブロック
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ペジネーション */}
                    <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
                        <p className="text-sm text-neutral-600">
                            {filteredFans.length > 0 ? `1 / ${filteredFans.length}` : "0 / 0"}
                        </p>
                        <div className="flex gap-2">
                            <button className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-black/40">
                                前へ
                            </button>
                            <button className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-black/40">
                                次へ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
