import { router, vendorProcedure } from "../trpc";
import { flow, get, groupBy, head, map, omit, partialRight } from "lodash";
import type { IPartnerAndLinks } from "../../../interface/dashboard.interface";
import type { Link, Partner } from "@prisma/client";
import { CommissionType } from "@prisma/client";
import { LinkStatus } from "@prisma/client";



export const VendorDashboardRouter = router({
  getLinkStats: vendorProcedure.query(async ({ ctx }) => {
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

  getPartnerAndLinks: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;


    const links = await ctx.prisma.link.findMany({
      where: {
        AND: [
          { vendor_id: vendorId },
          { status: { not: LinkStatus.AWAITING } },
        ],
      },
      include: { partner: true },
    });


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

  calculateLinksAndPayments: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;

    await ctx.prisma.visit.deleteMany({
      where: {
        ipapi: null
      }
    })

    const visits = await ctx.prisma.visit.findMany({
      where: {
        vendor_id: vendorId,
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
      }
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
