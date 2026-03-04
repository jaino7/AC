import { SignupForm } from "./signup-form";

const features = [
  {
    title: "業界最安水準の手数料（2.8%〜）",
    description:
      "Businessプラン2.8%、Liteプラン5%の低手数料で、手残りを最大化。"
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
    <main className="min-h-screen bg-white py-16 text-black lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-10 lg:grid-rows-[auto_auto_1fr]">
        {/* ブロックA: メインキャッチコピー（スマホ・PCとも一番上） */}
        <div className="space-y-4 px-6 lg:col-start-1 lg:row-start-1 lg:px-0">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
            完全自立型クリエイタープラットフォーム
          </p>
          <h1 className="text-3xl font-semibold leading-tight lg:text-4xl lg:leading-tight">
            プラットフォームの都合に
            <br className="hidden lg:block" />
            振り回されない。
            <br />
            あなた自身のブランドで収益化。
          </h1>
        </div>

        {/* ブロックC: フォーム（スマホではすぐ下、PCでは右カラム全体） */}
        <section className="mx-4 rounded-[28px] border border-black/10 bg-white p-6 shadow-sm lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mx-0 lg:rounded-3xl lg:p-8 lg:shadow-[0px_30px_80px_rgba(0,0,0,0.08)]">
          <SignupForm />
        </section>

        {/* ブロックA-2: サブキャッチコピー・説明文（スマホではフォームの下、PCではキャッチコピーの直下） */}
        <div className="border-t border-neutral-100 px-6 pt-8 lg:col-start-1 lg:row-start-2 lg:border-t-0 lg:px-0 lg:pt-0">
          <p className="text-sm text-neutral-600 lg:text-base">
            独自ドメイン・業界最安水準の手数料（2.8%〜）で、凍結リスクなく長期的な収益を最大化できるプラットフォーム。直感的な管理画面で、安心して活動を広げられます。
          </p>
        </div>

        {/* ブロックB: 特徴リスト（スマホでは説明文の下、PCでは左カラムのさらに下） */}
        <div className="space-y-4 px-6 pt-4 lg:col-start-1 lg:row-start-3 lg:px-0 lg:pt-0">
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
      </div>
    </main>
  );
}
