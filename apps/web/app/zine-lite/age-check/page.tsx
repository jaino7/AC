"use client";

import { useState } from "react";

const options = [
  { id: "yes", label: "Yes, I am 18 or older" },
  { id: "no", label: "No, I am under 18" }
];

export default function ZineLiteAgeCheckPage() {
  const [selected, setSelected] = useState("yes");
  const [agree, setAgree] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-16 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/20 bg-[#111111] p-8 text-white">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400">
          🛡️
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold">Age Verification Required</h1>
          <p className="mt-2 text-sm text-white/70">
            This site contains age-restricted content. Please confirm you are 18 years of age or older to enter.
          </p>
        </div>

        <section className="mt-6 space-y-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm ${selected === option.id ? "border-green-400 bg-green-900" : "border-white/20"
                }`}
            >
              <span>{option.label}</span>
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border ${selected === option.id ? "border-green-300" : "border-white/40"
                  }`}
              >
                {selected === option.id && <span className="h-2.5 w-2.5 rounded-full bg-green-300" />}
              </span>
            </button>
          ))}
        </section>

        <label className="mt-5 flex items-start gap-3 text-xs text-white/70">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/40 text-green-400 focus:ring-green-400"
          />
          <span>
            I understand and agree to the terms regarding age-restricted content.
          </span>
        </label>

        <div className="mt-6 space-y-3">
          <button
            disabled={!agree || selected !== "yes"}
            className={`w-full rounded-2xl py-3 text-sm font-semibold ${agree && selected === "yes"
                ? "bg-green-500 text-black"
                : "bg-white/10 text-white/40"
              }`}
          >
            Confirm and Continue
          </button>
          <button className="w-full rounded-2xl border border-white/20 py-3 text-sm text-white/70">
            Cancel
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/50">
          By entering, you confirm that you are of legal age in your jurisdiction and consent to our terms.
          False declarations may result in legal consequences.
        </p>
      </div>
    </div>
  );
}

