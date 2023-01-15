import { router, publicProcedure, vendorProcedure } from "../trpc";
import { z } from "zod";

export const dashboardRouter = router({
  getXForVendor: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;

    const links = await ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
      },
    });

    const lnActives = links.filter((x) => x.active);
    const lnPasives = links.filter((x) => !x.confirmed);

    const allClicks = lnActives.reduce((acc, cur) => acc + cur.count, 0)
    const valid = lnActives.reduce((acc, cur) => acc + (cur.count - cur.declined), 0)
    const declined = lnActives.reduce((acc, cur) => acc + cur.declined, 0)

    return { 
      activeLinksCount: lnActives.length, 
      passive: lnPasives.length,
      allClicks,
      valid,
      declined,

    };
  }),

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
            visiterIp: ipInfo.ip,
          },
        });

        return { success: true, error: false };
      } catch (error) {
        console.error(error);
        return { success: false, error: error };
      }
    }),
});
