import { z } from "zod";
import { publicProcedure, router, vendorProcedure } from "../trpc";

export const visitRouter = router({
  updateVisit: publicProcedure
    .input(
      z.object({
        visitId: z.string(),
        ipInfo: z.object({
          ip: z.string(),
          network: z.string().optional(),
          city: z.string().optional(),
          region: z.string().optional(),
          country: z.string().optional(),
          country_name: z.string().optional(),
          currency: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
          org: z.string().optional(),
          in_eu: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { visitId, ipInfo } = input;

      try {
        await ctx.prisma.visit.update({
          where: { id: visitId },
          data: {
            country: ipInfo.country,
            ipInfo: ipInfo,
            ipapi: ipInfo.ip,
          },
        });

        return { success: true, error: false };
      } catch (error) {
        console.error(error);
        return { success: false, error: error };
      }
    }),

  getVisits: vendorProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;
      const { productId } = input;
      console.log({ productId, vendorId });

      const res = await ctx.prisma.link.findMany({
        where: {
          AND: [
            {
              vendor_id: vendorId,
            },
            {
              product_id: productId,
            },
          ],
        },
        include: {partner: true}
      });

      return res;
    }),
});
