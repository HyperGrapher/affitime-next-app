import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { router, vendorProcedure } from "../trpc";
import nodemailer from "nodemailer";

const sendpulse = {
  user: "erim2222@gmail.com",
  pass: "BaH3KGjpEj",
} as const;

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

  // * Keep this for any no-template emails
  sendEmailSMTP: vendorProcedure.mutation(async ({ ctx }) => {
    const transporter = nodemailer.createTransport({
      host: "smtp-pulse.com",
      port: 465, 
      secure: true,
      auth: {
        user: sendpulse.user,
        pass: sendpulse.pass,
      },
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log("Cannot verify transporter");
        console.log(error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email error!!",
          cause: error,
        });
      } else {
        console.log("Server is ready to take our messages");
        return { error: false, message: "Email success" };
      }
    });

    const message = {
      from: "noreply@affitime.com",
      to: "qwaveapp@gmail.com",
      subject: "Message title",
      text: "Plaintext version of the message",
      html: "<p>HTML version of the message</p>",
      envelope: {
        from: "Affitime <noreply@affitime.com>", // used as MAIL FROM: address for SMTP
        to: "qwaveapp@gmail.com", // used as RCPT TO: address for SMTP
      },
    };

    transporter.sendMail(message, function (err) {
      if (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mail error",
          cause: err,
        });
      } else {
        return { error: false, message: "Email success" };
      }
    });
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
