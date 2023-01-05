/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import {
  router,
  protectedProcedure,
  partnerProcedure,
  vendorProcedure,
} from "../trpc";
import { z } from "zod";
import crypto from "crypto";

export const linkRouter = router({
  getLinkById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.link.findFirst({
        where: {
          id,
        },
        include: { product: true, vendor: true },
      });
    }),

  getAllLinksForPartner: partnerProcedure.query(({ ctx, input }) => {
    const { partnerId } = ctx.session;

    return ctx.prisma.link.findMany({
      where: {
        partner_id: partnerId,
        confirmed: true,
      },
      include: { product: true, vendor: true },
    });
  }),

  getAllLinksForVendor: vendorProcedure.query(({ ctx, input }) => {
    const { vendorId } = ctx.session;

    return ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
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
            confirmed: null,
            url: randUrl,
            categoryId: product.categoryId,
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

  updateLinkStatusByVendor: vendorProcedure
    .input(
      z.object({
        id: z.string(),
        isConfirmed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isConfirmed } = input;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });
      // https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-a-number-field
      try {
        await ctx.prisma.link.update({
          where: { id },
          data: {
            active: isConfirmed,
            confirmed: isConfirmed,
            vendor_notified: true,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),

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
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),
});
