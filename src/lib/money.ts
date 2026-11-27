// Single money formatter. All amounts are TRY, stored as Decimal(12,2) and handled as numbers in the app layer.
const fmt = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });
const fmtInt = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("tr-TR");

export function formatMoney(value: number | null | undefined, opts?: { compact?: boolean }): string {
  const v = value ?? 0;
  return opts?.compact && Number.isInteger(v) ? fmtInt.format(v) : fmt.format(v);
}

export function formatNumber(value: number | null | undefined): string {
  return num.format(value ?? 0);
}

/** Prisma Decimal | number | string | null → number (rounded to 2 dp). */
export function toNumber(value: { toString(): string } | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Math.round(n * 100) / 100;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
