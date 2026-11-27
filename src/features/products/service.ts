import { TRPCError } from "@trpc/server";
import type { Db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { skipTake, toPage } from "@/lib/pagination";
import { toNumber } from "@/lib/money";
import { slugify } from "@/features/catalog/service";
import { PLAN_FEATURES } from "@/domain/pricing";
import { transitionLink } from "@/domain/link-status";
import { notify } from "@/features/notifications/service";
import { routes } from "@/lib/routes";
import type { PlanStatus } from "@/domain/plan";
import type { ProductInput, ProductListInput } from "./schemas";

const productSelect = {
  id: true, title: true, summary: true, image: true, price: true, cookieDays: true, productUrl: true,
  clickCommission: true, clickCommissionType: true, saleCommission: true, saleCommissionType: true,
  status: true, createdAt: true, vendorId: true,
  category: { select: { id: true, name: true } },
  tags: { select: { tag: { select: { name: true } } } },
  vendor: { select: { id: true, brand: true, logo: true } },
  campaigns: { where: { status: "ACTIVE", endsAt: { gt: new Date(0) } }, select: { endsAt: true } },
  _count: { select: { links: true } },
} satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

export function mapProduct(p: ProductRow, now = new Date()) {
  const campaign = p.campaigns.find((c) => c.endsAt > now);
  return {
    id: p.id,
    title: p.title,
    summary: p.summary,
    image: p.image,
    productUrl: p.productUrl,
    price: toNumber(p.price),
    cookieDays: p.cookieDays,
    clickCommission: toNumber(p.clickCommission),
    clickCommissionType: p.clickCommissionType,
    saleCommission: toNumber(p.saleCommission),
    saleCommissionType: p.saleCommissionType,
    status: p.status,
    createdAt: p.createdAt,
    category: p.category,
    tags: p.tags.map((t) => t.tag.name),
    vendor: p.vendor,
    linkCount: p._count.links,
    featuredUntil: campaign?.endsAt ?? null,
  };
}
export type ProductDTO = ReturnType<typeof mapProduct>;

function orderBy(sort: ProductListInput["sort"]): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc": return [{ price: "asc" }];
    case "price_desc": return [{ price: "desc" }];
    case "commission": return [{ clickCommission: "desc" }, { saleCommission: "desc" }];
    default: return [{ createdAt: "desc" }];
  }
}

function searchWhere(q?: string): Prisma.ProductWhereInput {
  return q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }, { vendor: { brand: { contains: q, mode: "insensitive" } } }] } : {};
}

/** Vendor: own products only. */
export async function listVendorProducts(db: Db, vendorId: string, input: ProductListInput) {
  const where: Prisma.ProductWhereInput = {
    vendorId,
    ...(input.status ? { status: input.status } : {}),
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...searchWhere(input.q),
  };
  const [rows, total] = await Promise.all([
    db.product.findMany({ where, select: productSelect, orderBy: orderBy(input.sort), ...skipTake(input) }),
    db.product.count({ where }),
  ]);
  return toPage(rows.map((r) => mapProduct(r)), total, input);
}

/** Partner/public marketplace: active products of vendors whose plan is active; featured (paid campaign) first on page 1 sort "new". */
export async function browseProducts(db: Db, input: ProductListInput, now = new Date()) {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    vendor: { OR: [{ planValidTill: { gt: now } }, { planValidTill: null, trialEndsAt: { gt: now } }] },
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...searchWhere(input.q),
  };
  const [rows, total] = await Promise.all([
    db.product.findMany({ where, select: { ...productSelect, campaigns: { where: { status: "ACTIVE", endsAt: { gt: now } }, select: { endsAt: true } } }, orderBy: orderBy(input.sort), ...skipTake(input) }),
    db.product.count({ where }),
  ]);
  const items = rows.map((r) => mapProduct(r, now));
  if (input.sort === "new") items.sort((a, b) => Number(!!b.featuredUntil) - Number(!!a.featuredUntil));
  return toPage(items, total, input);
}

