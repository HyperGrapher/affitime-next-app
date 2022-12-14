import type { CommissionType } from "@prisma/client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
// https://youtu.be/_K34O0NcKAM?t=395
export const productRouter = router({
  // TODO: To be implemented
  getProductById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.product.findUnique({
        where: {
          id,
        },
      });
    }),

  getAllProductsBySessionVendor: protectedProcedure.query(({ ctx }) => {
    const { vendorId } = ctx.session;

    if (!vendorId)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Session user ID not found",
      });

    return ctx.prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
      select: { products: {
        orderBy: {
          createdAt: 'desc'
        }
      } },
    });
  }),

  createProduct: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        desc: z.string(),
        product_url: z.string().url(),
        image: z.string().url().optional().nullable(),
        price: z.number(),
        perSale: z.number(),
        perClick: z.number(),
        perClickType: z.string(),
        perSaleType: z.string(),
        // perClickType: z.enum([CommissionType.CASH, CommissionType.PERC]).optional(),
        // perSaleType: z.enum([CommissionType.CASH, CommissionType.PERC]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;

      console.log({ vendorIdFromSession: vendorId });

      if (!vendorId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vendor ID not found",
        });

      try {
        const vendor = await ctx.prisma.vendor.findUnique({
          where: {
            id: vendorId,
          },
        });

        if (!vendor)
          throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });

        const product = await ctx.prisma.product.create({
          data: {
            title: input.title,
            desc: input.desc,
            image: input.image,
            perClickType: input.perClickType as CommissionType,
            perClick: input.perClick,
            perSaleType: input.perSaleType as CommissionType,
            perSale: input.perSale,
            price: input.price,
            product_url: input.product_url,
            vendor_user_id: vendor.userId,
            vendor_profile_id: vendor.id,
          },
          include: { vendor: true },
        });

        return product;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    }),
  deleteProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.session;

      const { id } = input;

      if (!userId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User ID not found",
        });

      if (!id)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product ID not found",
        });

      try {
        await ctx.prisma.product.delete({
          where: { id },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),

  // TODO: To be implemented
  updateLink: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = input;

      if (!data)
        throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });
      // https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-a-number-field
      try {
        // await ctx.prisma.link.update({
        //   where: { id: "" },
        //   data: {
        //     visits: {
        //       increment: 1,
        //     },
        //   },
        // });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),
});
