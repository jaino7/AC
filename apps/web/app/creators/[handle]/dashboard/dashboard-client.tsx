"use client";

import { useState, useMemo, useEffect } from "react";

// 円グラフコンポーネント
const PieChart = ({ data }: { data: Array<{ planName: string; percentage: number }> }) => {
    const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
    let currentAngle = -90; // 12時方向から開始

    return (
        <svg viewBox="0 0 200 200" className="w-full h-48">
            {data.map((item, index) => {
                const angle = (item.percentage / 100) * 360;
                const endAngle = currentAngle + angle;

                const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

                const largeArc = angle > 180 ? 1 : 0;

                const path = angle === 360
                    ? `M 100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0`
                    : `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

                currentAngle = endAngle;

                return (
                    <path
                        key={index}
                        d={path}
                        fill={colors[index % colors.length]}
                    />
                );
            })}
        </svg>
    );
};

interface DashboardData {
    todayRevenue: number;
    thisMonthRevenue: number;
    revenueGrowth: number;
    activeSubscribers: number;
    totalRevenue: number;
    revenueChart: Array<{ date: string; amount: number; count: number }>;
    subscriberChart: Array<{ date: string; count: number; new: number }>;

    // 新規追加: ファンメトリクス
    totalFans: number;
    fansGrowth: number;
    fansChart: Array<{ date: string; count: number }>;
    newFans: {
        last7Days: number;
        last28Days: number;
        last90Days: number;
        last365Days: number;
    };
    churnedFans: {
        last7Days: number;
        last28Days: number;
        last90Days: number;
        last365Days: number;
    };
    planDistribution: Array<{
        planName: string;
        count: number;
        percentage: number;
    }>;

    recentTransactions: Array<{
        id: string;
        date: string;
        type: string;
        user: string;
        amount: number;
        planName: string;
    }>;
}

const periodDays: Record<string, number> = {
    "過去 7 日間": 7,
    "過去 28 日間": 28,
    "過去 90 日間": 90,
    "過去 365 日間": 365,
};

type ChartType = "revenue" | "fans";

interface DashboardClientProps {
    creatorId: string;
}

export default function DashboardClient({ creatorId }: DashboardClientProps) {
    const [selectedPeriod, setSelectedPeriod] = useState("過去 28 日間");
    const [chartType, setChartType] = useState<ChartType>("revenue");
    const [newFansPeriod, setNewFansPeriod] = useState("過去 28 日間");
    const [churnedFansPeriod, setChurnedFansPeriod] = useState("過去 28 日間");
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, [selectedPeriod, creatorId]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const period = periodDays[selectedPeriod] || 28;

            console.log(`Fetching dashboard data for creator: ${creatorId}, period: ${period}`);

            const response = await fetch(
                `${apiUrl}/creators/analytics/dashboard?creatorId=${creatorId}&period=${period}`
            );

            if (response.ok) {
                const data = await response.json();
                console.log("Dashboard data received:", data);
                setDashboardData(data);
            } else {
                const errorText = await response.text();
                console.error("API error:", response.status, errorText);
                setError(`APIエラー: ${response.status}`);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setError("データの取得に失敗しました。APIサーバーが起動しているか確認してください。");
        } finally {
            setIsLoading(false);
        }
    };

    // チャート用のデータ整形
    const chartData = useMemo(() => {
        if (!dashboardData) return { points: [], max: 0, labels: [], yAxisLabels: [] };

        const data = chartType === "revenue"
            ? dashboardData.revenueChart
            : dashboardData.fansChart || [];

        // データがない場合は0のラインを表示
        if (data.length === 0) {
            const labels = ["開始", "終了"];
            const yAxisLabels = ["0", "0", "0", "0", "0"];
            return { points: [0, 0], max: 1, labels, yAxisLabels };
        }

        // データポイントを取得
        const values = chartType === "revenue"
            ? (data as typeof dashboardData.revenueChart).map(d => d.amount)
            : (data as typeof dashboardData.fansChart).map(d => d.count);

        // 最大値を計算（最小でも1にする）
        const max = Math.max(...values, 1);

        // 日付ラベルを生成（5ポイント）
        const labels: string[] = [];
        const labelIndices = [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1];

        labelIndices.forEach(i => {
            if (i < data.length && i >= 0) {
                const date = new Date(data[i].date);
                labels.push(date.toLocaleDateString("ja-JP", {
                    month: "2-digit",
                    day: "2-digit",
                }));
            }
        });

        // Y軸ラベルを生成（5段階）
        const yAxisLabels: string[] = [];
        for (let i = 0; i < 5; i++) {
            const value = (max * i) / 4;
            if (chartType === "revenue") {
                // 収益の場合は千円単位で表示
                if (value >= 1000000) {
                    yAxisLabels.push(`¥${Math.round(value / 1000000)}M`);
                } else if (value >= 1000) {
                    yAxisLabels.push(`¥${Math.round(value / 1000)}k`);
                } else {
                    yAxisLabels.push(`¥${Math.round(value)}`);
                }
            } else {
                // ファン数の場合は人数で表示
                yAxisLabels.push(Math.round(value).toString());
            }
        }

        return { points: values, max, labels, yAxisLabels: yAxisLabels.reverse() };
    }, [dashboardData, chartType]);

    // SVGチャートの描画
    const chartWidth = 600;
    const chartHeight = 220;
    const { points, max, labels, yAxisLabels } = chartData;

    const pointGap = points.length > 1 ? chartWidth / (points.length - 1) : 0;
    const svgPoints = points
        .map((value, index) => `${index * pointGap},${chartHeight - (value / max) * (chartHeight - 20)}`)
        .join(" ");

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <p className="text-gray-500">読み込み中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        再試行
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <p className="text-gray-500">データを取得できませんでした</p>
            </div>
        );
    }

    const currentValue = chartType === "revenue"
        ? `¥${dashboardData.thisMonthRevenue.toLocaleString()}`
        : (dashboardData.totalFans || 0).toString();

    const chartLabel = chartType === "revenue" ? "収益の推移" : "総ファン数の推移";

    return (
        <div className="space-y-6">
            {/* ページヘッダー */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">ダッシュボード</h1>
                <p className="mt-1 text-sm text-neutral-500">クリエイターアカウントの概要</p>
            </div>

            {/* 収益レポート */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap justify-between gap-4">
                    <div>
                        <p className="text-sm text-neutral-500">収益レポート</p>
                        <h2 className="text-2xl font-semibold">{chartLabel}</h2>
                    </div>
                    <div className="text-right">
                        <div className="mb-2 flex gap-2">
                            <button
                                onClick={() => setChartType("revenue")}
                                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${chartType === "revenue"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                収益
                            </button>
                            <button
                                onClick={() => setChartType("fans")}
                                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${chartType === "fans"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                総ファン数
                            </button>
                        </div>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="mb-2 block w-full rounded-md border-neutral-300 py-1 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        >
                            {Object.keys(periodDays).map((period) => (
                                <option key={period} value={period}>
                                    {period}
                                </option>
                            ))}
                        </select>
                        <p className="text-3xl font-semibold">{currentValue}</p>
                        {chartType === "revenue" ? (
                            <p className={`text-sm ${dashboardData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {dashboardData.revenueGrowth >= 0 ? '+' : ''}{dashboardData.revenueGrowth}%
                            </p>
                        ) : (
                            <p className={`text-sm ${(dashboardData.fansGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(dashboardData.fansGrowth || 0) >= 0 ? '+' : ''}{(dashboardData.fansGrowth || 0).toFixed(1)}%
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-6">
                        <div className="flex gap-4">
                            {/* Y軸ラベル */}
                            <div className="flex flex-col justify-between text-xs text-neutral-500" style={{ height: `${chartHeight}px` }}>
                                {yAxisLabels.map((label, index) => (
                                    <span key={index} className="text-right" style={{ width: '50px' }}>
                                        {label}
                                    </span>
                                ))}
                            </div>

                            {/* グラフ */}
                            <div className="flex-1">
                                <svg
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    className="h-56 w-full text-black"
                                    preserveAspectRatio="none"
                                >
                                    {/* 横線（グリッドライン） */}
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
                                    {points.length > 0 && (
                                        <>
                                            <polyline
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                points={svgPoints}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />

                                            {/* データポイント */}
                                            {points.map((value, index) => (
                                                <circle
                                                    key={index}
                                                    cx={index * pointGap}
                                                    cy={chartHeight - (value / max) * (chartHeight - 20)}
                                                    r={5}
                                                    fill="black"
                                                />
                                            ))}
                                        </>
                                    )}
                                </svg>
                                <div className="mt-4 flex justify-between text-xs text-neutral-500">
                                    {labels.map((label, index) => (
                                        <span key={`${label}-${index}`}>{label}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ファンメトリクス: 新規・解約・プラン別 */}
            <section className="grid gap-6 md:grid-cols-3">
                {/* 新規ファン数 */}
                <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-neutral-500">新規ファン数</p>
                        <select
                            value={newFansPeriod}
                            onChange={(e) => setNewFansPeriod(e.target.value)}
                            className="rounded-md border-neutral-300 py-1 px-2 text-xs focus:border-indigo-500 focus:outline-none"
                        >
                            {Object.keys(periodDays).map((period) => (
                                <option key={period} value={period}>{period}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-3xl font-semibold">
                        {dashboardData.newFans?.[`last${periodDays[newFansPeriod]}Days` as keyof typeof dashboardData.newFans] || 0}人
                    </p>
                </article>

                {/* 解約ファン数 */}
                <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-neutral-500">解約ファン数</p>
                        <select
                            value={churnedFansPeriod}
                            onChange={(e) => setChurnedFansPeriod(e.target.value)}
                            className="rounded-md border-neutral-300 py-1 px-2 text-xs focus:border-indigo-500 focus:outline-none"
                        >
                            {Object.keys(periodDays).map((period) => (
                                <option key={period} value={period}>{period}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-3xl font-semibold">
                        {dashboardData.churnedFans?.[`last${periodDays[churnedFansPeriod]}Days` as keyof typeof dashboardData.churnedFans] || 0}人
                    </p>
                </article>

                {/* プラン別ファン数（円グラフ） */}
                <article className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-sm text-neutral-500 mb-4">プラン別ファン数</p>
                    {dashboardData.planDistribution && dashboardData.planDistribution.length > 0 ? (
                        <>
                            <PieChart data={dashboardData.planDistribution} />
                            <div className="mt-4 space-y-2">
                                {dashboardData.planDistribution.map((plan, index) => {
                                    const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
                                    return (
                                        <div key={plan.planName} className="flex justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                                <span>{plan.planName}</span>
                                            </div>
                                            <span className="font-semibold">{plan.count}人</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400">
                            データなし
                        </div>
                    )}
                </article>
            </section>

            {/* 取引履歴 */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">取引履歴</h3>
                <div className="mt-4 overflow-x-auto">
                    {dashboardData.recentTransactions.length > 0 ? (
                        <table className="min-w-full text-sm">
                            <thead className="text-left text-neutral-500">
                                <tr>
                                    <th className="py-3">日付</th>
                                    <th>取引タイプ</th>
                                    <th>プラン</th>
                                    <th>ユーザー</th>
                                    <th>金額</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {dashboardData.recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="text-black">
                                        <td className="py-4">{tx.date}</td>
                                        <td>{tx.type}</td>
                                        <td>{tx.planName || "-"}</td>
                                        <td className="truncate max-w-[150px]">{tx.user}</td>
                                        <td>¥{tx.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-8 text-center text-gray-500">
                            まだ取引がありません
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
