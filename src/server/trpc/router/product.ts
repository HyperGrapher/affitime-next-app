/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

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
      select: { products: true },
    });
  }),

  createProduct: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        desc: z.string(),
        price: z.number(),
        store_url: z.string(),
        image: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;

      console.log({ vendorIdFromSession: vendorId });

      const data = input;

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
            title: data.title,
            desc: data.desc,
            image: data.image,
            price: data.price,
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
