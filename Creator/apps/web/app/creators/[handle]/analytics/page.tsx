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

    hasTwitter: boolean;
    totalSupport: number;
    status: "active" | "inactive";
};

type AnalyticsData = {
    plans?: {
        revenue30d: number;
        planMembers: number;
        acquiredMembers30d: number;
        cancellations30d: number;
        revenueChange?: number;
    };
    charts?: Record<string, Array<{ date: string; count: number }>>;
    revenueChart?: Array<{ date: string; amount: number }>;
    planNames?: Record<string, string>;
};

export default function FanManagementPage() {
    const params = useParams();
    const handle = params.handle as string;

    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState("全て");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState(30); // 30, 90, 180, 365
    const [chartMode, setChartMode] = useState<"count" | "revenue">("count"); // グラフ切替

    const [fans, setFans] = useState<Fan[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [planNames, setPlanNames] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch fans data
    useEffect(() => {
        const fetchFans = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `/api/creators/${handle}/fans?tab=plans&planFilter=${planFilter}`
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
    }, [handle, planFilter]);

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch(`/api/creators/analytics?days=${selectedPeriod}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                const data = await response.json();
                setAnalytics(data);
                if (data.planNames) {
                    setPlanNames(data.planNames);
                }
            } catch (err) {
                console.error("Error fetching analytics:", err);
            }
        };

        fetchAnalytics();
    }, [selectedPeriod]);

    // Filter fans based on active tab
    const filteredFans = fans
        .filter(fan => {
            if (fan.plan) {
                // Must have a plan
                if (!fan.plan) return false;

                // Apply plan filter
                if (planFilter !== "全て" && fan.plan.name !== planFilter) {
                    return false;
                }

                return true;
            }
            return false;
        })
        .sort((a, b) => {
            const dateA = new Date(a.lastUpdated ?? "1970-01-01");
            const dateB = new Date(b.lastUpdated ?? "1970-01-01");
            return dateB.getTime() - dateA.getTime();
        });

    // Compute dynamic chart max from real data
    const chartMax = (() => {
        if (!analytics?.charts) return 10;
        // 収益モードの場合はrevenueChartを使う
        if (chartMode === "revenue" && analytics?.revenueChart) {
            const values = analytics.revenueChart.map((d) => d.amount);
            const m = values.length > 0 ? Math.max(...values) : 0;
            if (m === 0) return 1000;
            return Math.ceil(m / 500) * 500;
        }
        const allValues = Object.values(analytics.charts).flat().map((d) => d.count);
        const m = allValues.length > 0 ? Math.max(...allValues) : 0;
        return Math.max(10, Math.ceil(m / 5) * 5);
    })();

    return (
        <main className="min-h-screen bg-white text-black">
            {/* ページヘッダー */}
            <header className="px-4 py-8 md:px-6 lg:px-12 lg:py-10">
                <h1 className="text-3xl font-semibold">アナリティクス</h1>
            </header>

            <div className="space-y-6 md:space-y-8 px-4 py-6 md:px-6 lg:px-12 lg:py-10">
                {/* 主要なアナリティクス */}
                <div className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    <h2 className="mb-4 md:mb-6 text-lg font-semibold">主要なアナリティクス</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                <div>
                                    <p className="text-xs text-neutral-500">収益</p>
                                    <p className="text-xs text-neutral-400">過去 {selectedPeriod} 日間</p>
                                    <p className="mt-2 text-3xl font-bold">
                                        ¥{analytics?.plans?.revenue30d?.toLocaleString() || 0}
                                    </p>
                                    {analytics?.plans?.revenueChange !== undefined && (
                                        <p className={`mt-1 flex items-center gap-1 text-sm font-semibold ${analytics.plans.revenueChange >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>
                                            <span>{analytics.plans.revenueChange >= 0 ? "↑" : "↓"}</span>
                                            <span>
                                                {analytics.plans.revenueChange >= 999
                                                    ? "999%超"
                                                    : `${Math.abs(analytics.plans.revenueChange)}%`}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* プランメンバー */}
                                <div>
                                    <p className="text-xs text-neutral-500">プランメンバー</p>
                                    <p className="text-xs text-neutral-400">&nbsp;</p>
                                    <p className="mt-2 text-3xl font-bold">
                                        {analytics?.plans?.planMembers || 0}
                                    </p>
                                </div>

                                {/* 新規獲得 */}
                                <div>
                                    <p className="text-xs text-neutral-500">新規獲得</p>
                                    <p className="text-xs text-neutral-400">過去 {selectedPeriod} 日間</p>
                                    <p className="mt-2 text-3xl font-bold">
                                        {analytics?.plans?.acquiredMembers30d || 0}
                                    </p>
                                </div>

                                {/* 解約 */}
                                <div>
                                    <p className="text-xs text-neutral-500">解約</p>
                                    <p className="text-xs text-neutral-400">過去 {selectedPeriod} 日間</p>
                                    <p className="mt-2 text-3xl font-bold">
                                        {analytics?.plans?.cancellations30d || 0}
                                    </p>
                                </div>
                    </div>
                </div>

                {/* チャート */}
                <div className="rounded-2xl md:rounded-3xl border border-black/10 bg-white p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    {/* グラフモード切替 + 凡例 */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div>
                            {Object.keys(planNames).length > 0 && chartMode === "count" && (
                                <div className="flex gap-4 text-sm">
                                    {Object.entries(planNames).map(([planId, name], idx) => {
                                        const LEGEND_COLORS = ["bg-blue-500", "bg-yellow-500", "bg-red-500", "bg-green-500", "bg-purple-500"];
                                        return (
                                            <div key={planId} className="flex items-center gap-2">
                                                <div className={`h-3 w-3 rounded-full ${LEGEND_COLORS[idx % LEGEND_COLORS.length]}`}></div>
                                                <span className="text-neutral-600">{name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {(
                            <div className="flex rounded-xl border border-neutral-200 overflow-hidden">
                                <button
                                    onClick={() => setChartMode("revenue")}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${chartMode === "revenue"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                                        }`}
                                >
                                    収益
                                </button>
                                <button
                                    onClick={() => setChartMode("count")}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${chartMode === "count"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                                        }`}
                                >
                                    購入者数
                                </button>
                            </div>
                        )}
                    </div>

                    {/* グラフ */}
                    <div className="relative overflow-hidden rounded-xl md:rounded-2xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white px-2 py-4 md:p-6">
                        <div className="flex gap-2 md:gap-4">
                            {/* Y軸ラベル */}
                            <div className="flex flex-col justify-between text-xs text-neutral-500" style={{ height: '220px' }}>
                                {(() => {
                                    const max = chartMax;
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

                                    const max = chartMax;
                                    const pointGap = chartWidth / Math.max(selectedPeriod - 1, 1);

                                    // 日付ラベルを生成（期間に応じて調整）
                                    const today = new Date();
                                    const labelCount = 5;
                                    const labelInterval = Math.floor((selectedPeriod - 1) / (labelCount - 1));
                                    const labels = Array.from({ length: labelCount }, (_, i) => {
                                        const index = i === labelCount - 1 ? selectedPeriod - 1 : i * labelInterval;
                                        const date = new Date(today);
                                        date.setDate(date.getDate() - (selectedPeriod - 1 - index));
                                        return `${date.getMonth() + 1}/${date.getDate()}`;
                                    });

                                    const PLAN_STROKE_COLORS = ["#3b82f6", "#eab308", "#ef4444", "#22c55e", "#a855f7"];

                                    if (chartMode === "revenue" && analytics?.revenueChart) {
                                        // 収益モード: 日別金額のライングラフ
                                        const revenueData = analytics.revenueChart.map((d) => d.amount);

                                        const revenueSvgPoints = revenueData
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

                                                    {revenueSvgPoints && (
                                                        <polyline
                                                            fill="none"
                                                            stroke="#3b82f6"
                                                            strokeWidth="4"
                                                            points={revenueSvgPoints}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    )}

                                                    {revenueData.map((value, index) => (
                                                        <circle
                                                            key={index}
                                                            cx={index * pointGap}
                                                            cy={chartHeight - (value / max) * (chartHeight - 20)}
                                                            r={5}
                                                            fill="#3b82f6"
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
                                        // プラン購入: プランごとに1本のライン
                                        const planIds = Object.keys(analytics?.charts || {});
                                        const planDataArrays = planIds.map((planId) => {
                                            const entries = analytics?.charts?.[planId] || [];
                                            return entries.map((d: { date: string; count: number }) => d.count);
                                        });

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

                                                    {planDataArrays.map((data, planIdx) => {
                                                        const color = PLAN_STROKE_COLORS[planIdx % PLAN_STROKE_COLORS.length];
                                                        const svgPoints = data
                                                            .map((value, index) =>
                                                                `${index * pointGap},${chartHeight - (value / max) * (chartHeight - 20)}`
                                                            )
                                                            .join(" ");
                                                        if (!svgPoints) return null;
                                                        return (
                                                            <g key={planIds[planIdx]}>
                                                                <polyline
                                                                    fill="none"
                                                                    stroke={color}
                                                                    strokeWidth="4"
                                                                    points={svgPoints}
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                                {data.map((value, index) => (
                                                                    <circle
                                                                        key={index}
                                                                        cx={index * pointGap}
                                                                        cy={chartHeight - (value / max) * (chartHeight - 20)}
                                                                        r={5}
                                                                        fill={color}
                                                                    />
                                                                ))}
                                                            </g>
                                                        );
                                                    })}
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
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(parseInt(e.target.value, 10))}
                            className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7">過去 7 日間</option>
                            <option value="30">過去 30 日間</option>
                            <option value="90">過去 90 日間</option>
                            <option value="180">過去 180 日間</option>
                            <option value="365">過去 1 年間</option>
                        </select>
                    </div>
                </div>

                {/* 検索・フィルター */}
                {(
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

                        {(
                            <select
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                                className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold focus:outline-none"
                            >
                                <option value="全て">プラン: 全て</option>
                                {Object.values(planNames).map((name) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* ファンリストテーブル */}
                {(
                    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-black/10 bg-neutral-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            ユーザー
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            プラン
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            合計期間
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                            最終更新日
                                        </th>
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
                )}
            </div>
        </main>
    );
}
