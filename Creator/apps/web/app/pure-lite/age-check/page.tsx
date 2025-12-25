"use client";

import { useState } from "react";

const options = [
  { id: "yes", label: "Yes, I am 18 or older" },
  { id: "no", label: "No, I am under 18" }
];

export default function PureLiteAgeCheckPage() {
  const [selected, setSelected] = useState("yes");
  const [agree, setAgree] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#8b8d94] px-4 py-12 text-[#1f1f22]">
      <div className="w-full max-w-md rounded-[32px] border border-black/10 bg-white/95 p-8 shadow-[0_50px_150px_rgba(0,0,0,0.25)] backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ede5ff] text-2xl text-[#7c5dfa]">
          ⚠️
        </div>
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-semibold">Age Verification</h1>
          <p className="mt-2 text-sm text-[#7f7f8f]">
            This platform contains content suitable only for users 18 and older.
          </p>
        </div>

        <section className="mt-6 space-y-4">
          <p className="text-sm font-semibold">Are you 18 years of age or older?</p>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm ${selected === option.id ? "border-[#7c5dfa] bg-[#f5f0ff]" : "border-black/10"
                }`}
            >
              <span>{option.label}</span>
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border ${selected === option.id ? "border-[#7c5dfa]" : "border-[#c1c1cb]"
                  }`}
              >
                {selected === option.id && <span className="h-3 w-3 rounded-full bg-[#7c5dfa]" />}
              </span>
            </button>
          ))}
        </section>

        <label className="mt-5 flex items-start gap-3 text-xs text-[#6f6f7a]">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#c0c0c9] text-[#7c5dfa] focus:ring-[#7c5dfa]"
          />
          <span>
            I agree to the <a className="text-[#7c5dfa]" href="#">Terms of Service</a> and{" "}
            <a className="text-[#7c5dfa]" href="#">Privacy Policy</a>.
          </span>
        </label>

        <div className="mt-6 space-y-3">
          <button
            disabled={!agree || selected !== "yes"}
            className={`w-full rounded-2xl py-3 text-sm font-semibold text-white ${agree && selected === "yes"
                ? "bg-[#7c5dfa] hover:bg-[#6a4ee9]"
                : "bg-[#dcdce5] text-[#9c9caf]"
              }`}
          >
            Confirm & Continue
          </button>
          <button className="w-full rounded-2xl border border-[#c7c7d4] py-3 text-sm font-semibold text-[#6d6d78]">
            Cancel
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#8c8c99]">
          By entering, you confirm that you are of legal age and that you are not violating any local
          laws. Providing false information may result in account termination.
        </p>
      </div>
    </div>
  );
}

