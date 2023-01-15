import { router, publicProcedure } from "../trpc";
import { z } from "zod";

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