export async function getPublicProduct(db: Db, id: string, now = new Date()) {
  const p = await db.product.findFirst({
    where: { id, status: "ACTIVE" },
    select: { ...productSelect, description: true, campaigns: { where: { status: "ACTIVE", endsAt: { gt: now } }, select: { endsAt: true } } },
  });
  return p ? { ...mapProduct(p, now), description: p.description } : null;
}

export async function getVendorProduct(db: Db, vendorId: string, id: string) {
  const p = await db.product.findFirst({ where: { id, vendorId }, select: { ...productSelect, description: true, categoryId: true } });
  if (!p) throw new TRPCError({ code: "NOT_FOUND" });
  return { ...mapProduct(p), description: p.description, categoryId: p.categoryId };
}

function productLimit(plan: PlanStatus): number | null {
  if (plan.state === "PLAN") return PLAN_FEATURES[plan.plan === "TRIAL" ? "BASIC" : plan.plan].products;
  return PLAN_FEATURES.PRO.products; // trial gets Pro limits
}

async function upsertTags(db: Db, names: string[]) {
  const ids: number[] = [];
  for (const name of new Set(names.map((n) => n.trim()).filter(Boolean))) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await db.tag.upsert({ where: { slug }, create: { name, slug }, update: {} });
    ids.push(tag.id);
  }
  return ids;
}

export async function createProduct(db: Db, vendor: { id: string; plan: PlanStatus }, input: ProductInput) {
  const limit = productLimit(vendor.plan);
  if (limit !== null) {
    const count = await db.product.count({ where: { vendorId: vendor.id, status: "ACTIVE" } });
    if (count >= limit) throw new TRPCError({ code: "FORBIDDEN", message: "PRODUCT_LIMIT" });
  }
  const category = await db.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new TRPCError({ code: "BAD_REQUEST", message: "Geçersiz kategori" });
  const tagIds = await upsertTags(db, input.tags);
  const { tags: _tags, categoryId, image, description, ...rest } = input;
  void _tags;
  const product = await db.product.create({
    data: {
      ...rest,
      image: image || null,
      description: description || null,
      vendor: { connect: { id: vendor.id } },
      category: { connect: { id: categoryId } },
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    select: { id: true },
  });
  return product;
}

export async function updateProduct(db: Db, vendorId: string, id: string, input: ProductInput) {
  const existing = await db.product.findFirst({ where: { id, vendorId }, select: { id: true, status: true } });
  if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
  if (existing.status === "ARCHIVED") throw new TRPCError({ code: "BAD_REQUEST", message: "Arşivlenmiş ürün düzenlenemez" });
  const tagIds = await upsertTags(db, input.tags);
  const { tags: _tags, categoryId, image, description, ...rest } = input;
  void _tags;
  await db.$transaction([
    db.productTag.deleteMany({ where: { productId: id } }),
    db.product.update({
      where: { id },
      data: { ...rest, image: image || null, description: description || null, categoryId, tags: { create: tagIds.map((tagId) => ({ tagId })) } },
    }),
  ]);
  // Terms on existing links are a snapshot taken at request time – edits only affect new link requests.
  return { id };
}

/** Archive: product disappears from the marketplace and every live link moves to PRODUCT_ARCHIVED, partners are notified. */
export async function archiveProduct(db: Db, vendorId: string, id: string) {
  const product = await db.product.findFirst({ where: { id, vendorId }, select: { id: true, title: true } });
  if (!product) throw new TRPCError({ code: "NOT_FOUND" });
  await db.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    const links = await tx.link.findMany({ where: { productId: id }, select: { id: true, status: true, partner: { select: { userId: true } } } });
    for (const link of links) {
      const t = transitionLink(link.status, "ARCHIVE_PRODUCT", "VENDOR");
      if (!t.ok) continue;
      await tx.link.update({ where: { id: link.id }, data: { status: t.to, suspendedFrom: null } });
      await notify(tx, link.partner.userId, "PRODUCT_ARCHIVED", { product: product.title, linkId: link.id }, routes.partner.link(link.id));
    }
  });
  return { id };
}
