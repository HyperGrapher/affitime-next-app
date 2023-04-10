import { router, vendorProcedure, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import { Base64 } from "js-base64";
import axios from "axios";
import { PAYTR } from "../../../config/constants";
import { TRPCError } from "@trpc/server";
import { PRICING_ANNUALY, PRICING_MONTHLY } from "../../../config/pricing";
import { taxinfoValidationSchema } from "../../../interface/zod.schema";
import type { IPlanPaymentData } from "../../../interface/payments.interface";
import dayjs from "dayjs";

export const ApikeyRouter = router({
  getApikey: publicProcedure.query(({ ctx }) => {
   

    const data = ctx.prisma.taxinfo.findFirst({
      where: {
        user_id: "id",
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

  upsertApikey: protectedProcedure
    .input(taxinfoValidationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.session;
      const existing = await ctx.prisma.taxinfo.findFirst({
        where: { user_id: id },
      });

      try {
        if (existing) {
          return await ctx.prisma.taxinfo.update({
            where: { user_id: id },
            data: {
              ...input,
            },
          });
        } else {
          return await ctx.prisma.taxinfo.create({
            data: { ...input, user_id: id },
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
