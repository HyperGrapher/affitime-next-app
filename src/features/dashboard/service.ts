import type { Db } from "@/server/db";
import { getPlanStatus } from "@/domain/plan";
import { toNumber } from "@/lib/money";
import { addDays } from "@/lib/dates";
import { linkCounts } from "@/features/links/service";
import { topCountries, visitSeries, visitTotals, type VisitScope } from "@/features/visits/stats";
import { awaitingForPartner, unpaidByPartner } from "@/features/payments/service";

async function topProducts(db: Db, scope: VisitScope, since: Date, limit = 5) {
  const where = { ...("vendorId" in scope ? { vendorId: scope.vendorId } : {}), ...("partnerId" in scope ? { partnerId: scope.partnerId } : {}), createdAt: { gte: since }, flag: null };
  const groups = await db.visit.groupBy({ by: ["productId"], where, _count: { _all: true }, _sum: { commission: true }, orderBy: { _count: { productId: "desc" } }, take: limit });
  const products = await db.product.findMany({ where: { id: { in: groups.map((g) => g.productId) } }, select: { id: true, title: true, image: true } });
  const byId = new Map(products.map((p) => [p.id, p]));
  return groups.map((g) => ({ productId: g.productId, title: byId.get(g.productId)?.title ?? "–", image: byId.get(g.productId)?.image ?? null, clicks: g._count._all, earnings: toNumber(g._sum.commission) }));
}

export async function vendorDashboard(db: Db, vendorId: string, now = new Date()) {
  const since = addDays(now, -29);
  const [vendor, series, totals, countries, links, products, unpaid, productCount, partners] = await Promise.all([
    db.vendor.findUniqueOrThrow({ where: { id: vendorId } }),
    visitSeries(db, { vendorId }, 30, now),
    visitTotals(db, { vendorId }),
    topCountries(db, { vendorId }),
    linkCounts(db, { vendorId }),
    topProducts(db, { vendorId }, since),
    unpaidByPartner(db, vendorId),
    db.product.count({ where: { vendorId, status: "ACTIVE" } }),
    db.link.groupBy({ by: ["partnerId"], where: { vendorId, status: "CONFIRMED" } }),
  ]);
  return { plan: getPlanStatus(vendor, now), series, totals, countries, links, topProducts: products, unpaid, productCount, activePartners: partners.length };
}

export async function partnerDashboard(db: Db, partnerId: string, now = new Date()) {
  const since = addDays(now, -29);
  const [series, totals, countries, links, products, awaiting, topLinks] = await Promise.all([
    visitSeries(db, { partnerId }, 30, now),
    visitTotals(db, { partnerId }),
    topCountries(db, { partnerId }),
    linkCounts(db, { partnerId }),
    topProducts(db, { partnerId }, since),
    awaitingForPartner(db, partnerId),
    db.visit.groupBy({ by: ["linkId"], where: { partnerId, createdAt: { gte: since }, flag: null }, _count: { _all: true }, orderBy: { _count: { linkId: "desc" } }, take: 5 }),
  ]);
  const linkRows = await db.link.findMany({ where: { id: { in: topLinks.map((l) => l.linkId) } }, select: { id: true, code: true, product: { select: { title: true } } } });
  const byId = new Map(linkRows.map((l) => [l.id, l]));
  return {
    series, totals, countries, links, topProducts: products, awaiting,
    awaitingTotal: awaiting.reduce((a, b) => a + b.amount, 0),
    topLinks: topLinks.map((l) => ({ linkId: l.linkId, code: byId.get(l.linkId)?.code ?? "", title: byId.get(l.linkId)?.product.title ?? "–", clicks: l._count._all })),
  };
}

export async function adminDashboard(db: Db, now = new Date()) {
  const [series, totals, users, vendors, products, links, payments, unhandled, emails] = await Promise.all([
    visitSeries(db, { all: true }, 30, now),
    visitTotals(db, { all: true }),
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
    db.vendor.findMany({ select: { plan: true, trialEndsAt: true, planValidTill: true } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.link.groupBy({ by: ["status"], _count: { _all: true } }),
    db.payment.groupBy({ by: ["kind", "status"], _count: { _all: true }, _sum: { amount: true } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.sentEmail.count(),
  ]);
  const planStates = { TRIAL: 0, PLAN: 0, TRIAL_ENDED: 0, PLAN_ENDED: 0 };
  for (const v of vendors) planStates[getPlanStatus(v, now).state]++;
  return {
    series, totals, products, unhandled, emails, planStates,
    users: Object.fromEntries(users.map((u) => [u.role, u._count._all])) as Record<string, number>,
    links: Object.fromEntries(links.map((l) => [l.status, l._count._all])) as Record<string, number>,
    revenue: payments.filter((p) => p.status === "SUCCEEDED" && p.kind !== "PAYOUT").reduce((a, p) => a + toNumber(p._sum.amount), 0),
    payoutVolume: payments.filter((p) => p.status === "SUCCEEDED" && p.kind === "PAYOUT").reduce((a, p) => a + toNumber(p._sum.amount), 0),
    failedPayments: payments.filter((p) => p.status === "FAILED").reduce((a, p) => a + p._count._all, 0),
  };
}
