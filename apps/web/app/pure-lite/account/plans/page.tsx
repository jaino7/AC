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
    name: "Basic",
    price: "$5",
    description: "Access to all posts",
    features: ["Access to all posts", "Community access"]
  },
  {
    id: "standard",
    name: "Standard",
    price: "$15",
    description: "All Basic features",
    features: ["All Basic features", "Early access content", "Behind-the-scenes updates"]
  },
  {
    id: "premium",
    name: "Premium",
    price: "$25",
    description: "All Standard features",
    features: ["All Standard features", "Monthly Q&A sessions", "Direct messaging with creator"],
    highlight: true,
    badge: "Recommended"
  }
];

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[#7c5dfa]">
    <path
      d="M5 10l3 3 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PureLitePlansPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e9e7ef] px-4 py-10 text-[#1f1f22]">
      <div className="w-full max-w-3xl rounded-[32px] border border-black/5 bg-white p-10 shadow-[0_50px_140px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Choose Your Plan</h1>
            <p className="text-sm text-[#8c8c99]">
              Support your favorite creator and unlock exclusive content by picking a plan.
            </p>
          </div>
          <button className="text-[#9a9aae]">&#x2715;</button>
        </div>

        <div className="mt-8 space-y-6">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[28px] border px-6 py-6 ${
                plan.highlight
                  ? "border-[#a083ff] bg-[#f6f0ff]"
                  : "border-black/10 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <div className="flex items-end gap-1 text-3xl font-bold text-[#7c5dfa]">
                    {plan.price}
                    <span className="text-sm font-normal text-[#7f7f8f]">/ month</span>
                  </div>
                  <p className="text-sm text-[#8d8d9a]">{plan.description}</p>
                </div>
                {plan.badge && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7c5dfa]">
                    {plan.badge}
                  </span>
                )}
              </div>

              <ul className="mt-5 space-y-2 text-sm text-[#5c5c66]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="mt-6 w-full rounded-2xl bg-[#7c5dfa] py-3 text-sm font-semibold text-white">
                Choose Plan
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
