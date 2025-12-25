const trendPoints = [
  { month: "1月", revenue: 50, newSubs: 30, churn: 10 },
  { month: "2月", revenue: 65, newSubs: 45, churn: 15 },
  { month: "3月", revenue: 55, newSubs: 40, churn: 12 },
  { month: "4月", revenue: 70, newSubs: 50, churn: 20 },
  { month: "5月", revenue: 60, newSubs: 35, churn: 18 },
  { month: "6月", revenue: 75, newSubs: 55, churn: 17 }
];

const stackedData = [
  { month: "1月", bronze: 20, silver: 30, gold: 15 },
  { month: "2月", bronze: 25, silver: 35, gold: 20 },
  { month: "3月", bronze: 22, silver: 32, gold: 18 },
  { month: "4月", bronze: 28, silver: 38, gold: 22 },
  { month: "5月", bronze: 26, silver: 34, gold: 21 },
  { month: "6月", bronze: 30, silver: 40, gold: 25 }
];

const MetricCard = ({
  label,
  value,
  change
}: {
  label: string;
  value: string;
  change: string;
}) => (
  <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 shadow-[0_15px_40px_rgba(0,0,0,0.05)]">
    <p className="text-sm text-neutral-500">{label}</p>
    <p className="text-2xl font-semibold">{value}</p>
    <p className="text-xs text-green-600">{change}</p>
  </div>
);

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid gap-0 lg:grid-cols-[240px,1fr]">
        <aside className="min-h-screen border-r border-black/10 bg-black/5 px-6 py-10">
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-black text-white">C</div>
            <div>
              <p className="text-sm font-semibold">Creator Name</p>
              <p className="text-xs text-neutral-500">creator@email.com</p>
            </div>
          </div>

          <nav className="mt-10 space-y-2 text-sm font-semibold">
            <button className="w-full rounded-2xl bg-black px-4 py-3 text-left text-white">
              ダッシュボード
            </button>
            <button className="w-full rounded-2xl px-4 py-3 text-left text-neutral-500">
              購読者
            </button>
            <button className="w-full rounded-2xl px-4 py-3 text-left text-neutral-500">
              コンテンツ
            </button>
            <button className="w-full rounded-2xl px-4 py-3 text-left text-neutral-500">
              支払い
            </button>
            <button className="w-full rounded-2xl px-4 py-3 text-left text-neutral-500">
              設定
            </button>
          </nav>

          <div className="mt-10 space-y-3 text-sm font-semibold text-neutral-500">
            <button>❓ ヘルプ</button>
            <button>⎋ ログアウト</button>
          </div>
        </aside>

        <section className="px-8 py-10 space-y-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">主要なパフォーマンス指標を確認します</p>
              <h1 className="text-3xl font-semibold">アナリティクスレポート</h1>
            </div>
            <div className="flex gap-2 text-sm font-semibold">
              {["日", "週", "月", "任意期間"].map((label, index) => (
                <button
                  key={label}
                  className={`rounded-full px-4 py-2 ${
                    label === "月" ? "bg-black text-white" : "border border-black/10 text-neutral-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="総収益" value="¥850,000" change="過去30日間 +12.5%" />
            <MetricCard label="新規購読者" value="320人" change="+8.2%" />
            <MetricCard label="解約率" value="2.1%" change="-0.4pt" />
            <MetricCard label="平均LTV" value="¥18,400" change="+2.3%" />
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">全体のパフォーマンストレンド</p>
                <h2 className="text-2xl font-semibold">¥850,000</h2>
                <p className="text-xs text-green-600">過去30日間 +12.5%</p>
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                <button className="rounded-2xl border border-black/10 px-4 py-2">PNGでダウンロード</button>
                <button className="rounded-2xl border border-black/10 px-4 py-2">CSVでダウンロード</button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <div className="flex gap-4 text-xs font-semibold text-neutral-500">
                <span className="text-purple-600">— 売上</span>
                <span className="text-blue-600">— 新規購読</span>
                <span className="text-orange-500">— 解約</span>
              </div>
              <svg viewBox="0 0 600 220" className="h-56 w-full text-purple-600">
                <polyline
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,140 100,60 200,120 300,80 400,160 500,100 600,120"
                />
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,100 100,120 200,80 300,140 400,90 500,150 600,110"
                />
                <polyline
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,160 100,140 200,150 300,120 400,170 500,140 600,150"
                />
              </svg>
              <div className="flex justify-between text-xs text-neutral-400">
                {trendPoints.map((point) => (
                  <span key={point.month}>{point.month}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">プラン別パフォーマンス</h3>
              <div className="flex gap-3 text-xs font-semibold">
                <button className="rounded-2xl border border-black/10 px-4 py-2">PNGでダウンロード</button>
                <button className="rounded-2xl border border-black/10 px-4 py-2">CSVでダウンロード</button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs text-neutral-500 sm:grid-cols-6">
              {stackedData.map((data) => (
                <div key={data.month} className="space-y-3">
                  <div className="mx-auto flex h-40 w-12 flex-col overflow-hidden rounded-2xl border border-black/10">
                    <div
                      className="bg-purple-600"
                      style={{ height: `${data.gold}%` }}
                      title="ゴールド"
                    />
                    <div
                      className="bg-blue-500"
                      style={{ height: `${data.silver}%` }}
                      title="シルバー"
                    />
                    <div className="bg-cyan-400" style={{ height: `${data.bronze}%` }} title="ブロンズ" />
                  </div>
                  <p>{data.month}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-black/10 px-8 py-6 text-xs text-neutral-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>© 2025 Creator Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#">利用規約</a>
            <a href="#">プライバシーポリシー</a>
            <a href="#">法務表示</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
