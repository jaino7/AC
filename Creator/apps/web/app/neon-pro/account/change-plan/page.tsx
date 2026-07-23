const plans = [
  {
    id: "basic",
    name: "ベーシック",
    price: "¥500/月",
    features: ["基本機能", "ユーザー数 1", "ストレージ 10GB"]
  },
  {
    id: "premium",
    name: "プレミアム",
    price: "¥1,000/月",
    features: ["全てのプロ機能", "ユーザー数 5", "ストレージ 100GB"],
    current: true
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    price: "¥2,000/月",
    features: ["全てのプレミアム機能", "無制限のユーザー", "無制限のストレージ"]
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

export default function NeonProChangePlanPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4a4a4a] px-4 py-16 text-white">
      <div className="relative w-full max-w-5xl rounded-[32px] border border-cyan-500/50 bg-[#07102f] px-10 py-12 shadow-[0_60px_160px_rgba(0,0,0,0.65)]">
        <div className="absolute inset-0 rounded-[32px] bg-cyan-400/20 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-8">
          <header>
            <h1 className="text-3xl font-semibold">プランを変更</h1>
            <p className="mt-2 text-sm text-white/70">現在のプラン: プレミアム (¥1,000/月)</p>
          </header>

          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`rounded-[28px] border px-6 py-6 ${
                  plan.current
                    ? "border-cyan-400 shadow-[0_25px_80px_rgba(16,185,202,0.25)]"
                    : "border-white/10"
                } bg-[#0a183b]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{plan.name}</p>
                    <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                  </div>
                  {plan.current && (
                    <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                      現在のプラン
                    </span>
                  )}
                </div>
                <ul className="mt-4 space-y-3 text-sm text-white/80">
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

          <section className="rounded-[28px] border border-white/10 bg-[#0b1636] px-6 py-5 text-sm text-white/80">
            <h2 className="text-base font-semibold text-white">変更前後の確認</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-white/60">選択中のプラン</dt>
                <dd>プレミアム</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-white/60">差額</dt>
                <dd>¥0</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-white/60">適用日</dt>
                <dd>変更なし</dd>
              </div>
            </dl>
          </section>

          <div className="flex flex-wrap justify-end gap-4 pt-2">
            <button className="rounded-2xl border border-white/15 px-6 py-2 text-sm text-white/70 hover:text-white">
              キャンセル
            </button>
            <button className="rounded-2xl bg-cyan-400 px-6 py-2 text-sm font-semibold text-[#041021] hover:bg-cyan-300">
              プランを変更
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
