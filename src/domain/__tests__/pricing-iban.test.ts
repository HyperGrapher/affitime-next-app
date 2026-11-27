import { describe, expect, it } from "vitest";
import { isValidTrIban, formatIban, maskIban } from "../iban";
import { campaignPrice, planTotal, withInstallments, PRICING_ANNUAL, PRICING_MONTHLY } from "../pricing";

describe("pricing", () => {
  it("keeps the legacy price points", () => {
    expect(PRICING_MONTHLY).toEqual({ BASIC: 1590, PRO: 2090, ULTIMATE: 2890 });
    expect(PRICING_ANNUAL).toEqual({ BASIC: 1290, PRO: 1590, ULTIMATE: 2090 });
  });
  it("bills annual plans as 12 × the annual monthly price", () => {
    expect(planTotal("PRO", true)).toBe(19080);
    expect(planTotal("PRO", false)).toBe(2090);
  });
  it("adds the instalment surcharge", () => {
    expect(withInstallments(1000, 1)).toEqual({ total: 1000, monthly: 1000, rate: 0 });
    expect(withInstallments(1000, 3)).toEqual({ total: 1059, monthly: 353, rate: 5.9 });
    expect(() => withInstallments(1000, 5)).toThrow();
  });
  it("prices campaigns per week", () => {
    expect(campaignPrice(7)).toBe(1000);
    expect(campaignPrice(14)).toBe(2000);
  });
});

describe("IBAN", () => {
  const valid = "TR330006100519786457841326"; // standard TR test IBAN
  it("validates the mod-97 checksum", () => {
    expect(isValidTrIban(valid)).toBe(true);
    expect(isValidTrIban(formatIban(valid))).toBe(true);
    expect(isValidTrIban("TR330006100519786457841327")).toBe(false);
    expect(isValidTrIban("DE89370400440532013000")).toBe(false);
  });
  it("formats and masks", () => {
    expect(formatIban(valid)).toBe("TR33 0006 1005 1978 6457 8413 26");
    expect(maskIban(valid)).toBe("TR33 •••• •••• •••• 1326");
    expect(maskIban(null)).toBe("–");
  });
});
