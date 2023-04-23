import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type Context } from "./context";
import { UserRoles } from "../../interface/auth.interface";

// import sendpulse from "sendpulse-api";

// const API_USER_ID = "227943d8a153c1713d3fd8c7d97b1e63";
// const API_SECRET = "cd11fe04653031b9f60787f61170ecf6";
// const TOKEN_STORAGE = "/tmp/";

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE,function(e: any) {
//   console.log('<<<<<<<<<   Sendpulse init OK   >>>>>>>>>>');
  
  
// });


const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.session.role !== UserRoles.ADMIN) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const isVendor = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.session.role !== UserRoles.VENDOR || !ctx.session.vendorId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user, vendorId: ctx.session.vendorId },
    },
  });
});

const isPartner = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.session.role !== UserRoles.PARTNER || !ctx.session.partnerId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user, partnerId: ctx.session.partnerId },
    },
  });
});

/**
 * Protected procedures
 **/
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
export const vendorProcedure = t.procedure.use(isVendor);
export const partnerProcedure = t.procedure.use(isPartner);
