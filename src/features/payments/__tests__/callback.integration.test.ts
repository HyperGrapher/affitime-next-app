// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { env } from "@/env";
import { getPlanStatus } from "@/domain/plan";
import { SimulatedPaymentProvider, signCallback } from "@/providers/payment/simulated";
import { applyCallback, saveTaxInfo, startPayout, startPlanCheckout } from "../service";
import { runDailyJob } from "@/features/dashboard/cron";

/**
 * Integration tests against a real Postgres. Refuses to run against a remote database so a stray
 * DATABASE_URL (e.g. Neon) can never be written to by the test suite.
 */
const local = /localhost|127\.0\.0\.1/.test(env.DATABASE_URL);
const suite = local || process.env.ALLOW_REMOTE_DB_TESTS === "yes" ? describe : describe.skip;

const provider = new SimulatedPaymentProvider();
const tag = `t${Date.now()}`;
let vendor: { id: string; brand: string; userId: string };

function form(ref: string, status: "success" | "failed", total: string, hash = signCallback(ref, status, total)) {
  return { merchant_oid: ref, status, total_amount: total, hash, payment_type: "card", installment_count: "1", test_mode: "1" };
}

suite("payments callback & cron (integration)", () => {
  beforeAll(async () => {
    const user = await db.user.create({ data: { name: tag, email: `${tag}@test.local`, role: "VENDOR", emailVerified: true } });
    const v = await db.vendor.create({ data: { userId: user.id, brand: `Brand ${tag}`, website: `https://${tag}.example.com`, trialEndsAt: new Date(Date.now() - 86_400_000) } });
    vendor = { id: v.id, brand: v.brand, userId: user.id };
    await saveTaxInfo(db, v.id, { firstName: "Test", lastName: "Vendor", vkn: "1234567890", address: "Test mahallesi test sokak 1" });
  });

  afterAll(async () => {
    await db.user.deleteMany({ where: { email: { startsWith: tag } } });
    await db.$disconnect();
  });

  it("rejects callbacks with an invalid signature", () => {
    expect(provider.parseCallback(form("PLX", "success", "10.00", "forged"))).toBeNull();
  });

  it("activates a plan once and ignores replays (idempotent)", async () => {
    const { ref } = await startPlanCheckout(db, vendor, { plan: "PRO", annual: false, installments: 1 });
    const cb = provider.parseCallback(form(ref, "success", "2090.00"));
    expect(cb).not.toBeNull();

    expect(await applyCallback(db, cb!)).toBe("applied");
    const afterFirst = await db.vendor.findUniqueOrThrow({ where: { id: vendor.id } });
    expect(getPlanStatus(afterFirst).state).toBe("PLAN");
    const firstValidTill = afterFirst.planValidTill!;

    expect(await applyCallback(db, cb!)).toBe("ignored"); // replay
    const afterReplay = await db.vendor.findUniqueOrThrow({ where: { id: vendor.id } });
    expect(afterReplay.planValidTill).toEqual(firstValidTill); // not extended twice

    expect(await db.sentEmail.count({ where: { to: `${tag}@test.local`, kind: "PAYMENT_RECEIPT" } })).toBe(1);
  });

  it("rejects an amount that does not match what was charged", async () => {
    const { ref } = await startPlanCheckout(db, vendor, { plan: "BASIC", annual: false, installments: 1 });
    await applyCallback(db, provider.parseCallback(form(ref, "success", "1.00"))!);
    const p = await db.payment.findUniqueOrThrow({ where: { ref } });
    expect(p.status).toBe("FAILED");
    expect(p.failureCode).toBe("AMOUNT_MISMATCH");
  });

  it("records failure reasons without activating anything", async () => {
    const before = await db.vendor.findUniqueOrThrow({ where: { id: vendor.id } });
    const { ref } = await startPlanCheckout(db, vendor, { plan: "ULTIMATE", annual: false, installments: 1 });
    await applyCallback(db, provider.parseCallback({ ...form(ref, "failed", "2890.00"), failed_reason_code: "CARD_DECLINED", failed_reason_msg: "Kart işlem onayı vermedi" })!);
    const p = await db.payment.findUniqueOrThrow({ where: { ref } });
    expect(p).toMatchObject({ status: "FAILED", failureCode: "CARD_DECLINED" });
    expect((await db.vendor.findUniqueOrThrow({ where: { id: vendor.id } })).plan).toBe(before.plan);
  });

  it("reserves visits for a payout and releases them when the payout fails", async () => {
    const partnerUser = await db.user.create({ data: { name: `${tag}p`, email: `${tag}p@test.local`, role: "PARTNER", emailVerified: true } });
    const partner = await db.partner.create({ data: { userId: partnerUser.id, username: `${tag}p`, ibanHolder: "TEST P", iban: "TR330006100519786457841326" } });
    const cat = await db.category.upsert({ where: { slug: "test-cat" }, create: { name: "Test cat", slug: "test-cat" }, update: {} });
    const product = await db.product.create({ data: { vendorId: vendor.id, categoryId: cat.id, title: "P", summary: "summary long enough", productUrl: "https://x.example.com", price: 100 } });
    const link = await db.link.create({ data: { code: `${tag}lnk`.slice(0, 12), productId: product.id, partnerId: partner.id, vendorId: vendor.id, status: "CONFIRMED", cookieDays: 30, clickCommission: 2, clickCommissionType: "CASH", saleCommission: 0, saleCommissionType: "CASH", productPrice: 100 } });
    await db.visit.createMany({ data: [1, 2, 3].map((i) => ({ linkId: link.id, vendorId: vendor.id, partnerId: partner.id, productId: product.id, ipHash: `h${i}`, billable: true, commission: 2 })) });

    const { ref } = await startPayout(db, vendor, partner.id);
    expect(await db.visit.count({ where: { partnerId: partner.id, payoutId: { not: null } } })).toBe(3); // reserved
    await expect(startPayout(db, vendor, partner.id)).rejects.toThrow("NOTHING_TO_PAY"); // cannot be double-booked

    await applyCallback(db, provider.parseCallback(form(ref, "failed", "6.00"))!);
    expect(await db.visit.count({ where: { partnerId: partner.id, payoutId: null } })).toBe(3); // released

    const second = await startPayout(db, vendor, partner.id);
    await applyCallback(db, provider.parseCallback(form(second.ref, "success", "6.00"))!);
    expect((await db.payment.findUniqueOrThrow({ where: { ref: second.ref } })).status).toBe("SUCCEEDED");
    expect(await db.notification.count({ where: { userId: partnerUser.id, type: "PAYOUT_RECEIVED" } })).toBe(1);
  });

  it("daily job is idempotent: queues and sends each e-mail once, suspends links", async () => {
    // expire the plan we just bought
    await db.vendor.update({ where: { id: vendor.id }, data: { planValidTill: new Date(Date.now() - 1000) } });
    const first = await runDailyJob(db);
    expect(first.queued).toBeGreaterThanOrEqual(1);
    const second = await runDailyJob(db);
    expect(second.queued).toBe(0);
    expect(second.sent).toBe(0);
    expect(await db.emailQueue.count({ where: { userId: vendor.userId, kind: "PLAN_ENDED" } })).toBe(1);
    expect(await db.link.count({ where: { vendorId: vendor.id, status: "PRODUCT_NOT_ACTIVE" } })).toBe(1);
  });
});
