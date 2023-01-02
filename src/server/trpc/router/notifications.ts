/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const notificationRouter = router({
  getUnreadNotificationsForVendor: protectedProcedure.query(({ ctx }) => {
    const vendorId = ctx.session.vendorId;

    if (!vendorId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.findMany({
      where: {
        vendor_notified: false,
        confirmed: null,
        vendor_id: vendorId,
      },
      include: { product: true, partner: true },
    });
  }),

  getUnreadNotificationsForPartner: protectedProcedure.query(({ ctx }) => {
    const partnerId = ctx.session.partnerId;

    if (!partnerId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.findMany({
      where: {
        partner_notified: false,
        confirmed: { not: null },
        partner_id: partnerId,
      },
      include: { product: true, vendor: true },
    });
  }),

  getUnConfirmedLinksCountForVendor: protectedProcedure.query(({ ctx }) => {
    const vendorId = ctx.session.vendorId;

    if (!vendorId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.count({
      where: {
        vendor_notified: false,
        confirmed: null,
        vendor_id: vendorId,
      },
    });
  }),

  updateLinkNotificationByVendor: protectedProcedure
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
            vendor_notified: true,
            partner_notified: false,
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

  updateNotificationReadByPartner: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = input.id;

      const partnerId = ctx.session.partnerId;

      if (!partnerId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Partner not found",
        });

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "ID not found" });
      // https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-a-number-field
      try {
        await ctx.prisma.link.update({
          where: { id },
          data: {
            partner_notified: true,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        console.log(error);
        return { error: true, message: error };
      }
    }),
});
