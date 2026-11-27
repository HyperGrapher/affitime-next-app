import { describe, expect, it } from "vitest";
import { computeValidity, getPlanStatus, isPlanActive } from "../plan";

const now = new Date("2026-06-15T12:00:00Z");
const day = 86_400_000;

describe("plan status", () => {
  it("is TRIAL while the trial has not ended", () => {
    const s = getPlanStatus({ plan: "TRIAL", trialEndsAt: new Date(+now + 3 * day), planValidTill: null }, now);
    expect(s.state).toBe("TRIAL");
    expect(isPlanActive(s)).toBe(true);
  });

  it("is TRIAL_ENDED once the trial passed and nothing was bought", () => {
    const s = getPlanStatus({ plan: "TRIAL", trialEndsAt: new Date(+now - day), planValidTill: null }, now);
    expect(s.state).toBe("TRIAL_ENDED");
    expect(isPlanActive(s)).toBe(false);
  });

  it("is PLAN while planValidTill is in the future, even if the trial is over", () => {
    const s = getPlanStatus({ plan: "PRO", trialEndsAt: new Date(+now - 90 * day), planValidTill: new Date(+now + 10 * day) }, now);
    expect(s).toMatchObject({ state: "PLAN", plan: "PRO" });
  });

  it("is PLAN_ENDED when the paid plan expired", () => {
    const s = getPlanStatus({ plan: "BASIC", trialEndsAt: new Date(+now - 90 * day), planValidTill: new Date(+now - day) }, now);
    expect(s).toMatchObject({ state: "PLAN_ENDED", plan: "BASIC" });
    expect(isPlanActive(s)).toBe(false);
  });

  it("treats the exact end instant as ended", () => {
    expect(getPlanStatus({ plan: "TRIAL", trialEndsAt: now, planValidTill: null }, now).state).toBe("TRIAL_ENDED");
  });
});

describe("plan validity on purchase", () => {
  it("starts now and lasts one month for monthly plans", () => {
    const { validFrom, validTill } = computeValidity(null, false, now);
    expect(validFrom).toEqual(now);
    expect(validTill.toISOString()).toBe("2026-07-15T12:00:00.000Z");
  });

  it("lasts twelve months for annual plans", () => {
    expect(computeValidity(null, true, now).validTill.toISOString()).toBe("2027-06-15T12:00:00.000Z");
  });

  it("extends from the current validity when renewing early", () => {
    const current = new Date("2026-06-25T12:00:00Z");
    const { validFrom, validTill } = computeValidity(current, false, now);
    expect(validFrom).toEqual(current);
    expect(validTill.toISOString()).toBe("2026-07-25T12:00:00.000Z");
  });

  it("restarts from now when the previous plan already ended", () => {
    expect(computeValidity(new Date("2026-05-01T00:00:00Z"), false, now).validFrom).toEqual(now);
  });
});
