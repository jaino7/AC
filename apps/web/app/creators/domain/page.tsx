const steps = [
  { label: "CNAMEレコードの設定", status: "current" },
  { label: "DNSの検証", status: "upcoming" },
  { label: "SSL証明書の発行", status: "upcoming" }
];

const records = [
  { key: "Host/Name", value: "www" },
  { key: "Type", value: "CNAME" },
  { key: "Value/Target", value: "your-service.provider.com" }
];

const RecordRow = ({ keyName, value }: { keyName: string; value: string }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white/60 px-4 py-3">
    <div className="w-40 text-xs uppercase tracking-[0.3em] text-neutral-500">{keyName}</div>
    <div className="flex-1 text-sm font-semibold">{value}</div>
    <button className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold">
      コピー
    </button>
  </div>
);

export default function DomainPage() {
  return (
    <main className="min-h-screen bg-white px-6 pb-12 pt-6 text-black lg:px-16">
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        ⚠ SSL証明書の有効期限が切れています。サイトを復旧するには、こちらをクリックしてください。
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">ドメイン設定</p>
          <h2 className="text-xl font-semibold">カスタムドメインウィザード</h2>

          <ol className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <li
                key={step.label}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  step.status === "current"
                    ? "border-black bg-black text-white"
                    : "border-black/10 text-neutral-500"
                }`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 text-base">
                  {index + 1}
                </span>
                {step.label}
              </li>
            ))}
          </ol>
        </aside>

        <section className="space-y-6 rounded-3xl border border-black/10 bg-white p-8 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">STEP 1</p>
            <h1 className="text-3xl font-semibold">CNAMEレコードの設定</h1>
            <p className="text-sm text-neutral-500">
              ドメインプロバイダーの管理画面で、以下のCNAMEレコードを追加してください。
            </p>
          </div>

          <div className="space-y-3">
            {records.map((record) => (
              <RecordRow key={record.key} keyName={record.key} value={record.value} />
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button className="text-sm font-semibold text-neutral-500 underline">戻る</button>
            <button className="rounded-2xl border border-black bg-black px-6 py-3 text-white">
              次へ →
            </button>
          </div>
        </section>
      </div>

      <footer className="mt-10 flex flex-wrap justify-between gap-4 border-t border-black/10 pt-6 text-xs text-neutral-500">
        <p>© 2025 Micro Funding Platform. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#">利用規約</a>
          <a href="#">プライバシーポリシー</a>
        </div>
      </footer>
    </main>
  );
}
