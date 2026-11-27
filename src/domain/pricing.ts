// One pricing config. Numbers are monthly TRY prices (per month, billed monthly or annually).
export const PLAN_ORDER = ["BASIC", "PRO", "ULTIMATE"] as const;
export type PaidPlan = (typeof PLAN_ORDER)[number];

export const PRICING_MONTHLY: Record<PaidPlan, number> = { BASIC: 1590, PRO: 2090, ULTIMATE: 2890 };
export const PRICING_ANNUAL: Record<PaidPlan, number> = { BASIC: 1290, PRO: 1590, ULTIMATE: 2090 };

export const TRIAL_DAYS = 14;
export const TRIAL_WARNING_DAYS = 3;
export const PLAN_WARNING_DAYS = 7;

export const PLAN_FEATURES: Record<PaidPlan, { products: number | null; partners: number | null; support: "email" | "priority" | "dedicated" }> = {
  BASIC: { products: 10, partners: 50, support: "email" },
  PRO: { products: 50, partners: 500, support: "priority" },
  ULTIMATE: { products: null, partners: null, support: "dedicated" },
};

/** Surcharge (percent) for card instalments, PSP style. 1 = no instalment. */
export const INSTALLMENT_RATES: Record<number, number> = { 1: 0, 2: 3.9, 3: 5.9, 6: 11.5, 9: 17.5, 12: 23.5 };

export const CAMPAIGN_PRICE_PER_WEEK = 1000;
export const CAMPAIGN_DURATIONS = [7, 14, 30] as const;

export function planTotal(plan: PaidPlan, annual: boolean): number {
  return annual ? PRICING_ANNUAL[plan] * 12 : PRICING_MONTHLY[plan];
}

export function campaignPrice(days: number): number {
  return Math.round((days / 7) * CAMPAIGN_PRICE_PER_WEEK);
}

export function withInstallments(amount: number, installments: number): { total: number; monthly: number; rate: number } {
  const rate = INSTALLMENT_RATES[installments];
  if (rate === undefined) throw new Error(`Unsupported instalment count: ${installments}`);
  const total = Math.round(amount * (1 + rate / 100) * 100) / 100;
  return { total, monthly: Math.round((total / installments) * 100) / 100, rate };
}
