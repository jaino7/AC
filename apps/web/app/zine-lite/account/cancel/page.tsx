export default function ZineLiteCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-16 text-white">
      <div className="w-full max-w-2xl rounded-[32px] border border-red-500/40 bg-[#0f1b0f] p-10 shadow-[0_0_80px_rgba(255,0,0,0.15)]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            ⚠�E�E          </div>
          <h1 className="mt-4 text-2xl font-semibold text-red-400">本当にキャンセルしますか�E�E/h1>
          <p className="mt-2 text-sm text-white/80">
            サブスクリプションをキャンセルすると、現在の請求期間終亁E��にPROプランの特典にアクセスできなくなります、E          </p>
        </div>

        <section className="mt-6 space-y-3">
          <label className="block text-sm text-white/80">
            キャンセル琁E���E�任意！E            <textarea
              rows={4}
              placeholder="今後�Eサービス改喁E�Eため、理由をお聞かせいただけると幸ぁE��す、E
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#151f15] px-4 py-3 text-white placeholder:text-white/40"
            />
          </label>

          <div className="rounded-2xl border border-white/15 bg-[#111e11] px-4 py-4 text-sm text-white/80">
            <p>
              <strong>プラン利用期間:</strong> 現在の請求期間！EYYY年MM朁ED日まで�E��E、引き続きすべての機�Eをご利用ぁE��だけます、E            </p>
            <p className="mt-2">
              <strong>返��ポリシー:</strong> 日割りでの返��は行われません。詳細は利用規紁E��ご確認ください、E            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap justify-end gap-4 text-sm">
          <button className="rounded-full border border-white/20 px-6 py-2 text-white/70">戻めE/button>
          <button className="rounded-full bg-red-500 px-6 py-2 font-semibold text-white">キャンセルを確宁E/button>
        </div>
      </div>
    </div>
  );
}

