import { createClient } from "@/lib/supabase/server";
import { updateLoanSettings } from "./actions";

export const metadata = {
  title: "Loan Calculator Settings",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  invalid: "Please check the values — rate 0.1–15%, down payment 0–90%, tenure 1–50.",
  order: "Tenure must satisfy: minimum ≤ default ≤ maximum.",
  failed: "Could not save the settings. Try again.",
};

export default async function LoanSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;

  const supabase = await createClient();
  const { data: s } = await supabase
    .from("loan_settings")
    .select(
      "default_interest_rate, default_down_payment, default_tenure, minimum_tenure, maximum_tenure"
    )
    .eq("id", true)
    .single();

  const inputClass =
    "w-full rounded-md border border-sand bg-white px-3.5 py-2.5 text-ink focus:border-gold";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl text-ink">Loan Calculator</h1>
      <div className="thread-divider mt-3 w-24" />
      <p className="mt-4 text-sm text-stone">
        These defaults appear when someone opens the public loan calculator.
        Visitors can still adjust every value themselves.
      </p>

      {ok && (
        <p className="mt-6 rounded-md border border-gold/40 bg-champagne/50 px-3.5 py-2.5 text-sm text-ink">
          Settings saved. The public calculator updates within a few minutes.
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="mt-6 rounded-md border border-hibiscus/30 bg-hibiscus/5 px-3.5 py-2.5 text-sm text-hibiscus-deep">
          {ERRORS[error]}
        </p>
      )}

      <form action={updateLoanSettings} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="rate" className={labelClass}>
              Default interest rate (% p.a.)
            </label>
            <input id="rate" name="rate" type="number" step="0.05" min="0.1" max="15" required defaultValue={Number(s?.default_interest_rate ?? 4.2)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="down" className={labelClass}>
              Default down payment (%)
            </label>
            <input id="down" name="down" type="number" step="1" min="0" max="90" required defaultValue={Number(s?.default_down_payment ?? 10)} className={inputClass} />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="tenure_min" className={labelClass}>
              Minimum tenure
            </label>
            <input id="tenure_min" name="tenure_min" type="number" min="1" max="50" required defaultValue={s?.minimum_tenure ?? 5} className={inputClass} />
          </div>
          <div>
            <label htmlFor="tenure_default" className={labelClass}>
              Default tenure
            </label>
            <input id="tenure_default" name="tenure_default" type="number" min="1" max="50" required defaultValue={s?.default_tenure ?? 30} className={inputClass} />
          </div>
          <div>
            <label htmlFor="tenure_max" className={labelClass}>
              Maximum tenure
            </label>
            <input id="tenure_max" name="tenure_max" type="number" min="1" max="50" required defaultValue={s?.maximum_tenure ?? 40} className={inputClass} />
          </div>
        </div>

        <button type="submit" className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
          Save Settings
        </button>
      </form>
    </div>
  );
}
