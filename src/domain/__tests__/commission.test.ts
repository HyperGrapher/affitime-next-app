import { describe, expect, it } from "vitest";
import { clickEarning, describeCommission, saleEarning } from "../commission";

describe("commission calculation", () => {
  it("returns the fixed amount for CASH commissions", () => {
    expect(clickEarning({ clickCommission: 1.5, clickCommissionType: "CASH", productPrice: 999 })).toBe(1.5);
  });

  it("derives percent commissions from the product price", () => {
    expect(clickEarning({ clickCommission: 2.5, clickCommissionType: "PERCENT", productPrice: 18999 })).toBe(474.98);
    expect(saleEarning({ saleCommission: 8, saleCommissionType: "PERCENT", productPrice: 2499 })).toBe(199.92);
  });

  it("rounds to kuruş and never goes negative for zero input", () => {
    expect(clickEarning({ clickCommission: 0, clickCommissionType: "PERCENT", productPrice: 100 })).toBe(0);
    expect(clickEarning({ clickCommission: 1 / 3, clickCommissionType: "CASH", productPrice: 1 })).toBe(0.33);
  });

  it("describes commissions for display", () => {
    expect(describeCommission(8, "PERCENT")).toBe("%8");
    expect(describeCommission(1.5, "CASH")).toBe("₺1.5");
    expect(describeCommission(0, "CASH")).toBe("–");
  });
});
