export default function VelvetProCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141418] px-4 py-16 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-red-500/40 bg-[#121214] p-8 shadow-[0_0_120px_rgba(255,0,0,0.15)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2c1818] text-red-400">
          ⚠�E�E        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold text-red-400">Cancel Subscription</h1>
          <p className="mt-2 text-sm text-white/75">
            We&apos;re sorry to see you go. Could you please tell us why you&apos;re canceling? Your feedback is important to us.
          </p>
        </div>

        <section className="mt-6 text-sm">
          <p className="font-semibold text-white/80">Reason for cancellation (optional)</p>
          <textarea
            rows={4}
            placeholder="Please provide your feedback here..."
            className="mt-3 w-full rounded-2xl border border-white/10 bg-[#16161a] px-4 py-3 text-white placeholder:text-white/40"
          />
        </section>

        <p className="mt-6 text-xs text-white/60">
          Please note: Your current plan will remain active until the end of your billing period. No refunds will be issued for the remaining time.
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3 text-sm">
          <button className="rounded-full border border-red-500/50 px-6 py-2 text-red-300">Go Back</button>
          <button className="rounded-full bg-red-500 px-6 py-2 font-semibold text-white">
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

