import { SignupForm } from "./signup-form";

const features = [
  {
    title: "高い収益性",
    description:
      "アダルト対応の決済連携と柔軟なサブスク設計で、収益を最大化できます。"
  },
  {
    title: "シンプルな管理",
    description:
      "投稿・メッセージ・テーマ編集をひとつのダッシュボードで完結。"
  },
  {
    title: "ファンとの強い繋がり",
    description:
      "限定コンテンツ配信やメッセージ機能で、濃いコミュニティを育てられます。"
  }
];


export default function SignupPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-black lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <section className="space-y-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              クリエイター向けマイクロファンディング
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              あなたのブランドで
              <br />
              ファンとの関係を築こう
            </h1>
            <p className="text-base text-neutral-600">
              独自ドメイン、アダルト対応決済、Twitter最適化を一つにまとめた
              安全な収益化プラットフォーム。直感的な管理画面と厳格な年齢確認で、安心して活動を広げられます。
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
