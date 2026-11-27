import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router, staffProcedure } from "@/server/trpc/init";
import { pageInput, skipTake, toPage } from "@/lib/pagination";
import { getPlanStatus } from "@/domain/plan";
import { toNumber } from "@/lib/money";
import type { Prisma } from "@/generated/prisma/client";
import { archiveProduct } from "@/features/products/service";

export const adminRouter = router({
  users: staffProcedure.input(pageInput.extend({ role: z.enum(["VENDOR", "PARTNER", "ADMIN", "MODERATOR"]).optional() })).query(async ({ ctx, input }) => {
    const where: Prisma.UserWhereInput = { ...(input.role ? { role: input.role } : {}), ...(input.q ? { OR: [{ email: { contains: input.q, mode: "insensitive" } }, { name: { contains: input.q, mode: "insensitive" } }] } : {}) };
    const [rows, total] = await Promise.all([
      ctx.db.user.findMany({ where, orderBy: { createdAt: "desc" }, include: { vendor: { select: { plan: true, trialEndsAt: true, planValidTill: true } }, partner: { select: { username: true } } }, ...skipTake(input) }),
      ctx.db.user.count({ where }),
    ]);
    return toPage(rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active, emailVerified: u.emailVerified, createdAt: u.createdAt, plan: u.vendor ? getPlanStatus(u.vendor) : null })), total, input);
  }),
  setUserActive: adminProcedure.input(z.object({ id: z.string(), active: z.boolean() })).mutation(async ({ ctx, input }) => {
    const target = await ctx.db.user.findUnique({ where: { id: input.id }, select: { role: true } });
    if (!target) throw new TRPCError({ code: "NOT_FOUND" });
    if (input.id === ctx.viewer.userId || target.role === "ADMIN") throw new TRPCError({ code: "FORBIDDEN", message: "Yönetici hesapları buradan devre dışı bırakılamaz" });
    await ctx.db.user.update({ where: { id: input.id }, data: { active: input.active } });
    if (!input.active) await ctx.db.session.deleteMany({ where: { userId: input.id } });
  }),
  products: staffProcedure.input(pageInput).query(async ({ ctx, input }) => {
    const where: Prisma.ProductWhereInput = input.q ? { OR: [{ title: { contains: input.q, mode: "insensitive" } }, { vendor: { brand: { contains: input.q, mode: "insensitive" } } }] } : {};
    const [rows, total] = await Promise.all([
      ctx.db.product.findMany({ where, orderBy: { createdAt: "desc" }, include: { vendor: { select: { brand: true } }, category: { select: { name: true } }, _count: { select: { links: true } } }, ...skipTake(input) }),
      ctx.db.product.count({ where }),
    ]);
    return toPage(rows.map((p) => ({ id: p.id, title: p.title, brand: p.vendor.brand, category: p.category.name, status: p.status, price: toNumber(p.price), links: p._count.links, createdAt: p.createdAt, vendorId: p.vendorId })), total, input);
  }),
  archiveProduct: staffProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const p = await ctx.db.product.findUnique({ where: { id: input.id }, select: { vendorId: true } });
    if (!p) throw new TRPCError({ code: "NOT_FOUND" });
    return archiveProduct(ctx.db, p.vendorId, input.id);
  }),
  outbox: adminProcedure.input(pageInput).query(async ({ ctx, input }) => {
    const where: Prisma.SentEmailWhereInput = input.q ? { OR: [{ to: { contains: input.q, mode: "insensitive" } }, { subject: { contains: input.q, mode: "insensitive" } }] } : {};
    const [items, total] = await Promise.all([
      ctx.db.sentEmail.findMany({ where, orderBy: { createdAt: "desc" }, select: { id: true, kind: true, to: true, toName: true, subject: true, createdAt: true }, ...skipTake(input) }),
      ctx.db.sentEmail.count({ where }),
    ]);
    return toPage(items, total, input);
  }),
  outboxItem: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const m = await ctx.db.sentEmail.findUnique({ where: { id: input.id } });
    if (!m) throw new TRPCError({ code: "NOT_FOUND" });
    return m;
  }),
});
