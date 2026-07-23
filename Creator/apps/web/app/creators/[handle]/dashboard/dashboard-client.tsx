"use client";

import { useEffect, useState } from "react";
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

const demoEarnings: EarningsData = {
  currentMonth: {
    year: 2026,
    month: 5,
    earnings: 842600,
  },
  lastMonth: {
    year: 2026,
    month: 4,
    earnings: 736400,
  },
  nextPaymentDate: "2026-06-30",
  recentActivities: [
    { id: "a1", type: "Goldプラン加入", amount: 2980, timeAgo: "2分前", createdAt: "2026-05-08T05:00:00.000Z" },
    { id: "a2", type: "単品コンテンツ購入", amount: 1200, timeAgo: "18分前", createdAt: "2026-05-08T04:44:00.000Z" },
    { id: "a3", type: "クレジットチャージ", amount: 5000, timeAgo: "42分前", createdAt: "2026-05-08T04:20:00.000Z" },
    { id: "a4", type: "Silverプラン更新", amount: 1480, timeAgo: "1時間前", createdAt: "2026-05-08T04:00:00.000Z" },
  ],
};

export default function DashboardClient({ creatorId }: DashboardClientProps) {
  const params = useParams();
  const handle = params.handle as string;
  const isDemo = creatorId === "demo";

  const [earningsData, setEarningsData] = useState<EarningsData | null>(isDemo ? demoEarnings : null);
  const [isLoading, setIsLoading] = useState(!isDemo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) return;
    fetchEarnings();
  }, [creatorId, isDemo]);

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
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="mb-6 text-2xl font-semibold text-black sm:mb-8 sm:text-3xl">ダッシュボード</h1>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent" />
              <p className="text-sm text-neutral-500">読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !earningsData) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="mb-6 text-2xl font-semibold text-black sm:mb-8 sm:text-3xl">ダッシュボード</h1>
          <div className="flex items-center justify-center py-20">
            <p className="text-neutral-600">{error || "データが見つかりません"}</p>
          </div>
        </div>
      </div>
    );
  }

  const { currentMonth, lastMonth, recentActivities } = earningsData;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-7xl">
        <h1 className="mb-6 text-2xl font-semibold text-black sm:mb-8 sm:text-3xl">ダッシュボード</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-base font-medium text-neutral-600">今月の売上（推定）</p>
                <p className="mt-1 text-sm text-neutral-400">
                  {currentMonth.year}年{currentMonth.month}月
                </p>
              </div>

              <div className="mb-8">
                <p className="break-words text-4xl font-bold tracking-tight text-black sm:text-5xl">
                  ¥{currentMonth.earnings.toLocaleString()}
                </p>
              </div>

              <div className="mb-6 rounded-xl bg-slate-50 px-5 py-4">
                <p className="text-sm text-neutral-500">次回のお支払い予定</p>
                <p className="mt-2 break-words text-lg font-semibold text-neutral-700 sm:text-xl">
                  先月分の収益: ¥{lastMonth.earnings.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {lastMonth.year}年{lastMonth.month}月分 ・ 月末にお支払い
                </p>
              </div>

              <div>
                <Link
                  href={`/creators/${handle}/analytics`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-black"
                >
                  <span>詳細を見る</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-black">直近のアクティビティ</h2>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-700">{activity.type}</p>
                        <p className="mt-1 text-xs text-neutral-400">{activity.timeAgo}</p>
                      </div>
                      <div className="shrink-0">
                        <p className="text-sm font-semibold text-black">¥{activity.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {recentActivities.length === 0 && (
                <p className="py-8 text-center text-sm text-neutral-400">アクティビティはありません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
