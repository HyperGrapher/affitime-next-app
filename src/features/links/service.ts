import { TRPCError } from "@trpc/server";
import type { Db } from "@/server/db";
import type { LinkStatus, Prisma } from "@/generated/prisma/client";
import { transitionLink, availableActions, type LinkAction, type LinkActor } from "@/domain/link-status";
import { isPlanActive, getPlanStatus } from "@/domain/plan";
import { skipTake, toPage } from "@/lib/pagination";
import { randomCode } from "@/lib/crypto";
import { toNumber } from "@/lib/money";
import { routes } from "@/lib/routes";
import { notify } from "@/features/notifications/service";
import { sendTemplatedEmail } from "@/server/services/email";
import { visitSeries, visitTotals } from "@/features/visits/stats";
import type { LinkListInput } from "./schemas";

const GROUPS: Record<"pending" | "live" | "closed", LinkStatus[]> = {
  pending: ["AWAITING"],
  live: ["CONFIRMED", "PAUSED_BY_VENDOR", "PRODUCT_NOT_ACTIVE"],
  closed: ["REQUEST_DENIED", "CANCELED_BY_VENDOR", "CANCELED_BY_PARTNER", "CANCELED_BY_ADMIN", "PRODUCT_ARCHIVED"],
};

export type Scope = { vendorId: string } | { partnerId: string } | Record<string, never>;

const linkInclude = {
  product: { select: { id: true, title: true, image: true, category: { select: { name: true } } } },
  vendor: { select: { id: true, brand: true, logo: true } },
  partner: { select: { id: true, username: true, avatar: true } },
} satisfies Prisma.LinkInclude;

export async function listLinks(db: Db, scope: Scope, input: LinkListInput) {
  const where: Prisma.LinkWhereInput = {
    ...scope,
    ...(input.status ? { status: input.status } : input.group ? { status: { in: GROUPS[input.group] } } : {}),
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.q ? { OR: [{ product: { title: { contains: input.q, mode: "insensitive" } } }, { partner: { username: { contains: input.q, mode: "insensitive" } } }, { vendor: { brand: { contains: input.q, mode: "insensitive" } } }] } : {}),
  };
  const [rows, total] = await Promise.all([
    db.link.findMany({ where, include: linkInclude, orderBy: [{ createdAt: "desc" }], ...skipTake(input) }),
    db.link.count({ where }),
  ]);
  // One grouped query for click counts (no N+1, no loading every visit row).
  const ids = rows.map((r) => r.id);
  const stats = ids.length
    ? await db.visit.groupBy({ by: ["linkId"], where: { linkId: { in: ids } }, _count: { _all: true }, _sum: { commission: true } })
    : [];
  const billable = ids.length
    ? await db.visit.groupBy({ by: ["linkId"], where: { linkId: { in: ids }, billable: true, payoutId: null }, _sum: { commission: true } })
    : [];
  const clicks = new Map(stats.map((s) => [s.linkId, s._count._all]));
  const due = new Map(billable.map((s) => [s.linkId, toNumber(s._sum.commission)]));
  return toPage(
    rows.map((l) => ({
      id: l.id, code: l.code, status: l.status, createdAt: l.createdAt, product: l.product, vendor: l.vendor, partner: l.partner,
      clicks: clicks.get(l.id) ?? 0, due: due.get(l.id) ?? 0,
    })),
    total,
    input,
  );
}
export type LinkRow = Awaited<ReturnType<typeof listLinks>>["items"][number];

export async function linkCounts(db: Db, scope: Scope) {
  const rows = await db.link.groupBy({ by: ["status"], where: scope, _count: { _all: true } });
  const by = Object.fromEntries(rows.map((r) => [r.status, r._count._all])) as Partial<Record<LinkStatus, number>>;
  const sum = (keys: LinkStatus[]) => keys.reduce((a, k) => a + (by[k] ?? 0), 0);
  return { all: rows.reduce((a, r) => a + r._count._all, 0), pending: sum(GROUPS.pending), live: sum(GROUPS.live), closed: sum(GROUPS.closed) };
}

export async function getLinkDetail(db: Db, scope: Scope, id: string, actor: LinkActor) {
  const link = await db.link.findFirst({ where: { id, ...scope }, include: { ...linkInclude, product: { select: { id: true, title: true, image: true, productUrl: true, category: { select: { name: true } } } } } });
  if (!link) throw new TRPCError({ code: "NOT_FOUND" });
  const [totals, series, recent] = await Promise.all([
    visitTotals(db, { linkId: id }),
    visitSeries(db, { linkId: id }, 30),
    db.visit.findMany({ where: { linkId: id }, orderBy: { createdAt: "desc" }, take: 15, select: { id: true, createdAt: true, country: true, browser: true, os: true, referer: true, isUnique: true, flag: true, billable: true, commission: true, payoutId: true } }),
  ]);
  return {
    link: {
      id: link.id, code: link.code, status: link.status, createdAt: link.createdAt, cookieDays: link.cookieDays,
      clickCommission: toNumber(link.clickCommission), clickCommissionType: link.clickCommissionType,
      saleCommission: toNumber(link.saleCommission), saleCommissionType: link.saleCommissionType, productPrice: toNumber(link.productPrice),
      product: link.product, vendor: link.vendor, partner: link.partner,
    },
    totals,
    series,
    recent: recent.map((v) => ({ ...v, commission: toNumber(v.commission) })),
    actions: availableActions(link.status, actor),
  };
}

