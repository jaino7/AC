export default function CancelSubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#04090f] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-16">
        <section className="w-full rounded-[28px] border border-red-500/40 bg-[#0a111a] p-8 shadow-[0_35px_100px_rgba(0,0,0,0.6)]">
          <header className="flex items-center gap-3 border-b border-red-500/30 pb-5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-red-500/20 text-red-300">
              ⚠️
            </span>
            <div>
              <p className="text-lg font-semibold">サブスクリプションをキャンセル</p>
              <p className="text-sm text-white/70">
                サブスクリプションは現在の請求期間の終了時に無効になります。日割り返金はありません。
              </p>
            </div>
          </header>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-white/80">
            <p>
              キャンセル後、プロジェクトデータへのアクセスが制限される可能性があります。内容をご確認の上、問題がなければ続行してください。
            </p>
            <div>
              <p className="font-semibold text-white">よろしければ、キャンセルの理由をお聞かせください（任意）</p>
              <textarea
                rows={4}
                placeholder="例：料金が高い、使いたい機能がなかった"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0f1a23] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-red-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/10 pt-6">
            <button className="rounded-2xl bg-white/10 px-6 py-2 text-sm font-semibold text-white/80 hover:text-white">
              戻る
            </button>
            <button className="rounded-2xl bg-[#e74c3c] px-6 py-2 text-sm font-semibold text-white hover:bg-[#d84334]">
              キャンセルを確定
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

