import { partnerProcedure, router } from "../trpc";
// import { z } from "zod";
import type { Link, Partner } from "@prisma/client";
import { CommissionType, LinkStatus } from "@prisma/client";
import { flow, get, groupBy, head, map, omit, partialRight } from "lodash";
import type { IPartnerAndLinks } from "../../../interface/dashboard.interface";

// ! TODO WARN - Possible bug - test every reducer if type is NONE
// ! Currently checking if it's CASH or PERC.
// ! Might need to return acc if NONE
export const PartnerDashboardRouter = router({
  getLinkStats: partnerProcedure.query(async ({ ctx }) => {
    const { partnerId } = ctx.session;

    const links = await ctx.prisma.link.findMany({
      where: {
        partner_id: partnerId,
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

    return {
      all: String(links.length),
      active: String(confirmed.length),
      passive: String(passive.length),
      refused: String(canceledByVendor.length),
      awaiting: String(awaiting.length),
    };
  }),

  // https://github.com/prisma/prisma/discussions/4185
  getPartnerAndLinks: partnerProcedure.query(async ({ ctx }) => {
    const { partnerId } = ctx.session;

    // const p = await ctx.prisma.product.findMany({
    //   where: {
    //     vendor_profile_id: partnerId,
    //     active: true,
    //     links: {
    //       some: { active: { not: null } },
    //     },
    //   },
    //   include: {
    //     links: {
    //       include: { partner: true, visits: true },
    //     },
    //   },
    // });

    // console.log(JSON.stringify(p, null, 4));

    const links = await ctx.prisma.link.findMany({
      where: {
        AND: [
          { partner_id: partnerId },
          { status: { not: LinkStatus.AWAITING } },
        ],
      },
      include: { vendor: true },
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

  calculateLinksAndPayments: partnerProcedure.query(async ({ ctx }) => {
    const { partnerId } = ctx.session;

    const visits = await ctx.prisma.visit.findMany({
      where: {
        partner_id: partnerId,
        // dubious: false,
        paid: null,
      },
      include: {
        link: {
          include: { product: true },
        },
      },
    });

    const paid = visits.filter((x) => x.paid);
    const unpaid = visits.filter((x) => !x.paid && !x.dubious);
    const valid = visits.filter((x) => !x.dubious);
    const invalid = visits.filter((x) => x.dubious);

    // const x = groupBy(unpaid, "link.product.id");
    // console.log(x);

    const paidLinks = paid.map((x) => x.link);
    const unpaidLinks = unpaid.map((x) => x.link);

    const unpaidTotal = unpaidLinks.reduce((acc, cur) => {
      let res = 0;
      if (cur.perClickType === CommissionType.CASH) {
        res = (cur.perClick ?? 0) + acc;
      } else if (cur.perClickType === CommissionType.PERC) {
        res = ((cur.price ?? 0) / 100) * (cur.perClick ?? 0) + acc;
      }
      return res;
    }, 0);

    const paidTotal = paidLinks.reduce((acc, cur) => {
      let res = 0;
      if (cur.perClickType === CommissionType.CASH) {
        res = (cur.perClick ?? 0) + acc;
      } else if (cur.perClickType === CommissionType.PERC) {
        res = ((cur.price ?? 0) / 100) * (cur.perClick ?? 0) + acc;
      } // else return acc // ! WARN - test every reducer if type is NONE
      return res;
    }, 0);

    return {
      unpaidTotal: String(unpaidTotal),
      paidTotal: String(paidTotal),
      unpaid: String(unpaidLinks.length),
      paid: String(paidLinks.length),
      total: String(visits.length),
      valid: String(valid.length),
      invalid: String(invalid.length),
    };
  }),
});
