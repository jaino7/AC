type Plan = {
  id: string;
  name: string;
  price: string;
  tagline: string;
  features: string[];
  current?: boolean;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "ベーシック",
    price: "¥980/月",
    tagline: "プロジェクト数5まで",
    features: ["ストレージ 10GB", "基本サポート"]
  },
  {
    id: "pro",
    name: "プロ",
    price: "¥2,480/月",
    tagline: "無制限のプロジェクト",
    features: ["ストレージ 100GB", "優先サポート"],
    current: true
  },
  {
    id: "team",
    name: "チーム",
    price: "¥4,980/月",
    tagline: "チーム機能",
    features: ["共有ストレージ 1TB", "専任サポート"]
  }
];

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 flex-shrink-0 text-cyan-300">
    <path
      d="M5 10l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ChangePlanPage() {
  return (
    <div className="min-h-screen bg-[#050a11] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-semibold">プランを変更</p>
            <p className="text-sm text-white/60">現在のプラン：プロプラン</p>
          </div>
          <button className="text-white/60 hover:text-white">✕</button>
        </header>

        <div className="space-y-4">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[26px] border bg-[#0a111b] px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${
                plan.current
                  ? "border-purple-400"
                  : plan.id === "team"
                    ? "border-cyan-400/70"
                    : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <p className="text-3xl font-bold">{plan.price}</p>
                </div>
                {plan.current && (
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-200">
                    現在のプラン
                  </span>
                )}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <CheckIcon />
                  {plan.tagline}
                </li>
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

        <section className="rounded-[24px] border border-white/10 bg-[#0a111b] px-6 py-4 text-sm text-white/70">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span>選択中のプラン</span>
            <span>チームプラン</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 py-3">
            <span>料金の差額</span>
            <span className="font-semibold text-white">
              次回請求時に <span className="text-cyan-300">¥2,500</span> の差額が課金されます。
            </span>
          </div>
          <p className="pt-3 text-xs text-white/60">この変更は即時に適用されます。</p>
        </section>

        <div className="flex items-center justify-end gap-4">
          <button className="rounded-2xl border border-white/15 px-6 py-2 text-sm text-white/70 hover:text-white">
            キャンセル
          </button>
          <button className="rounded-2xl bg-cyan-400 px-6 py-2 text-sm font-semibold text-[#04121c] hover:bg-cyan-300">
            プランを変更する
          </button>
        </div>
      </div>
    </div>
  );
}

