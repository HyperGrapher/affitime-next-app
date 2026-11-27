import { TRPCError } from "@trpc/server";
import type { Db } from "@/server/db";
import type { Payment, Prisma } from "@/generated/prisma/client";
import { getPaymentProvider, type CallbackPayload } from "@/providers/payment";
import { campaignPrice, planTotal, withInstallments, type PaidPlan } from "@/domain/pricing";
import { computeValidity } from "@/domain/plan";
import { transitionLink } from "@/domain/link-status";
import { skipTake, toPage } from "@/lib/pagination";
import { randomRef } from "@/lib/crypto";
import { addDays } from "@/lib/dates";
import { formatMoney, round2, toNumber } from "@/lib/money";
import { routes } from "@/lib/routes";
import { notify } from "@/features/notifications/service";
import { sendTemplatedEmail } from "@/server/services/email";
import type { TaxInfoInput } from "./schemas";

interface VendorCtx { id: string; brand: string }

async function vendorBuyer(db: Db, vendorId: string) {
  const v = await db.vendor.findUnique({ where: { id: vendorId }, include: { user: true, taxInfo: true } });
  if (!v) throw new TRPCError({ code: "NOT_FOUND" });
  return v;
}

export async function getTaxInfo(db: Db, vendorId: string) {
  return db.taxInfo.findUnique({ where: { vendorId } });
}

export async function saveTaxInfo(db: Db, vendorId: string, input: TaxInfoInput) {
  const data = { ...input, title: input.title || null, tckn: input.tckn || null, vkn: input.vkn || null, taxOffice: input.taxOffice || null, city: input.city || null };
  return db.taxInfo.upsert({ where: { vendorId }, create: { ...data, vendorId }, update: data });
}

async function createCheckout(db: Db, data: Prisma.PaymentUncheckedCreateInput, buyer: { name: string; email: string; phone?: string | null; address?: string | null }, chargeAmount: number) {
  const provider = getPaymentProvider();
  const payment = await db.payment.create({ data });
  const session = await provider.createCheckout({ ref: payment.ref, kind: payment.kind, chargeAmount, installments: payment.installments, description: payment.description, buyer });
  await db.payment.update({ where: { id: payment.id }, data: { providerData: { ...session.providerData, provider: provider.name } } });
  return { ref: payment.ref, checkoutUrl: session.checkoutUrl };
}

export async function startPlanCheckout(db: Db, vendor: VendorCtx, input: { plan: PaidPlan; annual: boolean; installments: number }) {
  const v = await vendorBuyer(db, vendor.id);
  if (!v.taxInfo) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "TAX_INFO_REQUIRED" });
  const amount = planTotal(input.plan, input.annual);
  const { total } = withInstallments(amount, input.installments);
  const buyerName = `${v.taxInfo.firstName} ${v.taxInfo.lastName}`;
  return createCheckout(
    db,
    {
      ref: randomRef("PL"), kind: "PLAN", vendorId: v.id, amount, paidAmount: total, installments: input.installments,
      description: `${input.annual ? "Yıllık" : "Aylık"} ${input.plan} plan`, plan: input.plan, annual: input.annual,
      buyerName, buyerPhone: v.phone, buyerAddress: v.taxInfo.address,
    },
    { name: buyerName, email: v.user.email, phone: v.phone, address: v.taxInfo.address },
    total,
  );
}

export async function startCampaignCheckout(db: Db, vendor: VendorCtx, input: { productId: string; days: number; installments: number }, now = new Date()) {
  const v = await vendorBuyer(db, vendor.id);
  if (!v.taxInfo) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "TAX_INFO_REQUIRED" });
  const product = await db.product.findFirst({ where: { id: input.productId, vendorId: vendor.id, status: "ACTIVE" }, select: { id: true, title: true } });
  if (!product) throw new TRPCError({ code: "NOT_FOUND" });
  const running = await db.campaign.findFirst({ where: { productId: product.id, status: "ACTIVE", endsAt: { gt: now } } });
  if (running) throw new TRPCError({ code: "CONFLICT", message: "Bu ürün için aktif bir kampanya zaten var" });
  const amount = campaignPrice(input.days);
  const { total } = withInstallments(amount, input.installments);
  const buyerName = `${v.taxInfo.firstName} ${v.taxInfo.lastName}`;
  return createCheckout(
    db,
    {
      ref: randomRef("MP"), kind: "CAMPAIGN", vendorId: v.id, amount, paidAmount: total, installments: input.installments,
      description: `Pazaryeri kampanyası: ${product.title} (${input.days} gün)`, productId: product.id, campaignDays: input.days,
      buyerName, buyerPhone: v.phone, buyerAddress: v.taxInfo.address,
    },
    { name: buyerName, email: v.user.email, phone: v.phone, address: v.taxInfo.address },
    total,
  );
}

