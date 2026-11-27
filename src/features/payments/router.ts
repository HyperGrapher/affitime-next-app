import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { activeVendorProcedure, adminProcedure, partnerProcedure, router, vendorProcedure } from "@/server/trpc/init";
import { INSTALLMENT_RATES, PLAN_ORDER, PRICING_ANNUAL, PRICING_MONTHLY } from "@/domain/pricing";
import { pageInput } from "@/lib/pagination";
import { awaitingForPartner, getPaymentForCheckout, getTaxInfo, listPayments, saveTaxInfo, startCampaignCheckout, startPayout, startPlanCheckout, unpaidByPartner } from "./service";
import { paymentListInput, startCampaignInput, startPayoutInput, startPlanInput, taxInfoInput } from "./schemas";

export const paymentsRouter = router({
  pricing: vendorProcedure.query(() => ({ monthly: PRICING_MONTHLY, annual: PRICING_ANNUAL, plans: PLAN_ORDER, installments: INSTALLMENT_RATES })),
  taxInfo: vendorProcedure.query(({ ctx }) => getTaxInfo(ctx.db, ctx.vendor.id)),
  saveTaxInfo: vendorProcedure.input(taxInfoInput).mutation(({ ctx, input }) => saveTaxInfo(ctx.db, ctx.vendor.id, input)),

  // Buying a plan must work while the plan is expired → plain vendorProcedure.
  startPlan: vendorProcedure.input(startPlanInput).mutation(({ ctx, input }) => startPlanCheckout(ctx.db, ctx.vendor, input)),
  startCampaign: activeVendorProcedure.input(startCampaignInput).mutation(({ ctx, input }) => startCampaignCheckout(ctx.db, ctx.vendor, input)),
  startPayout: activeVendorProcedure.input(startPayoutInput).mutation(({ ctx, input }) => startPayout(ctx.db, ctx.vendor, input.partnerId)),

  vendorHistory: vendorProcedure.input(paymentListInput).query(({ ctx, input }) => listPayments(ctx.db, { vendorId: ctx.vendor.id }, input)),
  vendorUnpaid: vendorProcedure.query(({ ctx }) => unpaidByPartner(ctx.db, ctx.vendor.id)),
  byRef: vendorProcedure.input(z.object({ ref: z.string() })).query(async ({ ctx, input }) => {
    const p = await getPaymentForCheckout(ctx.db, input.ref, ctx.vendor.id);
    if (!p) throw new TRPCError({ code: "NOT_FOUND" });
    return p;
  }),

  partnerHistory: partnerProcedure.input(pageInput).query(({ ctx, input }) => listPayments(ctx.db, { partnerId: ctx.partner.id, status: "SUCCEEDED" }, { ...input })),
  partnerAwaiting: partnerProcedure.query(({ ctx }) => awaitingForPartner(ctx.db, ctx.partner.id)),

  adminList: adminProcedure.input(paymentListInput).query(({ ctx, input }) => listPayments(ctx.db, {}, input)),
});
