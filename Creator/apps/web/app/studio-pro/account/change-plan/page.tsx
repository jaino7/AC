const plans = [
  {
    id: "basic",
    name: "ベ�EシチE��",
    price: "¥500",
    features: ["HD画質", "1チE��イス"]
  },
  {
    id: "premium",
    name: "プレミアム",
    price: "¥1,000",
    features: ["フルHD画質", "2チE��イス"],
    current: true
  },
  {
    id: "pro",
    name: "プロ",
    price: "¥1,500",
    features: ["4K画質", "褁E��チE��イス"]
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

export default function StudioProChangePlanPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050912] px-4 py-12 text-white">
      <div className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-[#0b1426] p-10 shadow-[0_60px_160px_rgba(0,0,0,0.6)]">
        <header>
          <h1 className="text-3xl font-semibold">プランを変更</h1>
          <p className="mt-2 text-sm text-white/60">現在のプラン�E��Eレミアム�E�¥1,000/月！E/p>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[28px] border px-6 py-6 ${
                plan.current
                  ? "border-[#2c6dff] shadow-[0_25px_80px_rgba(44,109,255,0.3)]"
                  : "border-white/10"
              } bg-[#0f1d35]`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{plan.name}</p>
                {plan.current && (
                  <span className="rounded-full bg-[#28428a] px-3 py-1 text-xs">現在のプラン</span>
                )}
              </div>
              <div className="mt-4 text-3xl font-bold">
                {plan.price}
                <span className="text-base font-normal text-white/70"> /朁E/span>
              </div>

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

        <p className="mt-8 text-sm text-white/60">
          次回�E請求から新しい料��が適用されます。差額�E○○冁E��す、E        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-4">
          <button className="rounded-full border border-white/20 px-6 py-2 text-sm text-white/70">
            キャンセル
          </button>
          <button className="rounded-full bg-[#2c6dff] px-6 py-2 text-sm font-semibold text-white">
            プランを変更
          </button>
        </div>
      </div>
    </div>
  );
}

