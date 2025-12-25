const tabs = ["購読者", "失敗決済", "解約"];

const failedPayments = [
  {
    fan: "Taro Yamada",
    id: "#102345",
    date: "2023/10/26 14:30",
    plan: "プレミアムプラン",
    amount: "¥5,000",
    reason: "3DS認証失敗",
    status: "失敗"
  },
  {
    fan: "Hanako Sato",
    id: "#102346",
    date: "2023/10/26 12:15",
    plan: "ベーシックプラン",
    amount: "¥1,500",
    reason: "限度額超過",
    status: "失敗"
  },
  {
    fan: "Ichiro Suzuki",
    id: "#102347",
    date: "2023/10/25 21:00",
    plan: "プレミアムプラン",
    amount: "¥5,000",
    reason: "カード期限切れ",
    status: "失敗"
  }
];

const ReasonBadge = ({ text }: { text: string }) => (
  <span className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-semibold text-black">
    {text}
  </span>
);

export default function PaymentsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black lg:px-16">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <p className="text-sm text-neutral-500">購読者の決済状況とサブスクを管理します</p>
          <h1 className="text-3xl font-semibold">決済・サブスクリプション管理</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm font-semibold text-neutral-500">
          <a href="#" className="text-black">
            Dashboard
          </a>
          <a href="#">Content</a>
          <a href="#" className="text-purple-600">
            Payments
          </a>
          <a href="#">Settings</a>
          <div className="flex items-center gap-3 rounded-full border border-black/10 px-4 py-2">
            <span>🔔</span>
            <span>❔</span>
            <div className="h-8 w-8 rounded-full bg-black text-white grid place-items-center">
              C
            </div>
          </div>
        </nav>
      </header>

      <section className="mt-6 space-y-6">
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`rounded-2xl px-4 py-2 ${
                index === 1 ? "border border-black bg-black text-white" : "text-neutral-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_25px_60px_rgba(0,0,0,0.05)]">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">失敗した決済</h2>
            <p className="text-sm text-neutral-500">決済エラーに対処し、サブスク継続を支援します。</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-black/10 px-4 py-3">
              <span>🔍</span>
              <input
                type="text"
                placeholder="ファン名/IDで検索..."
                className="flex-1 border-none bg-transparent text-sm focus:outline-none"
              />
            </div>
            <button className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold">
              日付範囲
            </button>
            <button className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold">
              失敗原因
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-neutral-500">
                <tr>
                  <th className="py-3">ファン名/ID</th>
                  <th>決済日時</th>
                  <th>プラン</th>
                  <th>金額</th>
                  <th>失敗原因</th>
                  <th>状況</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {failedPayments.map((payment) => (
                  <tr key={payment.id} className="text-black">
                    <td className="py-4">
                      <p className="font-semibold">{payment.fan}</p>
                      <p className="text-xs text-neutral-500">{payment.id}</p>
                    </td>
                    <td>{payment.date}</td>
                    <td>{payment.plan}</td>
                    <td>{payment.amount}</td>
                    <td>
                      <ReasonBadge text={payment.reason} />
                    </td>
                    <td className="font-semibold text-red-600">{payment.status}</td>
                    <td className="space-x-2 text-xs">
                      <button className="rounded-full border border-black/10 px-3 py-1">詳細</button>
                      <button className="rounded-full border border-black bg-black px-3 py-1 text-white">
                        再試行
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-neutral-500">
            <p>10件中 1-3 件を表示</p>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-black/10 px-3 py-1">前へ</button>
              <button className="rounded-full border border-black bg-black px-3 py-1 text-white">
                1
              </button>
              <button className="rounded-full border border-black/10 px-3 py-1">2</button>
              <button className="rounded-full border border-black/10 px-3 py-1">次へ</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-10 flex flex-wrap justify-between gap-4 border-t border-black/10 pt-6 text-xs text-neutral-500">
        <p>© 2025 Creator Platform. All Rights Reserved.</p>
        <div className="flex gap-4">
          <a href="#">利用規約</a>
          <a href="#">プライバシーポリシー</a>
        </div>
      </footer>
    </main>
  );
}
