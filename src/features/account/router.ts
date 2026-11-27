import { TRPCError } from "@trpc/server";
import { authedProcedure, partnerProcedure, publicProcedure, router, vendorProcedure } from "@/server/trpc/init";
import { ibanInput, onboardingInput, partnerProfileInput, registerInput, vendorProfileInput } from "./schemas";
import { getPartnerSettings, getStoreApi, getVendorSettings, register, rotateStoreApiKey, saveOnboarding, savePartnerIban, skipOnboarding, updatePartnerProfile, updateVendorProfile } from "./service";
import { unreadCount } from "@/features/notifications/service";

export const accountRouter = router({
  register: publicProcedure.input(registerInput).mutation(({ ctx, input }) => register(ctx.db, ctx.headers, input)),

  /** Lightweight shell data (sidebar badge etc.). */
  me: authedProcedure.query(async ({ ctx }) => ({ ...ctx.viewer, unread: await unreadCount(ctx.db, ctx.viewer.userId) })),

  vendorSettings: vendorProcedure.query(({ ctx }) => getVendorSettings(ctx.db, ctx.vendor.id)),
  updateVendor: vendorProcedure.input(vendorProfileInput).mutation(({ ctx, input }) => updateVendorProfile(ctx.db, ctx.vendor.id, input)),

  partnerSettings: partnerProcedure.query(({ ctx }) => getPartnerSettings(ctx.db, ctx.partner.id)),
  updatePartner: partnerProcedure.input(partnerProfileInput).mutation(({ ctx, input }) => updatePartnerProfile(ctx.db, ctx.partner.id, input)),
  saveIban: partnerProcedure.input(ibanInput).mutation(({ ctx, input }) => savePartnerIban(ctx.db, ctx.partner.id, input)),
  saveOnboarding: partnerProcedure.input(onboardingInput).mutation(({ ctx, input }) => saveOnboarding(ctx.db, ctx.partner.id, input)),
  skipOnboarding: partnerProcedure.mutation(({ ctx }) => skipOnboarding(ctx.db, ctx.partner.id)),

  storeApi: vendorProcedure.query(({ ctx }) => getStoreApi(ctx.db, ctx.vendor.id)),
  rotateStoreApiKey: vendorProcedure.mutation(({ ctx }) => {
    if (!ctx.vendor) throw new TRPCError({ code: "FORBIDDEN" });
    return rotateStoreApiKey(ctx.db, ctx.vendor.id);
  }),
});
