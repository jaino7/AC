"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Activity {
    id: string;
    type: string;
    amount: number;
    timeAgo: string;
    createdAt: string;
}

interface EarningsData {
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
    nextPaymentDate: string;
    recentActivities: Activity[];
}

interface DashboardClientProps {
    creatorId: string;
}

export default function DashboardClient({ creatorId }: DashboardClientProps) {
    const params = useParams();
    const handle = params.handle as string;

    const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEarnings();
    }, [creatorId]);

    const fetchEarnings = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/creators/earnings/current-month");

            if (response.ok) {
                const data = await response.json();
                setEarningsData(data);
            } else {
                setError("収益データの取得に失敗しました");
            }
        } catch (error) {
            console.error("Failed to fetch earnings:", error);
            setError("収益データの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-12">
                <div className="mx-auto w-full max-w-7xl">
                    <h1 className="mb-8 text-3xl font-semibold text-black">ダッシュボード</h1>
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
                            <p className="text-sm text-neutral-500">読み込み中...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !earningsData) {
        return (
            <div className="min-h-screen bg-slate-50 px-6 py-12">
                <div className="mx-auto w-full max-w-7xl">
                    <h1 className="mb-8 text-3xl font-semibold text-black">ダッシュボード</h1>
                    <div className="flex items-center justify-center py-20">
                        <p className="text-neutral-600">{error || "データが見つかりません"}</p>
                    </div>
                </div>
            </div>
        );
    }

    const { currentMonth, lastMonth, recentActivities } = earningsData;

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <div className="mx-auto w-full max-w-7xl">
                {/* ページタイトル */}
                <h1 className="mb-8 text-3xl font-semibold text-black">ダッシュボード</h1>

                {/* 2対1グリッドレイアウト */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* 左側：売上カード（2カラム分） */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            {/* ラベル */}
                            <div className="mb-6">
                                <p className="text-base font-medium text-neutral-600">
                                    今月の売上（推定）
                                </p>
                                <p className="mt-1 text-sm text-neutral-400">
                                    {currentMonth.year}年{currentMonth.month}月
                                </p>
                            </div>

                            {/* 金額 - 力強く表示 */}
                            <div className="mb-8">
                                <p className="text-5xl font-bold tracking-tight text-black">
                                    ¥{currentMonth.earnings.toLocaleString()}
                                </p>
                            </div>

                            {/* 次回支払い予定 */}
                            <div className="mb-6 rounded-xl bg-slate-50 px-5 py-4">
                                <p className="text-sm text-neutral-500">
                                    次回お支払い予定
                                </p>
                                <p className="mt-2 text-xl font-semibold text-neutral-700">
                                    先月分の収益（¥{lastMonth.earnings.toLocaleString()}）
                                </p>
                                <p className="mt-1 text-xs text-neutral-400">
                                    {lastMonth.year}年{lastMonth.month}月分 • 月末に支払い
                                </p>
                            </div>

                            {/* アナリティクスリンク */}
                            <div>
                                <Link
                                    href={`/creators/${handle}/analytics`}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-black"
                                >
                                    <span>詳細を見る</span>
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 右側：直近のアクティビティ（1カラム分） */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-base font-semibold text-black">
                                直近のアクティビティ
                            </h2>

                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-700">
                                                    {activity.type}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    {activity.timeAgo}
                                                </p>
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-sm font-semibold text-black">
                                                    ¥{activity.amount.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {recentActivities.length === 0 && (
                                <p className="py-8 text-center text-sm text-neutral-400">
                                    アクティビティはありません
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
