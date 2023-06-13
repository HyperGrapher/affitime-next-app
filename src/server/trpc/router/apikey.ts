import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { router, vendorProcedure } from "../trpc";
import nodemailer from "nodemailer";

export const ApikeyRouter = router({
  getApikey: vendorProcedure.query(({ ctx }) => {
    const { vendorId } = ctx.session;

    const data = ctx.prisma.apiKey.findFirst({
      where: {
        vendorId,
      },
    });

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tax data not found",
      });
    }

    return data;
  }),

  sendEmail: vendorProcedure.mutation(async ({ ctx }) => {
    const { vendorId, id } = ctx.session;

    const transporter = nodemailer.createTransport({
      host: "smtp-pulse.com",
      port: 465, //2525 - 465 SSL • 587 TLS
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: "erim2222@gmail.com",
        pass: "BaH3KGjpEj",
      },
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product ID not found",
          cause: error,
        });
      } else {
        console.log("Server is ready to take our messages");
        return { error: false, message: "Email success" };
      }
    });

    console.log("----> SENT EMAIL");
    return { error: false, message: "Email success" };
  }),

  upsertApikey: vendorProcedure.mutation(async ({ ctx }) => {
    const { vendorId, id } = ctx.session;

    let apikey = crypto
      .randomBytes(24)
      .toString("hex")
      .replace(/^a-zA-Z0-9 ]/g, "");

    apikey = `affi-${apikey}`;

    const existing = await ctx.prisma.apiKey.findFirst({
      where: { vendorId },
    });

    try {
      if (existing) {
        return await ctx.prisma.apiKey.update({
          where: { vendorId },
          data: {
            apikey,
            installed: true, // ! TODO -  FOR DEV - Remove on prod
          },
        });
      } else {
        const api = await ctx.prisma.apiKey.create({
          data: {
            vendorId,
            apikey,
          },
        });

        await ctx.prisma.vendor.update({
          where: { id: vendorId },
          data: {
            apiKeyId: api.id,
          },
        });
      }
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product ID not found",
      });
    }
  }),
});
