import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  vendorProcedure,
} from "../trpc";

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
      // for testing this is required, needs to be a function to discriminate a developer
      if (ipInfo.city === "Adana") return { success: true, error: false };

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
  // can be used for both vendor and partner
  getVisitsForLinkDetail: protectedProcedure
    .input(
      z.object({
        linkId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // const vendorId = ctx.session.vendorId;
      // const vendorUserId = ctx.session.id;
      const { linkId } = input;
      // TODO only query non paid visits
      const res = await ctx.prisma.visit.findMany({
        where: {
          link_id: linkId,
        },
        include: { partner: true, vendor: true },
      });

      return res;
    }),

  validateApiKey: publicProcedure
    .input(
      z.object({
        apikey: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { apikey } = input;

      const key = await ctx.prisma.apiKey.findUnique({
        where: {
          apikey,
        },
      });

      if (!key) return { error: true, message: "Token not found!" };

      try {
        await ctx.prisma.apiKey.update({
          where: {
            apikey,
          },
          data: { installed: true },
        });

        return { error: false, message: "success" };
      } catch (error) {
        return { error: true, message: "Token not activated!" };
      }
    }),
});
