"use client";

import { useState } from "react";

const radioOptions = [
  { id: "yes", label: "はい" },
  { id: "no", label: "いいえ" }
];

export default function AgeCheckPage() {
  const [selected, setSelected] = useState<string>("yes");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-[#050d13] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-[32px] border border-teal-900/40 bg-gradient-to-b from-[#0c1f1e] to-[#071112] px-8 py-10 shadow-[0_50px_140px_rgba(0,0,0,0.55)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-teal-400/50 bg-teal-500/10 text-teal-200">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M12 2L2 19h20L12 2z"
                strokeLinejoin="round"
              />
              <path d="M12 9v5" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
          </div>
          <h1 className="mt-6 text-center text-2xl font-semibold">年齢確認</h1>
          <p className="mt-2 text-center text-sm text-white/70">このコンテンツは18歳以上のみが視聴できます</p>

          <section className="mt-8 space-y-4">
            <p className="text-sm font-semibold">あなたは18歳以上ですか？</p>
            {radioOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected(option.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${selected === option.id
                    ? "border-teal-400 bg-teal-500/10"
                    : "border-white/10 bg-white/5"
                  }`}
              >
                <span>{option.label}</span>
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full border ${selected === option.id ? "border-teal-300" : "border-white/30"
                    }`}
                >
                  {selected === option.id && <span className="h-2 w-2 rounded-full bg-teal-300" />}
                </span>
              </button>
            ))}

            <label className="mt-3 flex items-start gap-3 text-xs text-white/70">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-teal-400 focus:ring-0"
              />
              <span>利用規約に同意し、私が18歳以上であることを確認します。</span>
            </label>
          </section>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              disabled={!agreed || selected !== "yes"}
              className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${agreed && selected === "yes"
                  ? "bg-teal-400 text-[#031112] hover:bg-teal-300"
                  : "bg-white/10 text-white/50"
                }`}
            >
              確認して続ける
            </button>
            <button className="w-full rounded-2xl border border-white/15 py-3 text-sm text-white/70 hover:text-white">
              キャンセル
            </button>
          </div>

          <p className="mt-6 text-center text-[11px] leading-5 text-white/50">
            このウェブサイトには成人向けコンテンツが含まれており、お住まいの地域で法的に成人年齢に達している方のみがアクセスできます。年齢を偽ってアクセスした場合、法的な責任を問われる可能性があります。
          </p>
        </div>
      </div>
    </div>
  );
}

