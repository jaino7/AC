"use client";

import { useState } from "react";

const options = [
  { id: "yes", label: "はい" },
  { id: "no", label: "いいえ" }
];

export default function NeonProAgeCheckPage() {
  const [selected, setSelected] = useState("yes");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f24] px-4 py-16 text-white">
      <div className="relative w-full max-w-md rounded-[32px] border border-cyan-400/60 bg-[#111a3a] px-8 py-10 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-0 rounded-[32px] bg-cyan-400/20 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-cyan-300/40 bg-cyan-400/10 text-cyan-200 text-2xl">
              ⚠️
            </div>
            <div>
              <h1 className="text-2xl font-semibold">年齢確認</h1>
              <p className="mt-2 text-sm text-white/70">このコンテンツは18歳以上のみが視聴できます</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-white/80">あなたは18歳以上ですか？</p>
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${selected === option.id ? "border-cyan-400 bg-cyan-400/10" : "border-white/15 bg-[#0f1735]"
                  }`}
              >
                <span>{option.label}</span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border ${selected === option.id ? "border-cyan-300" : "border-white/30"
                    }`}
                >
                  {selected === option.id && <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />}
                </span>
              </button>
            ))}
          </div>

          <label className="flex items-start gap-3 text-xs text-white/70">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-cyan-300 focus:ring-0"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>利用規約とプライバシーポリシーに同意します。</span>
          </label>

          <button
            disabled={selected !== "yes" || !agreed}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${selected === "yes" && agreed
                ? "bg-cyan-400 text-[#041024] hover:bg-cyan-300"
                : "bg-white/10 text-white/50"
              }`}
          >
            確認して続ける
          </button>

          <button className="w-full rounded-2xl border border-white/15 py-3 text-sm text-white/70 hover:text-white">
            キャンセル
          </button>

          <p className="text-center text-[11px] leading-5 text-white/50">
            法律により、未成年者のアクセスは固く禁じられています。虚偽の申告は法的な問題に発展する可能性があります。
          </p>
        </div>
      </div>
    </div>
  );
}

