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
    id: "velvet",
    name: "Velvet",
    price: "$19",
    features: ["Access to core features", "Basic email support", "Up to 5 projects"]
  },
  {
    id: "diamond",
    name: "Diamond",
    price: "$99",
    features: [
      "All features in Platinum",
      "Dedicated 24/7 support",
      "Unlimited projects",
      "Early access to new features"
    ],
    highlight: true,
    badge: "Most Popular"
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "$49",
    features: ["All features in Velvet", "Priority chat support", "Up to 50 projects", "Advanced analytics"]
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

export default function VelvetProPlansPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12 text-white">
      <div className="w-full max-w-5xl rounded-[32px] border border-yellow-500/40 bg-[#0c0c10]/95 p-10 shadow-[0_0_80px_rgba(255,255,0,0.15)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-yellow-300">Choose Your Plan</h1>
            <p className="mt-2 text-sm text-white/70">
              Select the perfect plan that fits your needs and unlock premium features to elevate your experience.
            </p>
          </div>
          <button className="text-white/50">&#x2715;</button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[28px] border px-6 py-6 ${
                plan.highlight
                  ? "border-yellow-400 shadow-[0_0_50px_rgba(255,204,0,0.35)]"
                  : "border-white/10"
              } bg-[#111119]`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{plan.name}</p>
                {plan.badge && (
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="mt-4 text-4xl font-bold text-white">
                {plan.price}
                <span className="text-base font-normal text-white/70"> / month</span>
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
                className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold ${
                  plan.highlight ? "bg-yellow-400 text-black" : "bg-white/10 text-white"
                }`}
              >
                Choose Plan
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
