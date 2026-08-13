export type LoanInputs = {
  propertyPrice: number;
  downPaymentValue: number;
  downPaymentMode: "percent" | "rm";
  annualRatePct: number;
  tenureYears: number;
};

export type LoanResult = {
  downPaymentRM: number;
  loanAmount: number;
  monthly: number;
  totalRepayment: number;
  totalInterest: number;
};

/** Standard amortising loan: M = P·r(1+r)^n / ((1+r)^n − 1) */
export function calculateLoan(inputs: LoanInputs): LoanResult {
  const price = Math.max(0, inputs.propertyPrice);
  const downRM =
    inputs.downPaymentMode === "percent"
      ? (price * Math.min(100, Math.max(0, inputs.downPaymentValue))) / 100
      : Math.min(price, Math.max(0, inputs.downPaymentValue));
  const principal = Math.max(0, price - downRM);
  const n = Math.max(1, Math.round(inputs.tenureYears * 12));
  const r = Math.max(0, inputs.annualRatePct) / 100 / 12;

  let monthly: number;
  if (principal === 0) {
    monthly = 0;
  } else if (r === 0) {
    monthly = principal / n;
  } else {
    const growth = Math.pow(1 + r, n);
    monthly = (principal * r * growth) / (growth - 1);
  }

  const totalRepayment = monthly * n;
  return {
    downPaymentRM: downRM,
    loanAmount: principal,
    monthly,
    totalRepayment,
    totalInterest: Math.max(0, totalRepayment - principal),
  };
}

export function formatRM(value: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatRMExact(value: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
