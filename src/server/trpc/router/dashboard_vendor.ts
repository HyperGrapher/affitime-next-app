import { router, publicProcedure, vendorProcedure } from "../trpc";
import { z } from "zod";
import { flow, get, groupBy, head, map, omit, partialRight } from "lodash";
import type { IPartnerAndLinks } from "../../../interface/dashboard.interface";
import type { Link, Partner } from "@prisma/client";
import { LinkStatus } from "@prisma/client";

export const VendorDashboardRouter = router({
  getXForVendor: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;

    const links = await ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
      },
    });

    const confirmed = links.filter((x) => x.status === LinkStatus.CONFIRMED);
    const canceledByVendor = links.filter((x) => x.status === LinkStatus.CANCELED_BY_VENDOR);
    const deniedRequests = links.filter((x) => x.status === LinkStatus.REQUEST_DENIED);
    const passive = links.filter((x) => x.active === false);
    const awaiting = links.filter((x) => x.status === LinkStatus.AWAITING);
    console.log(deniedRequests.length);
    
    const allClicks = confirmed.reduce((acc, cur) => acc + cur.count, 0);
    const valid = confirmed.reduce(
      (acc, cur) => acc + (cur.count - cur.declined),
      0
    );
    const declined = confirmed.reduce((acc, cur) => acc + cur.declined, 0);

    return {
      all: String(links.length),
      active: String(confirmed.length),
      passive: String(passive.length),
      refused: String(canceledByVendor.length),
      awaiting: String(awaiting.length),
      total: String(allClicks),
      valid: String(valid),
      declined: String(declined),
    };
  }),

  // https://github.com/prisma/prisma/discussions/4185
  getPartnerAndLinks: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;

    const links = await ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
        active: true,
      },
      include: { partner: true },
    });

    //  DB |-> Links[] + {partner} => partner[] + Links[] 
    // Vendor'e ait herbir link ile gelen single partner yerine 
    // Vendor'e ait link'e sahip herbir partner ile gelen multiple linkler 
    const func = flow(
      partialRight(groupBy, "partner.id"),
      partialRight(
        map,
        (
          group: (Link & {
            partner: Partner;
          })[]
        ) => ({
          ...get(head(group), "partner"),
          partner_links: group.map((o) => omit(o, "partner")),
        })
      )
    );

    return func(links) as IPartnerAndLinks[];
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
            ipapi: ipInfo.ip,
          },
        });

        return { success: true, error: false };
      } catch (error) {
        console.error(error);
        return { success: false, error: error };
      }
    }),
});