/** Vendor pays a partner's unpaid, billable commissions. Visits are reserved atomically so they can never be paid twice. */
export async function startPayout(db: Db, vendor: VendorCtx, partnerId: string) {
  const v = await vendorBuyer(db, vendor.id);
  const partner = await db.partner.findUnique({ where: { id: partnerId }, include: { user: true } });
  if (!partner) throw new TRPCError({ code: "NOT_FOUND" });
  const hasLink = await db.link.findFirst({ where: { vendorId: vendor.id, partnerId }, select: { id: true } });
  if (!hasLink) throw new TRPCError({ code: "FORBIDDEN" });
  if (!partner.iban || !partner.ibanHolder) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "PARTNER_IBAN_MISSING" });

  const ref = randomRef("PO");
  const payment = await db.$transaction(async (tx) => {
    const unpaid = await tx.visit.aggregate({ where: { vendorId: vendor.id, partnerId, billable: true, payoutId: null }, _sum: { commission: true }, _count: { _all: true } });
    const amount = toNumber(unpaid._sum.commission);
    if (amount <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "NOTHING_TO_PAY" });
    const created = await tx.payment.create({
      data: {
        ref, kind: "PAYOUT", vendorId: vendor.id, partnerId, amount, paidAmount: amount, installments: 1,
        description: `${partner.username} komisyon ödemesi`, ibanHolder: partner.ibanHolder, iban: partner.iban,
        buyerName: v.brand, buyerPhone: v.phone,
      },
    });
    await tx.visit.updateMany({ where: { vendorId: vendor.id, partnerId, billable: true, payoutId: null }, data: { payoutId: created.id } });
    return created;
  });
  const session = await getPaymentProvider().createCheckout({ ref: payment.ref, kind: "PAYOUT", chargeAmount: toNumber(payment.amount), installments: 1, description: payment.description, buyer: { name: v.brand, email: v.user.email, phone: v.phone } });
  await db.payment.update({ where: { id: payment.id }, data: { providerData: { ...session.providerData, provider: getPaymentProvider().name } } });
  return { ref: payment.ref, checkoutUrl: session.checkoutUrl };
}

/**
 * Provider callback. Idempotent: only a PENDING payment can transition, guarded by a conditional update,
 * so replays / concurrent deliveries are no-ops.
 */
export async function applyCallback(db: Db, cb: CallbackPayload, now = new Date()): Promise<"applied" | "ignored"> {
  const existing = await db.payment.findUnique({ where: { ref: cb.ref }, include: { vendor: { include: { user: true } }, partner: { include: { user: true } }, product: { select: { title: true } } } });
  if (!existing || existing.status !== "PENDING") return "ignored";

  const succeeded = cb.status === "success";
  // Amount integrity: the signed total must match what we expect to charge.
  if (succeeded && round2(cb.totalAmount) !== round2(toNumber(existing.paidAmount ?? existing.amount))) {
    await db.payment.updateMany({ where: { id: existing.id, status: "PENDING" }, data: { status: "FAILED", failureCode: "AMOUNT_MISMATCH", failureReason: "Tutar uyuşmazlığı", completedAt: now } });
    await releasePayoutVisits(db, existing);
    return "applied";
  }

  const claimed = await db.payment.updateMany({
    where: { id: existing.id, status: "PENDING" },
    data: {
      status: succeeded ? "SUCCEEDED" : "FAILED", completedAt: now, testMode: cb.testMode,
      cardBrand: cb.cardBrand ?? null, installments: cb.installments ?? existing.installments,
      failureCode: succeeded ? null : (cb.failureCode ?? "FAILED"), failureReason: succeeded ? null : (cb.failureReason ?? "Ödeme başarısız"),
    },
  });
  if (claimed.count === 0) return "ignored";

  if (!succeeded) {
    await releasePayoutVisits(db, existing);
    return "applied";
  }
  await fulfil(db, existing, now);
  return "applied";
}

type PaymentWithRels = Payment & {
  vendor: { id: string; brand: string; planValidTill: Date | null; user: { id: string; email: string } };
  partner: { id: string; username: string; user: { id: string; email: string } } | null;
  product: { title: string } | null;
};

async function releasePayoutVisits(db: Db, p: Payment) {
  if (p.kind === "PAYOUT") await db.visit.updateMany({ where: { payoutId: p.id }, data: { payoutId: null } });
}

