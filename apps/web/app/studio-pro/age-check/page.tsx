"use client";

import { useState } from "react";

const options = [
  { id: "yes", label: "はい、18歳以上です" },
  { id: "no", label: "いいえ、18歳未満です" }
];

export default function StudioProAgeCheckPage() {
  const [selected, setSelected] = useState("yes");
  const [agree, setAgree] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#5c616f] px-4 py-16 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#0e1626] p-8 shadow-[0_70px_160px_rgba(0,0,0,0.55)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1b2a44] text-xl text-[#4e92ff]">
          ⚠️
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold">年齢確認</h1>
          <p className="mt-2 text-sm text-white/70">
            法規制により、このコンテンツへのアクセスは18歳以上の方に限定されています。
          </p>
        </div>

        <section className="mt-6 space-y-4">
          <p className="text-sm font-semibold text-white">あなたは18歳以上ですか？</p>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm ${selected === option.id ? "border-[#2c6dff] bg-[#182542]" : "border-white/15"
                }`}
            >
              <span>{option.label}</span>
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border ${selected === option.id ? "border-[#2c6dff]" : "border-white/30"
                  }`}
              >
                {selected === option.id && <span className="h-2.5 w-2.5 rounded-full bg-[#2c6dff]" />}
              </span>
            </button>
          ))}
        </section>

        <label className="mt-5 flex items-start gap-3 text-xs text-white/70">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/30 text-[#2c6dff] focus:ring-[#2c6dff]"
          />
          <span>上記の内容に同意します</span>
        </label>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="rounded-full border border-white/20 px-6 py-2 text-sm text-white/70">
            キャンセル
          </button>
          <button
            className={`rounded-full px-6 py-2 text-sm font-semibold ${agree && selected === "yes"
                ? "bg-[#2c6dff] text-white"
                : "bg-white/10 text-white/40"
              }`}
            disabled={!agree || selected !== "yes"}
          >
            確認して続ける
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/50">
          虚偽の情報を提供することは、利用規約の違反となり、アカウントの停止につながる可能性があります。正確な情報を提供してください。
        </p>
      </div>
    </div>
  );
}

