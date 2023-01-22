/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { router, vendorProcedure } from "../trpc";
import { z } from "zod";
import { flow, get, groupBy, head, map, omit, partialRight } from "lodash";
import type { IUnpaidPartnerAndLinks } from "../../../interface/dashboard.interface";
import type { Link, Partner, Product, Visit } from "@prisma/client";
import { CommissionType } from "@prisma/client";
import { LinkStatus } from "@prisma/client";

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

  // ! THIS is faulty
  getUnpaidPartners: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;

    console.time("qq");
    const linksWithUnPaidVisits = await ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
      },
      include: {
        visits: {
          where: {
            dubious: false,
            paid: null,
          },
          include: {link: true}
        },
        partner: true,
        // product: true,
      },
    });

    const visitsWithUnPaidVisits = await ctx.prisma.visit.findMany({
      where: {
        vendor_id: vendorId,
        dubious: false,
        paid: null,
      },
      include: {
        link: true,
        // partner: true,
        // product: true,
      },
    });

    console.log("visitsWithUnPaidVisits");
    console.log(visitsWithUnPaidVisits.length);
    


    const groupTransactions =( await ctx.prisma.visit.groupBy({
      by: ['partner_id'],
  }))
  
  

    // console.log(JSON.stringify(groupTransactions, null, 4));
    


    // const aa = linksWithUnPaidVisits.map(x => ({
    //   partner: x.partner
    // }))

    console.timeEnd("qq");

    console.time("payment_func");
    const func = flow(
      partialRight(groupBy, "partner_id"),
      partialRight(
        map,
        (
          group: (Link & {
            partner: Partner;
            visits: Visit & { link: Link };
          })[]
        ) => ({
          ...get(head(group), "partner"),
          partner_links: group.map((o) => omit(o, "partner")).length,
          visits: group.map((o) => (o.visits)),
          link: group.map((o) => (o)),
          visitsCalc: group.flatMap((v) => ({vis: v.visits, link: v})).reduce((acc, cur) => {
            let res = 0
            // console.log("cur.vis /n");
            // console.log( cur.vis);
            
            if(cur.link.perClickType === CommissionType.CASH) {
              const pc = cur.link.perClick
              res = (pc ?? 0) + acc;
            }  else if (cur.link.perClickType === CommissionType.PERC) {
              res = ((cur.link.price ?? 0) / 100) * (cur.link.perClick ?? 0) + acc;
            }

            return res
          }, 0),
          calc: group
            .map((o) => omit(o, "partner"))
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

    const funcRes = func(linksWithUnPaidVisits) as IUnpaidPartnerAndLinks[];
    
    console.log('------------------------------------ /n');
    
    // console.log(JSON.stringify(funcRes, null, 4));

    console.timeEnd("payment_func");

    // console.log(func(links));

    return funcRes;
  }),

  // * Payment Detail Page
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
            // !REDUCE SUPHELI
            // !REDUCE SUPHELI
            // !REDUCE SUPHELI
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

      console.log("func /n");
      // console.log(func(links));

      return func(links);
    }),

  getPayments: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;
    // console.log({ vendorId });
    const links = await ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
      },
      include: { visits: true, partner: true, product: true },
    });

    const viss = links.map((x) => x.visits);
    const a = viss.map((x) => x.filter((x) => !x.paid && !x.dubious)[0]);
    // console.log(a);
    const gr = groupBy(a, "partner_id");
    // console.log(gr);

    const vis12 = links.map((x) => ({
      partnerUsername: x.partner.username,
      // prodId: x.product_id,
      // partnerId: x.partner.id,
      // link: x,
      // product: x.product,
      // visits: x.visits,
      // partner: x.partner,
      xx: gr[x.partner_id],
    }));

    console.log(vis12);

    const vis = links.map((x) => ({
      partnerUsername: x.partner.username,
      prodId: x.product_id,
      partnerId: x.partner.id,
      link: x,
      product: x.product,
      visits: x.visits,
      partner: x.partner,
    }));

    // const x = groupBy(vis, "partnerUsername");
    // console.log(x);

    const visits = await ctx.prisma.visit.findMany({
      where: {
        vendor_id: vendorId,
        // dubious: false,
        paid: null,
      },
      include: {
        link: {
          include: { product: true, partner: true },
        },
      },
    });

    // const paid2 = visits.filter((x) => x.paid);
    // const unpaid2 = visits.filter((x) => !x.paid && !x.dubious);

    // console.log(JSON.stringify(func(unpaid2)));

    return links;
  }),

  calculateLinksAndPayments: vendorProcedure.query(async ({ ctx }) => {
    const { vendorId } = ctx.session;
    // console.log({ vendorId });
    console.log("\n");

    const visits = await ctx.prisma.visit.findMany({
      where: {
        vendor_id: vendorId,
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

    const x = groupBy(unpaid, "link.product.id");
    console.log(x);

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

    console.log({
      unpaidTotal,
      paidTotal,
      unpaid: unpaidLinks.length,
      paid: paidLinks.length,
      total: visits.length,
      valid: valid.length,
      invalid: invalid.length,
    });

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
