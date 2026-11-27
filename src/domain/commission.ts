export type CommissionType = "CASH" | "PERCENT";

export interface CommissionTerms {
  clickCommission: number;
  clickCommissionType: CommissionType;
  saleCommission: number;
  saleCommissionType: CommissionType;
  productPrice: number;
}

/** Amount (TRY) a single billable click earns the partner. */
export function clickEarning(t: Pick<CommissionTerms, "clickCommission" | "clickCommissionType" | "productPrice">): number {
  const raw = t.clickCommissionType === "CASH" ? t.clickCommission : (t.productPrice * t.clickCommission) / 100;
  return Math.round(raw * 100) / 100;
}

/** Amount a sale earns the partner (for display; sale tracking is a store-API follow-up). */
export function saleEarning(t: Pick<CommissionTerms, "saleCommission" | "saleCommissionType" | "productPrice">): number {
  const raw = t.saleCommissionType === "CASH" ? t.saleCommission : (t.productPrice * t.saleCommission) / 100;
  return Math.round(raw * 100) / 100;
}

export function describeCommission(value: number, type: CommissionType): string {
  if (!value) return "–";
  return type === "PERCENT" ? `%${value}` : `₺${value}`;
}
