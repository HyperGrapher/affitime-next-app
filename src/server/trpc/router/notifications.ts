import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { LinkStatus } from "@prisma/client";

export const notificationRouter = router({
  getUnreadNotificationsForVendor: protectedProcedure.query(({ ctx }) => {
    const vendorId = ctx.session.vendorId;

    if (!vendorId) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.link.findMany({
      where: {
        vendor_notified: false,
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
        status: { not: LinkStatus.AWAITING },
        partner_id: partnerId,
      },
      include: { product: true, vendor: true },
    });
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