async function fulfil(db: Db, p: PaymentWithRels, now: Date) {
  const amountText = formatMoney(toNumber(p.paidAmount ?? p.amount));
  if (p.kind === "PLAN" && p.plan) {
    const { validFrom, validTill } = computeValidity(p.vendor.planValidTill, !!p.annual, now);
    await db.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: p.id }, data: { validFrom, validTill } });
      await tx.vendor.update({ where: { id: p.vendorId }, data: { plan: p.plan!, planValidTill: validTill } });
      // links suspended by an ended plan come back
      const suspended = await tx.link.findMany({ where: { vendorId: p.vendorId, status: "PRODUCT_NOT_ACTIVE" }, select: { id: true, suspendedFrom: true } });
      for (const l of suspended) {
        const t = transitionLink("PRODUCT_NOT_ACTIVE", "RESTORE_PLAN", "SYSTEM");
        if (t.ok) await tx.link.update({ where: { id: l.id }, data: { status: l.suspendedFrom ?? t.to, suspendedFrom: null } });
      }
      await notify(tx, p.vendor.user.id, "PLAN_ACTIVATED", { plan: p.plan!, validTill: validTill.toISOString() }, routes.vendor.dashboard);
    });
  } else if (p.kind === "CAMPAIGN" && p.productId && p.campaignDays) {
    await db.campaign.create({ data: { productId: p.productId, vendorId: p.vendorId, paymentId: p.id, days: p.campaignDays, startsAt: now, endsAt: addDays(now, p.campaignDays) } });
    await notify(db, p.vendor.user.id, "CAMPAIGN_STARTED", { product: p.product?.title ?? "", days: p.campaignDays }, routes.vendor.products);
  } else if (p.kind === "PAYOUT" && p.partner) {
    await notify(db, p.partner.user.id, "PAYOUT_RECEIVED", { brand: p.vendor.brand, amount: amountText }, routes.partner.payments);
    await notify(db, p.vendor.user.id, "PAYOUT_SENT", { partner: p.partner.username, amount: amountText }, routes.vendor.payments);
    await sendTemplatedEmail("PAYOUT_RECEIVED", p.partner.user.email, { partner: p.partner.username, brand: p.vendor.brand, amount: amountText, url: routes.partner.payments }, p.partner.username);
  }
  if (p.kind !== "PAYOUT") await sendTemplatedEmail("PAYMENT_RECEIPT", p.vendor.user.email, { name: p.buyerName, description: p.description, amount: amountText }, p.buyerName);
}

const paymentSelect = {
  id: true, ref: true, kind: true, status: true, amount: true, paidAmount: true, installments: true, cardBrand: true, description: true,
  failureCode: true, failureReason: true, createdAt: true, completedAt: true, validFrom: true, validTill: true, plan: true, annual: true, testMode: true,
  vendor: { select: { id: true, brand: true } }, partner: { select: { id: true, username: true } },
} satisfies Prisma.PaymentSelect;

type PaymentRow = Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>;
export const mapPayment = (p: PaymentRow) => ({ ...p, amount: toNumber(p.amount), paidAmount: toNumber(p.paidAmount ?? p.amount) });
export type PaymentDTO = ReturnType<typeof mapPayment>;

export async function listPayments(db: Db, where: Prisma.PaymentWhereInput, input: { kind?: Payment["kind"]; status?: Payment["status"]; page: number; pageSize: number }) {
  const w: Prisma.PaymentWhereInput = { ...where, ...(input.kind ? { kind: input.kind } : {}), ...(input.status ? { status: input.status } : {}) };
  const [rows, total] = await Promise.all([
    db.payment.findMany({ where: w, select: paymentSelect, orderBy: { createdAt: "desc" }, ...skipTake(input) }),
    db.payment.count({ where: w }),
  ]);
  return toPage(rows.map(mapPayment), total, input);
}

export async function getPaymentForCheckout(db: Db, ref: string, vendorId: string) {
  const p = await db.payment.findFirst({ where: { ref, vendorId }, select: { ...paymentSelect, iban: true, ibanHolder: true } });
  return p ? { ...mapPayment(p), iban: p.iban, ibanHolder: p.ibanHolder } : null;
}

/** Vendor view: unpaid billable commissions grouped per partner (single SQL group-by, no row loading). */
export async function unpaidByPartner(db: Db, vendorId: string) {
  const groups = await db.visit.groupBy({ by: ["partnerId"], where: { vendorId, billable: true, payoutId: null }, _sum: { commission: true }, _count: { _all: true } });
  const partners = await db.partner.findMany({ where: { id: { in: groups.map((g) => g.partnerId) } }, select: { id: true, username: true, avatar: true, iban: true } });
  const byId = new Map(partners.map((p) => [p.id, p]));
  return groups
    .map((g) => ({ partnerId: g.partnerId, username: byId.get(g.partnerId)?.username ?? "–", avatar: byId.get(g.partnerId)?.avatar ?? null, hasIban: !!byId.get(g.partnerId)?.iban, clicks: g._count._all, amount: toNumber(g._sum.commission) }))
    .filter((g) => g.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/** Partner view: what each vendor still owes. */
export async function awaitingForPartner(db: Db, partnerId: string) {
  const groups = await db.visit.groupBy({ by: ["vendorId"], where: { partnerId, billable: true, payoutId: null }, _sum: { commission: true }, _count: { _all: true } });
  const vendors = await db.vendor.findMany({ where: { id: { in: groups.map((g) => g.vendorId) } }, select: { id: true, brand: true, logo: true } });
  const byId = new Map(vendors.map((v) => [v.id, v]));
  return groups
    .map((g) => ({ vendorId: g.vendorId, brand: byId.get(g.vendorId)?.brand ?? "–", logo: byId.get(g.vendorId)?.logo ?? null, clicks: g._count._all, amount: toNumber(g._sum.commission) }))
    .filter((g) => g.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}
