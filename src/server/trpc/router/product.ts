import type { CommissionType} from "@prisma/client";
import { LinkStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, vendorProcedure } from "../trpc";
import { z } from "zod";

export const productRouter = router({

  getProductById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.product.findFirst({
        where: {
          id,
        },
        include: { vendor: true },
      });
    }),

  getProductCategories: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({});
  }),

  getAllProductsBySessionVendor: protectedProcedure.query(({ ctx }) => {
    const { vendorId } = ctx.session;

    if (!vendorId)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Session user ID not found",
      });

    return ctx.prisma.vendor.findFirst({
      where: {
        id: vendorId,
      },
      select: {
        products: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }),

  getAllProductsForVendor: protectedProcedure.query(({ ctx }) => {
    const { partnerId } = ctx.session;

    if (!partnerId)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Session user ID not found",
      });

    return ctx.prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        vendor: {
          include: {
            user: {
              select: {
                image: true,
                active: true,
                trial: true,
                pro: true,
                packageType: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  createProduct: vendorProcedure
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
        category: z.number(),
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
        const vendor = await ctx.prisma.vendor.findFirst({
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
            categoryId: input.category,
            // tags: {
            //   create: [
            //     {
            //       tag: {
            //         create: {
            //           name: "test-1",
            //         },
            //       },
            //     },
            //   ],
            // },
          },
          include: { vendor: true },
        });

        return product;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    }),
  pasifyProduct: vendorProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const { id } = input;

      if (!id)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product ID not found",
        });

      try {
        await ctx.prisma.product.update({
          where: { id },
          data: {
            active: false,
          },
        });

        await ctx.prisma.link.updateMany({
          where: { product_id: id },
          data: {
            active: false,
            partner_notified: false,
            status: LinkStatus.PRODUCT_DELETED
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "error" };
      }
    }),

  updateProduct: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        desc: z.string(),
        product_url: z.string().url(),
        image: z.string().url().optional().nullable(),
        price: z.number(),
        perSale: z.number(),
        perClick: z.number(),
        perClickType: z.string(),
        perSaleType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.id)
        throw new TRPCError({ code: "NOT_FOUND", message: "ID not found" });

      const PCT = input.perClickType as CommissionType;
      const PST = input.perSaleType as CommissionType;

      try {
        await ctx.prisma.product.update({
          where: { id: input.id },
          data: {
            ...input,
            perClickType: PCT,
            perSaleType: PST,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "Update error" };
      }
    }),
});
