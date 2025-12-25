const plans = [
  {
    id: "silver",
    name: "Silver",
    price: "$9.99",
    features: ["Basic Feature A", "Basic Feature B", "Basic Feature C"]
  },
  {
    id: "gold",
    name: "Gold",
    price: "$14.99",
    features: ["All Silver features", "Plus Feature D", "Plus Feature E"],
    highlight: true,
    badge: "Popular"
  },
  {
    id: "diamond",
    name: "Diamond",
    price: "$19.99",
    features: ["All Gold features", "Plus Premium Feature F", "Plus Premium Feature G"],
    current: true
  }
];

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-yellow-400">
    <path
      d="M5 10l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function VelvetProChangePlanPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#565a68] px-4 py-12 text-white">
      <div className="w-full max-w-5xl rounded-[32px] border border-yellow-500/40 bg-[#0d0d11]/95 p-10 shadow-[0_0_120px_rgba(255,214,0,0.2)]">
        <div>
          <h1 className="text-3xl font-semibold text-yellow-300">Change Your Plan</h1>
          <p className="mt-2 text-sm text-white/70">Currently on: Diamond ($19.99/month)</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[28px] border px-6 py-6 ${
                plan.highlight
                  ? "border-yellow-400 shadow-[0_0_50px_rgba(255,214,0,0.4)]"
                  : "border-white/10"
              } bg-[#14141c]`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{plan.name}</p>
                {plan.badge && (
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black">
                    {plan.badge}
                  </span>
                )}
                {plan.current && (
                  <span className="rounded-full bg-[#3a331a] px-3 py-1 text-xs text-yellow-300">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="mt-4 text-3xl font-bold">
                {plan.price}
                <span className="text-base font-normal text-white/60"> /month</span>
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

        <div className="mt-8 border-t border-white/10 pt-6 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Plan Change</span>
            <span className="font-semibold text-white">Downgrade from Diamond to Gold</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-white/70">Billing Adjustment</span>
            <span className="font-semibold text-white">
              A prorated credit of $5.00 will be applied.
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-4 text-sm">
          <button className="rounded-full border border-white/20 px-6 py-2 text-white/70">Cancel</button>
          <button className="rounded-full bg-yellow-400 px-6 py-2 font-semibold text-black">
            Change Plan
          </button>
        </div>
      </div>
    </div>
  );
}

