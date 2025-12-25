export default function PureLiteCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#7f8085] px-4 py-12 text-[#1f1f22]">
      <div className="w-full max-w-md rounded-[32px] border border-black/10 bg-white/95 p-8 shadow-[0_55px_160px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe4e4] text-2xl text-[#e53935]">
          ⚠�E�E        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold text-[#e53935]">Cancel Subscription</h1>
          <p className="mt-2 text-sm text-[#6d6d78]">
            Are you sure you want to cancel your subscription to [Creator&apos;s Name]?
          </p>
        </div>

        <section className="mt-6 space-y-3">
          <p className="text-sm font-semibold">Help us improve. Why are you canceling? (Optional)</p>
          <textarea
            rows={4}
            placeholder="Share your feedback..."
            className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm text-[#4a4a54] placeholder:text-[#b4b4c2]"
          />
        </section>

        <section className="mt-6 rounded-[24px] bg-[#f6f6fb] px-5 py-4 text-sm text-[#5d5d68]">
          <p className="text-base font-semibold text-[#1f1f22]">What happens next?</p>
          <ul className="mt-3 space-y-2">
            <li>✔︁EYour plan will remain active until the end of your current billing period.</li>
            <li>🚫 No refunds will be issued for the current subscription period.</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap justify-end gap-3 text-sm">
          <button className="rounded-full border border-[#f28c8c] px-6 py-2 text-[#d84343]">Go Back</button>
          <button className="rounded-full bg-[#e53935] px-6 py-2 font-semibold text-white">Confirm Cancellation</button>
        </div>
      </div>
    </div>
  );
}

