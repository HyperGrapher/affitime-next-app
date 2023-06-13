import { TRPCError } from "@trpc/server";
import crypto from "node:crypto";
import { router, vendorProcedure } from "../trpc";
import nodemailer from "nodemailer";
import axios from "axios";

const sendpulse = {
  user: "erim2222@gmail.com",
  pass: "BaH3KGjpEj",
};

export const sendEmail = (message: string, cb: () => void) => {
  console.log("");
};

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

  sendEmailSMTP: vendorProcedure.mutation(async ({ ctx }) => {
    const { vendorId, id } = ctx.session;

    const transporter = nodemailer.createTransport({
      host: "smtp-pulse.com",
      port: 465, // 465 SSL • 587 TLS
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

  sendEmail: vendorProcedure.mutation(async ({ ctx }) => {
    const { vendorId, id } = ctx.session;

    const creds = {
      grant_type: "client_credentials",
      client_id: "227943d8a153c1713d3fd8c7d97b1e63",
      client_secret: "cd11fe04653031b9f60787f61170ecf6",
    };

    const withTemplate = {
      email: {
        subject: "Sifre sifirla",
        template: {
          id: 13542,
          variables: {
            name: "burak",
            ec_es_email_sender_company: "affitime - her hakki saklidir",
            current_year: "2023",
            contact_us_url: "affitime.com/contact-us",
          },
        },
        from: {
          name: "Affitime",
          email: "noreply@affitime.com",
        },
        to: [
          {
            email: "qwaveapp@gmail.com",
            name: "qwaveapp",
          },
        ],
      },
    };

    type PulseTokenReturnType = {
      access_token: string;
      token_type: string;
      expires_in: number;
    };
    type PulseEmailReturnType = {
      id: string;
      result: boolean;
    };

    axios
      .request<PulseTokenReturnType>({
        method: "post",
        url: "https://api.sendpulse.com/oauth/access_token",
        data: creds,
      })
      .then((foo) => {
        console.log(foo.data.access_token);
        axios
          .post("https://api.sendpulse.com/smtp/emails", withTemplate, {
            headers: {
              Authorization: `Bearer ${foo.data.access_token}`,
              "Content-type": "application/json",
            },
          })
          .then((res) => {
            console.log(res);
          });
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
