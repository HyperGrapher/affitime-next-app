import type { PlanType } from "@/generated/prisma/client";

export type PlanStatus =
  | { state: "TRIAL"; endsAt: Date }
  | { state: "PLAN"; plan: PlanType; endsAt: Date }
  | { state: "TRIAL_ENDED"; endedAt: Date }
  | { state: "PLAN_ENDED"; plan: PlanType; endedAt: Date };

interface VendorPlanFields {
  plan: PlanType;
  trialEndsAt: Date;
  planValidTill: Date | null;
}

/** Single source of truth for "can this vendor currently use the product?". Pure: no DB flags to drift. */
export function getPlanStatus(v: VendorPlanFields, now = new Date()): PlanStatus {
  if (v.planValidTill) {
    return v.planValidTill > now
      ? { state: "PLAN", plan: v.plan, endsAt: v.planValidTill }
      : { state: "PLAN_ENDED", plan: v.plan, endedAt: v.planValidTill };
  }
  return v.trialEndsAt > now ? { state: "TRIAL", endsAt: v.trialEndsAt } : { state: "TRIAL_ENDED", endedAt: v.trialEndsAt };
}

export function isPlanActive(s: PlanStatus): boolean {
  return s.state === "TRIAL" || s.state === "PLAN";
}

/** Extends from the current validity when renewing early, otherwise from now. */
export function computeValidity(current: Date | null, annual: boolean, now = new Date()): { validFrom: Date; validTill: Date } {
  const validFrom = current && current > now ? current : now;
  const validTill = new Date(validFrom);
  validTill.setMonth(validTill.getMonth() + (annual ? 12 : 1));
  return { validFrom, validTill };
}
