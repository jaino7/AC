type Plan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "ベーシック",
    price: "¥980 /月",
    description: "クリエイターの世界を覗く第一歩",
    features: ["限定記事の閲覧", "コミュニティへの参加", "月1回のニュースレター"]
  },
  {
    id: "premium",
    name: "プレミアム",
    price: "¥2,980 /月",
    description: "全ての限定コンテンツを最大限に楽しむ",
    features: ["スタンダードの全機能", "限定ビデオコンテンツ", "クリエイターとのQ&Aセッション", "早期アクセス"],
    highlight: true,
    badge: "おすすめ"
  },
  {
    id: "standard",
    name: "スタンダード",
    price: "¥1,980 /月",
    description: "より深くコンテンツを体験したいあなたへ",
    features: ["ベーシックの全機能", "高解像度画像のダウンロード", "過去コンテンツへのアクセス", "メンバー限定チャット"]
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

export default function ZineLitePlansPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060606] px-4 py-12 text-white">
      <div className="w-full max-w-5xl rounded-[32px] border border-white/15 bg-[#101010]/95 p-10 shadow-[0_0_80px_rgba(0,255,0,0.15)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">プランを選択</h1>
            <p className="mt-2 text-sm text-white/70">
              あなたに最適なプランを見つけて、限定コンテンツにアクセスしましょう。
            </p>
          </div>
          <button className="text-white/60">&#x2715;</button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[28px] border px-6 py-6 ${
                plan.highlight ? "border-green-400 shadow-[0_0_40px_rgba(0,255,0,0.3)]" : "border-white/15"
              } bg-[#141414]`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <p className="mt-2 text-3xl font-bold">{plan.price}</p>
                  <p className="mt-1 text-sm text-white/70">{plan.description}</p>
                </div>
                {plan.badge && (
                  <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-black">
                    {plan.badge}
                  </span>
                )}
              </div>
              <ul className="mt-5 space-y-2 text-sm text-white/80">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold ${
                  plan.highlight ? "bg-green-500 text-black" : "border border-white/20"
                }`}
              >
                このプランを選ぶ
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
