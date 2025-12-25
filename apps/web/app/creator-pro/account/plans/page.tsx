type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: {
    label: string;
  };
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "ベーシック",
    price: "¥980",
    description: "趣味や始めたばかりの方に最適な基本プランです。",
    features: ["基本的な機能A", "基本的な機能B", "基本的な機能C"]
  },
  {
    id: "standard",
    name: "スタンダード",
    price: "¥1,980",
    description: "本格的に活動するクリエイター向けの標準プラン。",
    features: ["スタンダード機能A", "スタンダード機能B", "スタンダード機能C", "スタンダード機能D"]
  },
  {
    id: "premium",
    name: "プレミアム",
    price: "¥4,980",
    description: "プロやチームでの利用に最適な最上位プランです。",
    features: [
      "プレミアム機能A",
      "プレミアム機能B",
      "プレミアム機能C",
      "プレミアム機能D",
      "プレミアム機能E"
    ],
    highlight: {
      label: "おすすめ"
    }
  }
];

const Checkmark = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 flex-shrink-0 text-cyan-300"
  >
    <path
      d="M5 10.5l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CreatorProPlansPage() {
  return (
    <div className="min-h-screen bg-[#dfe4ea]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-16">
        <div className="w-full rounded-[32px] border border-black/5 bg-[#0a1828] px-6 py-10 text-white shadow-[0_40px_120px_rgba(6,15,25,0.4)] md:px-10">
          <header className="text-center">
            <p className="text-sm text-cyan-200/80">あなたのクリエイティブ活動に最適なプランを見つけましょう。</p>
            <h1 className="mt-2 text-3xl font-semibold">プランを選択</h1>
          </header>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-[26px] border px-6 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] ${
                  plan.highlight
                    ? "border-cyan-400 bg-[#06121f]"
                    : "border-white/10 bg-[#091622]"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 right-6 rounded-full border border-cyan-400 bg-cyan-500/90 px-3 py-1 text-xs font-semibold text-[#01232d]">
                    {plan.highlight.label}
                  </span>
                )}
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <p className="text-3xl font-bold">{plan.price}</p>
                  <p className="text-sm text-white/60">/月</p>
                  <p className="text-sm text-white/60">{plan.description}</p>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-white/90">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Checkmark />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-8 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    plan.highlight
                      ? "bg-cyan-400 text-[#021018] hover:bg-cyan-300"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
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

