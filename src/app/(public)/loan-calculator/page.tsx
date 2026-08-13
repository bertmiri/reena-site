import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { Calculator } from "./calculator";

export const metadata: Metadata = {
  title: "Home Loan Calculator",
  description:
    "Estimate your monthly home loan repayment in Malaysia — property price, down payment, interest rate and tenure.",
};

export const revalidate = 300;

export default async function LoanCalculatorPage() {
  // Public config read. RLS locks this table to the authenticated admin, so
  // the server fetches defaults with the service client — read-only, no user input.
  const admin = createAdminClient();
  const { data: settings } = await admin
    .from("loan_settings")
    .select(
      "default_interest_rate, default_down_payment, default_tenure, minimum_tenure, maximum_tenure"
    )
    .eq("id", true)
    .single();

  const defaults = {
    rate: Number(settings?.default_interest_rate ?? 4.2),
    downPct: Number(settings?.default_down_payment ?? 10),
    tenure: settings?.default_tenure ?? 30,
    minTenure: settings?.minimum_tenure ?? 5,
    maxTenure: settings?.maximum_tenure ?? 40,
  };

  return (
    <main className="min-h-dvh bg-paper px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <h1 className="font-display text-3xl text-ink">Home Loan Calculator</h1>
          <p className="mt-2 text-sm text-stone">
            Estimate your monthly repayment for a Malaysian home loan.
          </p>
        </header>

        <Calculator defaults={defaults} />

        <p className="mt-8 text-center text-xs leading-relaxed text-stone">
          These calculations are estimates only. Actual rates, fees and loan
          approval depend on the financial institution and the applicant&apos;s
          circumstances.
        </p>
      </div>
    </main>
  );
}
