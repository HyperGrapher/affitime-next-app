/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Link, Partner, Product, Vendor, Visit } from "@prisma/client";
import { CommissionType, LinkStatus } from "@prisma/client";
import { flow, get, groupBy, head, map, omit, partialRight } from "lodash";
import { z } from "zod";
import type { IUnpaidItemForVendor, IUnpaidItemForPartner } from "../../../interface/dashboard.interface";
import { partnerProcedure, router, vendorProcedure } from "../trpc";

export const PaymentsRouter = router({
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

  getUnpaidForPartner: partnerProcedure.query(async ({ ctx }) => {
    const { partnerId } = ctx.session;

    const visits = await ctx.prisma.visit.findMany({
      where: {
        partner_id: partnerId,
        dubious: false,
        paid: null,
      },
      include: {
        link: true,
        vendor: true,
      },
    });  

    const func = flow(
      partialRight(groupBy, "vendor.brand"),
      partialRight(
        map,
        (
          group: (Visit & {
            vendor: Vendor;
            link: Link;
          })[]
        ) => ({
          ...get(head(group), "vendor"),
          visits: group.map((o) => omit(o, "vendor")),
          calc: group
            .reduce((acc, cur) => {
              let total = 0;
              if (cur.link.perClickType === CommissionType.CASH) {
                total = (cur.link.perClick ?? 0) + acc;
              } else if (cur.link.perClickType === CommissionType.PERC) {
                total = ((cur.link.price ?? 0) / 100) * (cur.link.perClick ?? 0) + acc;
              }

              return total;
            }, 0),
          links: new Set(group.map((x) => x.link_id)).size,
        })
      )
    );

    const funcRes = func(visits) as IUnpaidItemForPartner[];
    
    return funcRes.filter(x => x.calc !== 0);
  }),

  getUnpaidPartners: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;

    const visits = await ctx.prisma.visit.findMany({
      where: {
        vendor_id: vendorId,
        dubious: false,
        paid: null,
      },
      include: {
        link: true,
        partner: true,
      },
    });    


    const func = flow(
      partialRight(groupBy, "partner.id"),
      partialRight(
        map,
        (
          group: (Visit & {
            partner: Partner;
            link: Link;
          })[]
        ) => ({
          ...get(head(group), "partner"),
          visits: group.map((o) => omit(o, "partner")),
          calc: group
            .reduce((acc, cur) => {
              let total = 0;
              if (cur.link.perClickType === CommissionType.CASH) {
                total = (cur.link.perClick ?? 0) + acc;
              } else if (cur.link.perClickType === CommissionType.PERC) {
                total = ((cur.link.price ?? 0) / 100) * (cur.link.perClick ?? 0) + acc;
              }

              return total;
            }, 0),
          links: new Set(group.map((x) => x.link_id)).size,
        })
      )
    );

    const funcRes = func(visits) as IUnpaidItemForVendor[];


    return funcRes.filter(x => x.calc !== 0);
  }),

  getLinkAndVisitDetailsOfPartner: vendorProcedure
    .input(z.object({ partnerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;
      const { partnerId } = input;

      const links = await ctx.prisma.link.findMany({
        where: {
          vendor_id: vendorId,
          partner_id: partnerId,
        },
        include: {
          visits: {
            where: {
              dubious: false,
              paid: null,
            },
          },
          partner: true,
          product: true,
        },
      });

      const func = flow(
        partialRight(groupBy, "product.id"),
        partialRight(
          map,
          (
            group: (Link & {
              partner: Partner;
              product: Product;
              visits: Visit;
            })[]
          ) => ({
            ...get(head(group), "product"),
            partner_links: group.map((o) => omit(o, "product")),
            calc: group
              .map((o) => omit(o, "product"))
              .reduce((acc, cur) => {
                let res = 0;
                if (cur.perClickType === CommissionType.CASH) {
                  res = (cur.perClick ?? 0) + acc;
                } else if (cur.perClickType === CommissionType.PERC) {
                  res = ((cur.price ?? 0) / 100) * (cur.perClick ?? 0) + acc;
                }
                return res;
              }, 0),
          })
        )
      );

      return func(links);
    }),

  calculateLinksAndPayments: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;

    const visits = await ctx.prisma.visit.findMany({
      where: {
        vendor_id: vendorId,
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
