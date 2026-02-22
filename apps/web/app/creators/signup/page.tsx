import { SignupForm } from "./signup-form";

const features = [
  {
    title: "業界最安水準の手数料（3.0%〜）",
    description:
      "Businessプラン3.0%、Liteプラン6.0%の低手数料で、手残りを最大化。"
  },
  {
    title: "凍結リスクゼロ・完全自立型",
    description:
      "独自ドメインで運営。突然のアカウント凍結や一方的な規約変更から解放されます。"
  },
  {
    title: "シンプルな管理画面",
    description:
      "コンテンツ投稿、ファン管理、収益確認を一つのダッシュボードで完結。"
  }
];


export default function SignupPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-black lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <section className="space-y-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              完全自立型クリエイタープラットフォーム
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              プラットフォームの都合に
              <br />
              振り回されない。
              <br />
              あなた自身のブランドで収益化。
            </h1>
            <p className="text-base text-neutral-600">
              独自ドメイン・業界最安水準の手数料（3.0%〜）で、凍結リスクなく長期的な収益を最大化できるプラットフォーム。直感的な管理画面で、安心して活動を広げられます。
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-black/10 bg-neutral-50 p-5"
              >
                <h2 className="text-lg font-semibold">{feature.title}</h2>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0px_30px_80px_rgba(0,0,0,0.08)]">
          <SignupForm />
        </section>
      </div>
    </main>
  );
}
