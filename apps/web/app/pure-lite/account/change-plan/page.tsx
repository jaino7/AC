const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "$19.99",
    features: ["Access to basic content", "Community access", "Email support"]
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "$29.99",
    features: ["Access to all content", "Exclusive tutorials", "Priority support"],
    current: true
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "$49.99",
    features: ["All Pro features", "1-on-1 coaching", "Early access"],
    highlight: true
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

export default function PureLiteChangePlanPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f1f7] px-4 py-12 text-[#1f1f22]">
      <div className="w-full max-w-3xl rounded-[32px] border border-black/5 bg-white p-10 shadow-[0_50px_150px_rgba(0,0,0,0.12)]">
        <header className="pb-6">
          <h1 className="text-2xl font-semibold">Change Your Plan</h1>
          <p className="text-sm text-[#8d8d9a]">You are currently on the Pro plan at $29.99/month.</p>
        </header>

        <div className="space-y-4">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-[24px] border px-6 py-6 ${
                plan.highlight
                  ? "border-[#b097ff] bg-[#f8f3ff]"
                  : "border-black/10 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <p className="text-3xl font-bold text-[#7c5dfa]">
                    {plan.price}
                    <span className="text-base font-normal text-[#7f7f8f]"> /month</span>
                  </p>
                </div>
                {plan.current && (
                  <span className="rounded-full bg-[#f1eaff] px-3 py-1 text-xs font-semibold text-[#7c5dfa]">
                    Current
                  </span>
                )}
              </div>

              <ul className="mt-4 space-y-2 text-sm text-[#595966]">
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

        <section className="mt-6 rounded-[24px] border border-black/5 bg-[#f7f6fb] px-6 py-5 text-sm text-[#6c6c78]">
          <h2 className="text-base font-semibold text-[#1f1f22]">Confirmation</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <dt>Plan Change</dt>
              <dd className="font-semibold text-[#1f1f22]">Pro Plan to Premium Plan</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>New Charge</dt>
              <dd className="font-semibold text-[#1f1f22]">$49.99/month</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Effective Date</dt>
              <dd className="font-semibold text-[#1f1f22]">October 24, 2024</dd>
            </div>
          </dl>
        </section>

        <div className="mt-8 flex flex-wrap justify-end gap-4">
          <button className="rounded-full border border-black/10 px-6 py-2 text-sm text-[#6f6f7a]">
            Cancel
          </button>
          <button className="rounded-full bg-[#7c5dfa] px-6 py-2 text-sm font-semibold text-white">
            Change Plan
          </button>
        </div>
      </div>
    </div>
  );
}

