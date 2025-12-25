export default function NeonProCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111827] px-4 py-16 text-white">
      <div className="relative w-full max-w-md rounded-[32px] border border-red-400/40 bg-[#141933] px-8 py-10 shadow-[0_60px_160px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 rounded-[32px] bg-red-400/20 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-red-400/50 bg-red-500/10 text-2xl text-red-300">
              ⚠�E�E            </div>
            <div>
              <h1 className="text-2xl font-semibold">サブスクリプションをキャンセル</h1>
              <p className="mt-2 text-sm text-white/70">
                Your plan will remain active until the end of the current billing period. Please note
                that this action is final and no refunds will be issued for the remaining time.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-white/80">Reason for cancellation (optional)</p>
            <textarea
              rows={4}
              placeholder="Please share why you're leaving..."
              className="w-full rounded-3xl border border-white/15 bg-[#1a2245] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-red-300 focus:outline-none"
            />
          </div>

          <div className="space-y-3 pt-4">
            <button className="w-full rounded-3xl bg-[#ff7b7b] py-3 text-sm font-semibold text-[#3c0d0d] hover:bg-[#ff6b6b]">
              キャンセルを確宁E            </button>
            <button className="w-full rounded-3xl border border-red-400/60 py-3 text-sm font-semibold text-red-200 hover:bg-red-400/10">
              戻めE            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

