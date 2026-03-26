export default function StudioProCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05080f] px-4 py-16 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-red-500/40 bg-[#0d111b] p-8 shadow-[0_70px_180px_rgba(255,0,0,0.25)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2a1c1c] text-2xl text-red-400">
          &#9888;
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold text-red-400">サブスクリプションをキャンセル</h1>
          <p className="mt-2 text-sm text-white/70">この操作は取り消せません。本当にキャンセルしますか？</p>
        </div>

        <section className="mt-6 text-sm">
          <p className="font-semibold text-white/85">よろしければ、キャンセルの理由をお聞かせください。（任意）</p>
          <textarea
            rows={4}
            placeholder="フィードバックを入力..."
            className="mt-3 w-full rounded-2xl border border-white/15 bg-[#141a27] px-4 py-3 text-white placeholder:text-white/40"
          />
        </section>

        <div className="mt-6 rounded-2xl bg-[#111624] px-4 py-3 text-sm text-white/75">
          <p>・キャンセル後、現在のプランは月末まで利用できます</p>
          <p>・日割りでの返金はありません</p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 text-sm">
          <button className="rounded-full border border-red-500/60 px-6 py-2 text-red-300">戻る</button>
          <button className="rounded-full bg-red-500 px-6 py-2 font-semibold text-white">
            キャンセルを確認
          </button>
        </div>
      </div>
    </div>
  );
}
