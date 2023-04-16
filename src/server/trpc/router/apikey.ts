import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import {
  router,
  vendorProcedure
} from "../trpc";

export const ApikeyRouter = router({
  getApikey: vendorProcedure.query(({ ctx }) => {
    const { vendorId } = ctx.session;

    const data = ctx.prisma.apiKey.findFirst({
      where: {
        vendorId,
      },
    });

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tax data not found",
      });
    }

    return data;
  }),

  upsertApikey: vendorProcedure.mutation(async ({ ctx }) => {
    const { vendorId, id } = ctx.session;

    let apikey = crypto
      .randomBytes(32)
      .toString("base64url")
      .replace(/^a-zA-Z0-9 ]/g, "");

    apikey = `affi-${apikey}`;

    const existing = await ctx.prisma.apiKey.findFirst({
      where: { vendorId },
    });

    try {
      if (existing) {
        return await ctx.prisma.apiKey.update({
          where: { vendorId },
          data: {
            apikey,
            installed: true // ! TODO -  FOR DEV - Remove on prod
          },
        });
      } else {
        const api = await ctx.prisma.apiKey.create({
          data: {
            vendorId,
            apikey,
          },
        });

        await ctx.prisma.vendor.update({
          where: { id: vendorId },
          data: {
            apiKeyId: api.id,
          },
        });

      }
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product ID not found",
      });
    }
  }),
});
