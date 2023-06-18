import { TRPCError } from "@trpc/server";
import {
  router,
  protectedProcedure,
  partnerProcedure,
  vendorProcedure,
} from "../trpc";
import { z } from "zod";
import crypto from "crypto";
import { CommissionType, LinkStatus } from "@prisma/client";
import sendpulse from "sendpulse-api";
import { sendEmail } from "../../../utils/send-email";

const API_USER_ID = "227943d8a153c1713d3fd8c7d97b1e63";
const API_SECRET = "cd11fe04653031b9f60787f61170ecf6";
const TOKEN_STORAGE = "/tmp/";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

// * sendpulse initialised in server/trpc/trpc.ts

export const linkRouter = router({
  // for both vendor and partner
  // * ../links/detail/[id]
  getLinkDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const { role } = ctx.session;

      // TODO delete bots with stored procedure
      await ctx.prisma.visit.deleteMany({
        where: {
          ipapi: null,
        },
      });

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });
      sendpulse.listAddressBooks(() => null, 10, 0);

      const link = await ctx.prisma.link.findUnique({
        where: {
          id,
        },
        include: {
          product: true,
          vendor: role === "PARTNER",
          partner: role === "VENDOR",
          visits: true,
        },
      });

      if (!link) throw new TRPCError({ code: "NOT_FOUND" });

      const validClicks = link.visits.filter((x) => !x.paid && !x.dubious);
      const dubiousClicks = link.visits.filter((x) => !x.paid && x.dubious);

      const totalDuePayment = validClicks.reduce((acc, cur) => {
        let total = 0;
        if (cur.perClickType === CommissionType.CASH) {
          total = (cur.perClick ?? 0) + acc;
        } else if (cur.perClickType === CommissionType.PERC) {
          total = ((cur.price ?? 0) / 100) * (cur.perClick ?? 0) + acc;
        }

        return total;
      }, 0);

      return {
        link,
        totalDuePayment,
        validClicks: validClicks.length,
        dubiousClicks: dubiousClicks.length,
      };
    }),
  getPartnerDetailsForLinkDetail: vendorProcedure.query(({ ctx }) => {
    const vendorId = ctx.session.vendorId;
    const userId = ctx.session.id;
    console.log("");
  }),

  findLinkByProductIdForPartner: partnerProcedure
    .input(z.object({ pid: z.string() }))
    .query(({ ctx, input }) => {
      const { pid } = input;
      const { partnerId } = ctx.session;
      return ctx.prisma.link.findFirst({
        where: {
          product_id: pid,
          partner_id: partnerId,
        },
      });
    }),

  getPartnerLinks: partnerProcedure.query(({ ctx }) => {
    const { partnerId } = ctx.session;

    return ctx.prisma.link.findMany({
      where: {
        partner_id: partnerId,
        status: { not: LinkStatus.AWAITING },
      },
      include: { product: true, vendor: true, visits: true },
    });
  }),

  getVendorLinks: vendorProcedure.query(({ ctx }) => {
    const { vendorId } = ctx.session;

    return ctx.prisma.link.findMany({
      where: {
        vendor_id: vendorId,
        status: { not: LinkStatus.AWAITING },
      },
      include: { product: true, partner: true, visits: true },
    });
  }),

  getLinksForProduct: vendorProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { vendorId } = ctx.session;
      const { productId } = input;

      const res = await ctx.prisma.link.findMany({
        where: {
          AND: [
            {
              vendor_id: vendorId,
            },
            {
              product_id: productId,
            },
          ],
        },
        include: { partner: true, visits: true },
      });

      console.log(res);

      const doubious = res.map((x) => x.visits.map((y) => y.dubious));

      /*
      const links = await ctx.prisma.link.findMany({
        where: {
          AND: [
            {
              vendor_id: vendorId,
            },
            {
              product_id: productId,
            },
          ],
        },
        include: { partner: {
          include: {visits: true}
        }, visits: true },
      });

      const trans = {
        ids: links.map(ln => ({
          id: ln.id, 
          username: ln.partner.username,
          totalVis: ln.partner.visits.length,
        })
        )
      }

      

      return links;

      */

      return res;
    }),

  createLink: partnerProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { partnerId } = ctx.session;

      const { productId } = input;

      if (!productId)
        throw new TRPCError({ code: "NOT_FOUND", message: "PID not found" });

      try {
        const partner = await ctx.prisma.partner.findFirst({
          where: { id: partnerId },
        });

        if (!partner)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Partner not found",
          });

        const product = await ctx.prisma.product.findFirst({
          where: { id: productId },
          include: { vendor: true },
        });

        if (!product)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });

        const vendor = await ctx.prisma.vendor.findFirst({
          where: { id: product?.vendor_profile_id },
          include: { user: true },
        });

        if (!vendor)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Vendor not found",
          });

        const hasPrevLink = await ctx.prisma.link.findFirst({
          where: { partner_id: partnerId, product_id: productId },
        });

        if (hasPrevLink)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ürün için daha önce link oluşturulmuş!",
          });

        let randUrl = crypto.randomBytes(6).toString("base64url");

        const urlExists = await ctx.prisma.link.findFirst({
          where: { url: randUrl },
        });

        if (urlExists) randUrl = crypto.randomBytes(6).toString("base64url");

        const link = await ctx.prisma.link.create({
          data: {
            vendor_id: vendor.id,
            partner_id: partner.id,
            product_id: product.id,
            partner_user_id: partner.userId,
            vendor_user_id: vendor.userId,
            active: null,
            vendor_notified: false,
            partner_notified: false,
            url: randUrl,
            categoryId: product.categoryId,
            status: LinkStatus.AWAITING,
            cookieLife: product.cookieLife,
            price: product.price,
            perClick: product.perClick,
            perSale: product.perSale,
            perClickType: product.perClickType,
            perSaleType: product.perSaleType,
          },
        });

        if (!link)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Link cannot be created",
          });

        const template = {
          email: {
            subject: "Yeni kampanya başvurusu!",
            template: {
              id: 13517,
              variables: {
                firmaname: vendor.brand,
                name: partner.username,
                current_year: new Date().getUTCFullYear(),
              },
            },
            from: {
              name: "Affitime",
              email: "noreply@affitime.com",
            },
            to: [
              {
                email: vendor?.user.email,
                name: vendor.brand,
              },
            ],
          },
        };
        // Sending mail to the vendor with partner username {{name}}
        await sendEmail(template);

        return link;
      } catch (error) {
        console.error(error);
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create link!",
        });
      }
    }),

  confirmOrDenyLinkRequest: vendorProcedure
    .input(
      z.object({
        id: z.string(),
        confirmed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, confirmed } = input;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });
      // https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-a-number-field
      try {
        await ctx.prisma.link.update({
          where: { id },
          data: {
            active: confirmed,
            vendor_notified: true,
            partner_notified: false,
            status: confirmed
              ? LinkStatus.CONFIRMED
              : LinkStatus.REQUEST_DENIED,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),

  // ! Not used yet
  updateLinkStatusByPartner: partnerProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, isActive } = input;

      try {
        await ctx.prisma.link.update({
          where: { id },
          data: {
            active: isActive,
            status: LinkStatus.CANCELED_BY_PARTNER,
            vendor_notified: false,
            partner_notified: true,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),
});
