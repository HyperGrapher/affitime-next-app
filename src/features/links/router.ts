import { z } from "zod";
import { authedProcedure, partnerProcedure, router, vendorProcedure, staffProcedure } from "@/server/trpc/init";
import { actOnLink, findPartnerLinkForProduct, getLinkDetail, linkCounts, listLinks, requestLink } from "./service";
import { linkActionInput, linkListInput } from "./schemas";
import type { LinkActor } from "@/domain/link-status";
import { TRPCError } from "@trpc/server";

export const linksRouter = router({
  listMine: authedProcedure.input(linkListInput).query(({ ctx, input }) => {
    const { viewer } = ctx;
    if (viewer.role === "VENDOR" && viewer.vendor) return listLinks(ctx.db, { vendorId: viewer.vendor.id }, input);
    if (viewer.role === "PARTNER" && viewer.partner) return listLinks(ctx.db, { partnerId: viewer.partner.id }, input);
    throw new TRPCError({ code: "FORBIDDEN" });
  }),
  counts: authedProcedure.query(({ ctx }) => {
    const { viewer } = ctx;
    if (viewer.role === "VENDOR" && viewer.vendor) return linkCounts(ctx.db, { vendorId: viewer.vendor.id });
    if (viewer.role === "PARTNER" && viewer.partner) return linkCounts(ctx.db, { partnerId: viewer.partner.id });
    throw new TRPCError({ code: "FORBIDDEN" });
  }),
  detail: authedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    const { viewer } = ctx;
    if (viewer.role === "VENDOR" && viewer.vendor) return getLinkDetail(ctx.db, { vendorId: viewer.vendor.id }, input.id, "VENDOR");
    if (viewer.role === "PARTNER" && viewer.partner) return getLinkDetail(ctx.db, { partnerId: viewer.partner.id }, input.id, "PARTNER");
    if (viewer.role === "ADMIN" || viewer.role === "MODERATOR") return getLinkDetail(ctx.db, {}, input.id, "ADMIN");
    throw new TRPCError({ code: "FORBIDDEN" });
  }),
  forProduct: partnerProcedure.input(z.object({ productId: z.string() })).query(({ ctx, input }) => findPartnerLinkForProduct(ctx.db, ctx.partner.id, input.productId)),
  request: partnerProcedure.input(z.object({ productId: z.string() })).mutation(({ ctx, input }) => requestLink(ctx.db, ctx.partner, input.productId)),
  /** Vendor decisions: approve / deny / pause / resume / cancel – only on own links. */
  vendorAct: vendorProcedure.input(linkActionInput).mutation(({ ctx, input }) => actOnLink(ctx.db, { vendorId: ctx.vendor.id }, "VENDOR", input.id, input.action)),
  /** Partner can only cancel own link. */
  partnerCancel: partnerProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => actOnLink(ctx.db, { partnerId: ctx.partner.id }, "PARTNER", input.id, "CANCEL")),
  adminAct: staffProcedure.input(z.object({ id: z.string(), action: z.enum(["PAUSE", "CANCEL"]) })).mutation(({ ctx, input }) => actOnLink(ctx.db, {}, "ADMIN" satisfies LinkActor, input.id, input.action)),
  adminList: staffProcedure.input(linkListInput).query(({ ctx, input }) => listLinks(ctx.db, {}, input)),
});
