type Plan = {
  name: string;
  price: string;
  perks: string[];
};

const plans: Plan[] = [
  { name: "ブロンズプラン", price: "¥500", perks: ["限定コンテンツの閲覧"] },
  { name: "シルバープラン", price: "¥1,500", perks: ["限定コンテンツの閲覧", "先行アクセス"] },
  {
    name: "ゴールドプラン",
    price: "¥3,000",
    perks: ["シルバー プランの全特典", "高画質版のダウンロード"]
  },
  {
    name: "シークレットプラン",
    price: "¥5,000",
    perks: ["限定グッズの購入権", "月に一度のQ&Aセッション"]
  }
];

const perkOptions = [
  "限定コンテンツの閲覧",
  "ファンコミュニティ参加",
  "限定グッズの購入権",
  "先行アクセス",
  "高画質版のダウンロード",
  "月に一度のQ&Aセッション"
];

const SidebarLink = ({ label, active = false }: { label: string; active?: boolean }) => (
  <button
    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
      active ? "bg-black text-white" : "text-neutral-500 hover:bg-black/5"
    }`}
  >
    <span>▧</span>
    {label}
  </button>
);

const PlanRow = ({ plan }: { plan: Plan }) => (
  <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm">
    <div>
      <p className="font-semibold">{plan.name}</p>
      <p className="text-neutral-500">{plan.perks[0]}</p>
    </div>
    <span className="font-semibold">{plan.price}</span>
  </div>
);

const ComparisonCard = ({
  plan,
  highlight
}: {
  plan: Plan;
  highlight?: boolean;
}) => (
  <div
    className={`flex-1 rounded-2xl border px-4 py-4 text-sm ${
      highlight
        ? "border-black bg-black text-white"
        : "border-black/10 bg-white text-black"
    }`}
  >
    <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
      {highlight ? "現在のプラン" : "比較プラン"}
    </p>
    <p className="text-lg font-semibold">{plan.name}</p>
    <p className="text-base font-semibold">{plan.price}</p>
    <ul className="mt-3 space-y-1 text-xs">
      {plan.perks.map((perk) => (
        <li key={perk}>・{perk}</li>
      ))}
    </ul>
  </div>
);

export default function PlanManagementPage() {
  const currentPlan = plans[1];

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid gap-6 lg:grid-cols-[260px,1fr,360px]">
        <aside className="min-h-screen border-r border-black/10 bg-black/5 px-6 py-8">
          <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white px-4 py-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-black text-white">
              K
            </div>
            <div>
              <p className="text-sm font-semibold">クリエイター名</p>
              <p className="text-xs text-neutral-500">creator@email.com</p>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <SidebarLink label="ダッシュボード" />
            <SidebarLink label="プラン管理" active />
            <SidebarLink label="会員リスト" />
            <SidebarLink label="収益" />
            <SidebarLink label="設定" />
          </div>

          <button className="mt-8 flex items-center gap-2 text-sm font-semibold text-neutral-500">
            ⎋ ログアウト
          </button>
        </aside>

        <section className="px-6 py-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">サブスクリプションプランを管理</p>
              <h1 className="text-3xl font-semibold">プラン管理</h1>
            </div>
            <div className="flex gap-3">
              <button className="rounded-2xl border border-black bg-black px-4 py-3 text-white">
                ＋ 新規プランを作成
              </button>
              <button className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold">
                プランを並び替え
              </button>
            </div>
          </header>

          <div className="mt-6 space-y-3">
            {plans.map((plan) => (
              <PlanRow key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <section className="border-l border-black/10 bg-black/5 px-6 py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">プランを編集</h2>
            <button className="text-xl text-neutral-400">×</button>
          </div>

          <form className="mt-6 space-y-5">
            <label className="block text-sm font-semibold">
              プラン名
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
                defaultValue={currentPlan.name}
              />
            </label>

            <label className="block text-sm font-semibold">
              月額料金
              <div className="mt-2 flex rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm">
                <span className="text-neutral-500">¥</span>
                <input
                  type="number"
                  className="ml-2 flex-1 border-none bg-transparent focus:outline-none"
                  defaultValue={1500}
                />
              </div>
            </label>

            <div>
              <p className="text-sm font-semibold">特典</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {perkOptions.map((perk) => {
                  const selected = currentPlan.perks.includes(perk);
                  return (
                    <button
                      type="button"
                      key={perk}
                      className={`rounded-2xl border px-4 py-3 text-left ${
                        selected
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black"
                      }`}
                    >
                      {selected ? "✔ " : "＋ "}
                      {perk}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-black/10 bg-white px-4 py-4">
              <p className="text-sm font-semibold">アップセル比較プレビュー</p>
              <div className="flex gap-3">
                <ComparisonCard plan={plans[0]} />
                <ComparisonCard plan={plans[1]} highlight />
                <ComparisonCard plan={plans[2]} />
              </div>
            </div>

            <button type="button" className="text-sm font-semibold text-red-600 underline">
              このプランを削除する
            </button>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-neutral-500"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="rounded-2xl border border-black bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                保存する
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