export async function requestLink(db: Db, partner: { id: string; username: string }, productId: string) {
  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
    include: { vendor: { include: { user: { select: { id: true, email: true } } } } },
  });
  if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Ürün bulunamadı" });
  if (!isPlanActive(getPlanStatus(product.vendor))) throw new TRPCError({ code: "BAD_REQUEST", message: "Bu markanın kampanyaları şu an kapalı" });

  const existing = await db.link.findUnique({ where: { productId_partnerId: { productId, partnerId: partner.id } }, select: { id: true } });
  if (existing) throw new TRPCError({ code: "CONFLICT", message: "Bu ürün için daha önce başvurdunuz", cause: { linkId: existing.id } });

  let link = null;
  for (let attempt = 0; attempt < 3 && !link; attempt++) {
    try {
      link = await db.link.create({
        data: {
          code: randomCode(6), productId, partnerId: partner.id, vendorId: product.vendorId, status: "AWAITING",
          cookieDays: product.cookieDays, clickCommission: product.clickCommission, clickCommissionType: product.clickCommissionType,
          saleCommission: product.saleCommission, saleCommissionType: product.saleCommissionType, productPrice: product.price,
        },
      });
    } catch (e) {
      if (!(e instanceof Error) || !/Unique constraint/i.test(e.message)) throw e;
      // code collision (or concurrent duplicate request) – retry, then verify below
      const dup = await db.link.findUnique({ where: { productId_partnerId: { productId, partnerId: partner.id } }, select: { id: true } });
      if (dup) throw new TRPCError({ code: "CONFLICT", message: "Bu ürün için daha önce başvurdunuz" });
    }
  }
  if (!link) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

  await notify(db, product.vendor.user.id, "LINK_REQUESTED", { partner: partner.username, product: product.title, linkId: link.id }, routes.vendor.link(link.id));
  await sendTemplatedEmail("LINK_REQUESTED", product.vendor.user.email, { brand: product.vendor.brand, partner: partner.username, product: product.title, url: routes.vendor.link(link.id) }, product.vendor.brand);
  return { id: link.id };
}

const NOTIFY_FOR: Partial<Record<LinkAction, "LINK_APPROVED" | "LINK_DENIED" | "LINK_PAUSED" | "LINK_RESUMED">> = {
  APPROVE: "LINK_APPROVED", DENY: "LINK_DENIED", PAUSE: "LINK_PAUSED", RESUME: "LINK_RESUMED",
};

/** Ownership-checked state-machine transition. `scope` restricts which links the actor can touch. */
export async function actOnLink(db: Db, scope: Scope, actor: LinkActor, id: string, action: LinkAction) {
  const link = await db.link.findFirst({
    where: { id, ...scope },
    include: {
      product: { select: { title: true } },
      vendor: { select: { brand: true, user: { select: { id: true, email: true } }, trialEndsAt: true, planValidTill: true, plan: true } },
      partner: { select: { username: true, user: { select: { id: true, email: true } } } },
    },
  });
  if (!link) throw new TRPCError({ code: "NOT_FOUND" });
  const t = transitionLink(link.status, action, actor);
  if (!t.ok) throw new TRPCError({ code: t.reason === "FORBIDDEN" ? "FORBIDDEN" : "BAD_REQUEST", message: t.reason });
  if ((action === "APPROVE" || action === "RESUME") && !isPlanActive(getPlanStatus(link.vendor)))
    throw new TRPCError({ code: "FORBIDDEN", message: "PLAN_REQUIRED" });

  // optimistic guard: only transition if status is still what we validated against (no double approvals)
  const res = await db.link.updateMany({ where: { id, status: link.status }, data: { status: t.to, suspendedFrom: null } });
  if (res.count === 0) throw new TRPCError({ code: "CONFLICT", message: "Link durumu değişti, sayfayı yenileyin" });

  const base = { product: link.product.title, brand: link.vendor.brand, partner: link.partner.username, linkId: id };
  const type = NOTIFY_FOR[action];
  if (type) {
    await notify(db, link.partner.user.id, type, base, routes.partner.link(id));
    if (action === "APPROVE" || action === "DENY")
      await sendTemplatedEmail(action === "APPROVE" ? "LINK_APPROVED" : "LINK_DENIED", link.partner.user.email, { ...base, url: routes.partner.link(id) }, link.partner.username);
  } else if (action === "CANCEL") {
    // notify the other side
    const recipient = actor === "PARTNER" ? link.vendor.user.id : link.partner.user.id;
    await notify(db, recipient, "LINK_CANCELED", { ...base, by: actor }, actor === "PARTNER" ? routes.vendor.link(id) : routes.partner.link(id));
  }
  return { id, status: t.to };
}

export async function findPartnerLinkForProduct(db: Db, partnerId: string, productId: string) {
  return db.link.findUnique({ where: { productId_partnerId: { productId, partnerId } }, select: { id: true, status: true } });
}
