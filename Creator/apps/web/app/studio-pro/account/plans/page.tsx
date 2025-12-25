type Plan = {
  id: string;
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "ベ�EシチE��",
    price: "¥980",
    features: ["コア機�Eへのアクセス", "基本皁E��サポ�EチE, "月間10プロジェクトまで"]
  },
  {
    id: "premium",
    name: "プレミアム",
    price: "¥2,980",
    features: ["スタンダード�Eランの全機�E", "限定コンチE��チE, "専任のサポ�EチE],
    highlight: true,
    badge: "おすすめ"
  },
  {
    id: "standard",
    name: "スタンダーチE,
    price: "¥1,980",
    features: ["ベ�EシチE��プランの全機�E", "高度な刁E��機�E", "優先サポ�EチE]
  }
];

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[#4e92ff]">
    <path
      d="M5 10l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function StudioProPlansPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050912] px-4 py-12 text-white">
      <div className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-[#0b1426] p-10 shadow-[0_60px_160px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">プランを選抁E/h1>
            <p className="mt-2 text-sm text-white/70">あなたに最適なプランを選んで、すべての機�EにアクセスしましょぁE��E/p>
          </div>
          <button className="text-white/60">✁E/button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[28px] border px-6 py-6 ${
                plan.highlight
                  ? "border-[#2c6dff] shadow-[0_25px_80px_rgba(44,109,255,0.3)]"
                  : "border-white/10"
              } bg-[#0f1d35]`}
            >
              <div className="flex items-start justify-between">
                <p className="text-lg font-semibold">{plan.name}</p>
                {plan.badge && (
                  <span className="rounded-full bg-[#20418a] px-3 py-1 text-xs">{plan.badge}</span>
                )}
              </div>
              <div className="mt-4 text-3xl font-bold">
                {plan.price}
                <span className="text-base font-normal text-white/70"> /朁E/span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-white/80">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  plan.highlight
                    ? "border-[#2c6dff] bg-[#2c6dff] text-white"
                    : "border-white/20 text-white/80"
                }`}
              >
                こ�Eプランを選ぶ
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

