const plans = [
  {
    id: "basic",
    name: "BASIC",
    price: "¥500 /月",
    features: ["基本的な機能", "限定記事へのアクセス", "コミュニティ参加"]
  },
  {
    id: "pro",
    name: "PRO",
    price: "¥1,500 /月",
    features: ["全ての基本機能", "限定ビデオコンテンツ", "ソースコードアクセス", "月1回のQ&Aセッション"],
    current: true
  },
  {
    id: "premium",
    name: "PREMIUM",
    price: "¥3,000 /月",
    features: ["全てのプロ機能", "直接DMサポート", "ベータ機能の早期アクセス", "限定グループ"],
    highlight: true
  }
];

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-green-400">
    <path
      d="M5 10l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ZineLiteChangePlanPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040704] px-4 py-12 text-white">
      <div className="w-full max-w-5xl rounded-[32px] border border-green-800 bg-[#112411] p-10 shadow-[0_0_80px_rgba(0,255,0,0.1)]">
        <div>
          <h1 className="text-3xl font-semibold">プラン変更</h1>
          <p className="mt-2 text-sm text-white/70">現在のプラン：PRO - ¥1,500/月</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[28px] border px-6 py-6 ${
                plan.highlight
                  ? "border-green-400 shadow-[0_0_40px_rgba(0,255,0,0.3)]"
                  : "border-green-900"
              } bg-[#121f12]`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{plan.name}</p>
                {plan.current && (
                  <span className="rounded-full bg-green-500/30 px-3 py-1 text-xs text-green-200">
                    現在のプラン
                  </span>
                )}
              </div>
              <div className="mt-4 text-3xl font-bold">{plan.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-8 space-y-2 rounded-[20px] border border-green-900 bg-[#0f1e0f] px-6 py-4 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span>本日のお支払い差額</span>
            <span>¥1,500</span>
          </div>
          <div className="flex items-center justify-between">
            <span>次回の請求日</span>
            <span>2024年08月15日</span>
          </div>
          <div className="flex items-center justify-between">
            <span>次回の請求額</span>
            <span>¥3,000</span>
          </div>
          <p className="text-xs text-white/60">新しいプランは即時適用されます。</p>
        </section>

        <div className="mt-8 flex flex-wrap justify-end gap-4">
          <button className="rounded-full border border-white/20 px-6 py-2 text-white/70">キャンセル</button>
          <button className="rounded-full bg-green-500 px-6 py-2 font-semibold text-black">
            プランを変更
          </button>
        </div>
      </div>
    </div>
  );
}
