"use client";

import { useState } from "react";

const options = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" }
];

export default function VelvetProAgeCheckPage() {
  const [selected, setSelected] = useState("yes");
  const [agree, setAgree] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040404] bg-[radial-gradient(circle_at_top,#101010,transparent)] px-4 py-16 text-white">
      <div className="w-full max-w-md rounded-[32px] border border-yellow-500/40 bg-[#0c0c10]/95 p-8 shadow-[0_0_80px_rgba(255,214,0,0.15)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-yellow-400 text-yellow-300">
          ⚠️
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold text-yellow-300">Age Verification</h1>
          <p className="mt-2 text-sm text-white/70">
            This content is intended for individuals 18 years of age or older.
          </p>
        </div>

        <section className="mt-6 space-y-4">
          <p className="text-sm font-semibold text-white">Are you 18 years of age or older?</p>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm ${selected === option.id ? "border-yellow-400 bg-black/40" : "border-white/15"
                }`}
            >
              <span>{option.label}</span>
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border ${selected === option.id ? "border-yellow-400" : "border-white/30"
                  }`}
              >
                {selected === option.id && <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />}
              </span>
            </button>
          ))}
        </section>

        <label className="mt-5 flex items-start gap-3 text-xs text-white/70">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/40 text-yellow-400 focus:ring-yellow-400"
          />
          <span>
            I agree to the <a className="text-yellow-300" href="#">Terms of Service</a> and{" "}
            <a className="text-yellow-300" href="#">Privacy Policy</a>.
          </span>
        </label>

        <div className="mt-6 space-y-3">
          <button
            disabled={!agree || selected !== "yes"}
            className={`w-full rounded-2xl py-3 text-sm font-semibold ${agree && selected === "yes"
                ? "bg-yellow-400 text-black"
                : "bg-white/10 text-white/40"
              }`}
          >
            Confirm & Continue
          </button>
          <button className="w-full rounded-2xl border border-white/20 py-3 text-sm text-white/70">
            Cancel
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/50">
          By entering this site, you are certifying that you are of legal age in your country.
          Misrepresenting your age may have legal consequences.
        </p>
      </div>
    </div>
  );
}

