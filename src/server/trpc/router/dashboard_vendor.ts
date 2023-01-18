import { router, vendorProcedure } from "../trpc";
// import { z } from "zod";
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
    const canceledByVendor = links.filter(
      (x) => x.status === LinkStatus.CANCELED_BY_VENDOR
    );
    // const deniedRequests = links.filter(
    //   (x) => x.status === LinkStatus.REQUEST_DENIED
    // );
    const passive = links.filter((x) => x.active === false);
    const awaiting = links.filter((x) => x.status === LinkStatus.AWAITING);
    // console.log(deniedRequests.length);

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

    const p = await ctx.prisma.product.findMany({
      where: {
        vendor_profile_id: vendorId,
        active: true,
        links: {
          some: { active: { not: null } },
        },
      },
      include: {
        links: {
          include: { partner: true, visits: true },
        },
      },
    });

    // console.log(JSON.stringify(p, null, 4));

    const links = await ctx.prisma.link.findMany({
      where: {
        AND: [
          { vendor_id: vendorId },
          { status: { not: LinkStatus.AWAITING } },
        ],
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

  calculateTotal: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;
    console.log({vendorId});
    
    const visits = await ctx.prisma.visit.findMany({
      where: {
        vendor_id: vendorId,
        // dubious: { not: true },
      },
      include: {
        link: {
          include: { product: true },
        },
      },
    });

    const paid = visits.filter((x) => x.paid);
    const unpaid = visits.filter((x) => !x.paid);
    console.log({unpaid: unpaid.length});
    console.log({paid: paid.length});
    // console.log({unpaid});
    
    const paidLinks = paid.map((x) => x.link.product);
    const unpaidLinks = unpaid.map((x) => x.link.product);
    let s = 0
    const unpaidTotal = unpaidLinks.reduce((acc, cur) => {
      s = cur.perClick ?? 0
      let res = 0;
      if (cur.perClickType === "CASH") {
        res = cur.perClick ?? 0 + acc;
      } else {
        // ((pd.product.price ?? 1) / 100) * (pd.product.perClick ?? 0)
        res = (((cur.price ?? 0) / 100) * (cur.perClick ?? 0) )+ acc;
      }
      return res;
    }, s);

    console.log({ unpaidTotal });

    return 0;
  }),
});
