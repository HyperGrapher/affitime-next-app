/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRoles } from "./../../../interface/auth.interface";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import crypto from "crypto";

export const linkRouter = router({
  getLinkById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.link.findUnique({
        where: {
          id,
        },
        include: { product: true, vendor: true },
      });
    }),

  getAllLinksForPartner: protectedProcedure.query(({ ctx, input }) => {
    const { role, partnerId } = ctx.session;

    if (!partnerId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.findMany({
      where: {
        partner_id: partnerId,
        confirmed: true,
      },
      include: { product: true, vendor: true },
    });
  }),

  getAllLinksForVendor: protectedProcedure.query(({ ctx, input }) => {
    const { role, vendorId } = ctx.session;

    if (!vendorId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
      },
      include: { product: true, partner: true },
    });
  }),

  createLink: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { role, partnerId } = ctx.session;
      console.log({ vendorId: partnerId, role });

      if (role !== UserRoles.PARTNER)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Permission denied!",
        });

      const { productId } = input;

      if (!partnerId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Partner ID not found!",
        });

      if (!productId)
        throw new TRPCError({ code: "NOT_FOUND", message: "PID not found" });

      try {
        const partner = await ctx.prisma.partner.findUnique({
          where: { id: partnerId },
        });

        if (!partner)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Partner not found",
          });

        const product = await ctx.prisma.product.findUnique({
          where: { id: productId },
          include: { vendor: true },
        });

        if (!product)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });

        const vendor = await ctx.prisma.vendor.findUnique({
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

  updateLinkStatusByVendor: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isConfirmed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isConfirmed } = input;

      const { vendorId } = ctx.session;

      if (!vendorId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Vendor not found",
        });

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
});
