"use client";

import { useMemo, useState } from "react";
import { calculateLoan, formatRM, formatRMExact } from "@/lib/loan";

type Defaults = {
  rate: number;
  downPct: number;
  tenure: number;
  minTenure: number;
  maxTenure: number;
};

export function Calculator({ defaults }: { defaults: Defaults }) {
  const [price, setPrice] = useState(500000);
  const [downMode, setDownMode] = useState<"percent" | "rm">("percent");
  const [downValue, setDownValue] = useState(defaults.downPct);
  const [rate, setRate] = useState(defaults.rate);
  const [tenure, setTenure] = useState(defaults.tenure);

  const result = useMemo(
    () =>
      calculateLoan({
        propertyPrice: price,
        downPaymentValue: downValue,
        downPaymentMode: downMode,
        annualRatePct: rate,
        tenureYears: tenure,
      }),
    [price, downMode, downValue, rate, tenure]
  );

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink focus:border-gold";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";
  const modeBtn = (active: boolean) =>
    active
      ? "rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper"
      : "rounded-md border border-sand px-3 py-1.5 text-xs text-stone hover:border-gold";

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <section className="space-y-5 rounded-lg border border-sand bg-white/60 px-5 py-6">
        <div>
          <label htmlFor="price" className={labelClass}>
            Property price (RM)
          </label>
          <input id="price" type="number" min={0} step={10000} value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="down" className="text-sm font-medium text-ink">
              Down payment
            </label>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setDownMode("percent")} className={modeBtn(downMode === "percent")}>%</button>
              <button type="button" onClick={() => setDownMode("rm")} className={modeBtn(downMode === "rm")}>RM</button>
            </div>
          </div>
          <input id="down" type="number" min={0} step={downMode === "percent" ? 1 : 5000} value={downValue} onChange={(e) => setDownValue(Number(e.target.value))} className={inputClass} />
          <p className="mt-1 text-xs text-stone">= {formatRM(result.downPaymentRM)}</p>
        </div>

        <div>
          <label htmlFor="rate" className={labelClass}>
            Interest rate (% per year)
          </label>
          <input id="rate" type="number" min={0} max={15} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} className={inputClass} />
        </div>

        <div>
          <label htmlFor="tenure" className={labelClass}>
            Loan tenure: <span className="font-semibold">{tenure} years</span>
          </label>
          <input id="tenure" type="range" min={defaults.minTenure} max={defaults.maxTenure} step={1} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full accent-[#8c7030]" />
          <div className="flex justify-between text-xs text-stone">
            <span>{defaults.minTenure} yrs</span>
            <span>{defaults.maxTenure} yrs</span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gold/40 bg-champagne/30 px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-wide text-gold-deep">
          Estimated monthly payment
        </p>
        <p className="mt-2 font-display text-4xl text-ink">{formatRMExact(result.monthly)}</p>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-stone">Loan amount</dt>
            <dd className="font-medium text-ink">{formatRM(result.loanAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone">Down payment</dt>
            <dd className="font-medium text-ink">{formatRM(result.downPaymentRM)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone">Interest rate</dt>
            <dd className="font-medium text-ink">{rate}% p.a.</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-stone">Tenure</dt>
            <dd className="font-medium text-ink">{tenure} years</dd>
          </div>
          <div className="mt-2 border-t border-gold/30 pt-3">
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Total repayment</dt>
              <dd className="font-medium text-ink">{formatRM(result.totalRepayment)}</dd>
            </div>
            <div className="mt-2 flex justify-between gap-4">
              <dt className="text-stone">Estimated total interest</dt>
              <dd className="font-medium text-ink">{formatRM(result.totalInterest)}</dd>
            </div>
          </div>
        </dl>
      </section>
    </div>
  );
}
