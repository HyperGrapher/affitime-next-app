/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRoles } from "./../../../interface/auth.interface";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const notificationRouter = router({
  getUnreadNotificationsForVendor: protectedProcedure.query(({ ctx }) => {
    const vendorId = ctx.session.vendorId;

    if (!vendorId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.findMany({
      where: {
        notified: null,
        vendor_id: vendorId,
      },
      include: { product: true, partner: true },
    });
  }),

  getUnConfirmedLinksCountForVendor: protectedProcedure.query(({ ctx }) => {
    const vendorId = ctx.session.vendorId;

    if (!vendorId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.count({
      where: {
        notified: false,
        vendor_id: vendorId,
      },
    });
  }),

  updateLinkNotification: publicProcedure
    .input(
      z.object({
        id: z.string(),
        confirmed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = input.id;
      const confirmed = input.confirmed;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "ID not found" });
      // https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-a-number-field
      try {
        await ctx.prisma.link.update({
          where: { id },
          data: {
            notified: true,
            confirmed,
            active: confirmed,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        console.log(error);
        return { error: true, message: error };
      }
    }),
});
