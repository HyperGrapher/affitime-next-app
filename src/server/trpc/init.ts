import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/server/db";
import { loadViewer, type Viewer } from "@/server/session";
import { isPlanActive } from "@/domain/plan";

export interface TRPCContext {
  db: typeof db;
  viewer: Viewer | null;
  headers: Headers;
}

export async function createContext(headers: Headers): Promise<TRPCContext> {
  return { db, headers, viewer: await loadViewer(headers) };
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: { ...shape.data, zodError: error.cause instanceof ZodError ? error.cause.flatten() : null },
    };
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

const authed = t.middleware(({ ctx, next }) => {
  if (!ctx.viewer) throw new TRPCError({ code: "UNAUTHORIZED", message: "Oturum açmanız gerekiyor" });
  return next({ ctx: { ...ctx, viewer: ctx.viewer } });
});

/** Any signed-in, active user. */
export const authedProcedure = t.procedure.use(authed);

/** Verified vendor. `ctx.vendor` carries the id and plan status; ownership checks must still use ctx.vendor.id. */
export const vendorProcedure = authedProcedure.use(({ ctx, next }) => {
  if (ctx.viewer.role !== "VENDOR" || !ctx.viewer.vendor) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, vendor: ctx.viewer.vendor } });
});

/** Vendor whose trial or plan is active – for any write that creates value (products, approvals, payouts). */
export const activeVendorProcedure = vendorProcedure.use(({ ctx, next }) => {
  if (!isPlanActive(ctx.vendor.plan)) throw new TRPCError({ code: "FORBIDDEN", message: "PLAN_REQUIRED" });
  return next();
});

export const partnerProcedure = authedProcedure.use(({ ctx, next }) => {
  if (ctx.viewer.role !== "PARTNER" || !ctx.viewer.partner) throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, partner: ctx.viewer.partner } });
});

/** ADMIN + MODERATOR: read + moderation. */
export const staffProcedure = authedProcedure.use(({ ctx, next }) => {
  if (ctx.viewer.role !== "ADMIN" && ctx.viewer.role !== "MODERATOR") throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});

/** ADMIN only: outbox, payments, FAQ, user (de)activation. */
export const adminProcedure = authedProcedure.use(({ ctx, next }) => {
  if (ctx.viewer.role !== "ADMIN") throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});
