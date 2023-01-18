import { TRPCError } from "@trpc/server";
import {
  router,
  protectedProcedure,
  partnerProcedure,
  vendorProcedure,
} from "../trpc";
import { z } from "zod";
import crypto from "crypto";
import { LinkStatus } from "@prisma/client";

export const linkRouter = router({
  // Used by both vendor and partner
  getLinkById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;
      const { role } = ctx.session;

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.link.findFirst({
        where: {
          id,
        },
        include: {
          product: true,
          vendor: role === "PARTNER",
          partner: role === "VENDOR",
        },
      });
    }),

  findLinkByProductIdForPartner: partnerProcedure
    .input(z.object({ pid: z.string() }))
    .query(({ ctx, input }) => {
      const { pid } = input;
      const { partnerId } = ctx.session;
      return ctx.prisma.link.findFirst({
        where: {
          product_id: pid,
          partner_id: partnerId,
        },
      });
    }),

  getAllLinksForPartner: partnerProcedure.query(({ ctx }) => {
    const { partnerId } = ctx.session;

    return ctx.prisma.link.findMany({
      where: {
        partner_id: partnerId,
        status: { not: LinkStatus.AWAITING },
      },
      include: { product: true, vendor: true },
    });
  }),

  getAllLinksForVendor: vendorProcedure.query(({ ctx }) => {
    const { vendorId } = ctx.session;

    return ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
        status: { not: LinkStatus.AWAITING },
      },
      include: { product: true, partner: true },
    });
  }),

  createLink: partnerProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { partnerId } = ctx.session;

      const { productId } = input;

      if (!productId)
        throw new TRPCError({ code: "NOT_FOUND", message: "PID not found" });

      try {
        const partner = await ctx.prisma.partner.findFirst({
          where: { id: partnerId },
        });

        if (!partner)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Partner not found",
          });

        const product = await ctx.prisma.product.findFirst({
          where: { id: productId },
          include: { vendor: true },
        });

        if (!product)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });

        const vendor = await ctx.prisma.vendor.findFirst({
          where: { id: product?.vendor_profile_id },
        });

        if (!vendor)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vendor not found",
          });

        const hasPrevLink = await ctx.prisma.link.findFirst({
          where: { partner_id: partnerId, product_id: productId },
        });

        if (hasPrevLink)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ürün için daha önce link oluşturulmuş!",
          });

        let randUrl = crypto.randomBytes(6).toString("base64url");

        const urlExists = await ctx.prisma.link.findFirst({
          where: { url: randUrl },
        });

        if (urlExists) randUrl = crypto.randomBytes(6).toString("base64url");

        const link = await ctx.prisma.link.create({
          data: {
            vendor_id: vendor.id,
            partner_id: partner.id,
            product_id: product.id,
            partner_user_id: partner.userId,
            vendor_user_id: vendor.userId,
            active: null,
            vendor_notified: false,
            partner_notified: false,
            url: randUrl,
            categoryId: product.categoryId,
            status: LinkStatus.AWAITING,
            price: product.price,
            perClick: product.perClick,
            perSale: product.perSale,
            perClickType: product.perClickType,
            perSaleType: product.perSaleType,
          },
        });

        if (!link)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Link cannot be created",
          });

        return link;
      } catch (error) {
        console.log(error);
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create link!",
        });
      }
    }),

  confirmOrDenyLinkRequest: vendorProcedure
    .input(
      z.object({
        id: z.string(),
        confirmed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, confirmed } = input;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });
      // https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-a-number-field
      try {
        await ctx.prisma.link.update({
          where: { id },
          data: {
            active: confirmed,
            vendor_notified: true,
            partner_notified: false,
            status: confirmed
              ? LinkStatus.CONFIRMED
              : LinkStatus.REQUEST_DENIED,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),

  // ! Not used yet
  updateLinkStatusByPartner: partnerProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isActive } = input;

      try {
        await ctx.prisma.link.update({
          where: { id },
          data: {
            active: isActive,
            status: LinkStatus.CANCELED_BY_PARTNER,
            vendor_notified: false,
            partner_notified: true,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),
});
