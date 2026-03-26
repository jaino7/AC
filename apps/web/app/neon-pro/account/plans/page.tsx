const plans = [
  {
    id: "basic",
    name: "ベーシック",
    price: "¥980",
    description: "個人利用や小規模な用途向け",
    features: ["基本的な機能A", "基本的な機能B", "基本的な機能C"]
  },
  {
    id: "standard",
    name: "スタンダード",
    price: "¥1,980",
    description: "一般的なユーザー向けの標準機能",
    features: ["全てのベーシック機能", "追加機能D", "追加機能E"],
    highlight: true
  },
  {
    id: "premium",
    name: "プレミアム",
    price: "¥2,980",
    description: "プロフェッショナル向けの全機能",
    features: ["全てのスタンダード機能", "高度な機能F", "優先サポート"],
    badge: "おすすめ"
  }
];

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-cyan-200">
    <path
      d="M5 10l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function NeonProPlansPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4a4a4a] px-4 py-16 text-white">
      <div className="relative w-full max-w-5xl rounded-[32px] border border-cyan-500/50 bg-[#071032] px-10 py-12 shadow-[0_50px_140px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-0 rounded-[32px] bg-cyan-400/20 blur-3xl" aria-hidden />
        <div className="relative z-10">
          <header className="text-center">
            <h1 className="text-3xl font-semibold">プランを選択</h1>
            <p className="mt-2 text-sm text-white/70">あなたにぴったりのプランを選んでください</p>
          </header>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`rounded-[28px] border px-6 py-8 ${
                  plan.highlight
                    ? "border-cyan-400 shadow-[0_25px_80px_rgba(16,185,202,0.25)]"
                    : "border-white/10"
                } bg-[#0b1838]`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold">{plan.name}</p>
                    <p className="mt-2 text-3xl font-bold">{plan.price} <span className="text-base font-normal text-white/70">月額</span></p>
                  </div>
                  {plan.badge && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-white/70">{plan.description}</p>

                <ul className="mt-6 space-y-3 text-sm text-white/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className="mt-8 w-full rounded-2xl border border-cyan-400/60 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/10">
                  このプランを選ぶ
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
