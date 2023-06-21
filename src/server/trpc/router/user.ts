import { TRPCError } from "@trpc/server";
import {
  router,
  protectedProcedure,
  vendorProcedure,
  partnerProcedure,
} from "../trpc";
import { z } from "zod";
import crypto from "node:crypto";
import { sendEmail } from "../../../utils/send-email";

export const userRouter = router({
  getUserByEmail: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query(({ ctx, input }) => {
      const { email } = input;

      if (!email) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.user.findFirst({
        where: {
          email,
        },
        select: {
          id: true,
          role: true,
          email: true,
          image: true,
          password: false,
          trial: true,
          active: true,
          emailVerified: true,
          vendor: true,
          partner: true,
        },
      });
    }),

  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.user.findFirst({
        where: {
          id,
        },
        select: {
          id: true,
          role: true,
          email: true,
          image: true,
          password: false,
          trial: true,
          active: true,
          emailVerified: true,
          vendor: true,
          partner: true,
        },
      });
    }),
  updateUserIp: protectedProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = ctx.session.id;

      const ip = input;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "Email not found" });

      if (!ip.ip)
        throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });

      try {
        await ctx.prisma.user.update({
          where: { id },
          data: {
            ipdata: { ...ip },
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        console.error(error);

        return { error: true, message: "IP upsert failed" };
      }
    }),
  updateVendorAccount: vendorProcedure
    .input(
      z.object({
        fname: z.string().trim().optional(),
        lname: z.string().trim().optional(),
        brand: z.string().trim().optional(),
        image: z.string().trim().optional(),
        website: z.string().trim().url().optional(),
        phone: z.string().trim().min(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = ctx.session.id;
      const vendorId = ctx.session.vendorId;
      const { fname, lname, brand, website, phone, image } = input;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "ID not found" });

      try {
        await ctx.prisma.user.update({
          where: { id },
          data: {
            fname,
            lname,
            image,
          },
        });

        await ctx.prisma.vendor.update({
          where: { id: vendorId },
          data: {
            brand,
            website,
            phone,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        console.error(error);
        return { error: true, message: "IP upsert failed" };
      }
    }),

  attemptUpdateEmail: protectedProcedure
    .input(
      z.object({
        currentEmail: z.string().trim().email(),
        nextEmail: z.string().trim().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = ctx.session.id;
      const role = ctx.session.role;
      const { currentEmail, nextEmail } = input;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "ID not found" });

      const user = await ctx.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          vendor: role === "VENDOR",
          partner: role === "PARTNER",
        },
      });

      if (user?.email === nextEmail)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Yeni email adresiniz onceki ile ayni olamaz",
        });

      const confirmId = crypto
        .randomBytes(24)
        .toString("hex")
        .replace(/^a-zA-Z0-9 ]/g, "");

      try {
        await ctx.prisma.user.update({
          where: { id },
          data: {
            nextEmail,
            confirmId,
          },
        });

        const template = {
          email: {
            subject: "E-Posta Değişikliğini Onaylayın!",
            template: {
              id: 13542,
              variables: {
                name:
                  role === "VENDOR"
                    ? user?.vendor?.brand
                    : user?.partner?.username,
                next_email: nextEmail,
                confirm_url: `auth/change-email/${confirmId}`,
                current_year: new Date().getUTCFullYear(),
              },
            },
            from: {
              name: "Affitime",
              email: "noreply@affitime.com",
            },
            to: [
              {
                email: currentEmail,
                name:
                  role === "VENDOR"
                    ? user?.vendor?.brand
                    : user?.partner?.username,
              },
            ],
          },
        };

        await sendEmail(template);

        return { error: false, message: "ok" };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  updatePartnerAccount: partnerProcedure
    .input(
      z.object({
        fname: z.string().trim().optional(),
        lname: z.string().trim().optional(),
        image: z.string().trim().optional(),
        phone: z.string().trim().min(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = ctx.session.id;
      const partnerId = ctx.session.partnerId;
      const { fname, lname, phone, image } = input;

      if (!id)
        throw new TRPCError({ code: "NOT_FOUND", message: "ID not found" });

      try {
        await ctx.prisma.user.update({
          where: { id },
          data: {
            fname,
            lname,
            image,
          },
        });

        await ctx.prisma.partner.update({
          where: { id: partnerId },
          data: {
            phone,
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        console.error(error);
        return { error: true, message: "IP upsert failed" };
      }
    }),

  getVendorAccount: vendorProcedure.query(({ ctx }) => {
    const { id } = ctx.session;

    if (!id) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        email: true,
        fname: true,
        lname: true,
        image: true,
        vendor: {
          select: {
            phone: true,
            brand: true,
            website: true,
          },
        },
      },
    });
  }),
  getPartnerAccount: partnerProcedure.query(({ ctx }) => {
    const { id } = ctx.session;

    if (!id) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        email: true,
        fname: true,
        lname: true,
        image: true,
        partner: {
          select: {
            phone: true,
            username: true,
          },
        },
      },
    });
  }),

  getAccountImage: protectedProcedure.query(({ ctx }) => {
    const { id } = ctx.session;

    if (!id) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        image: true,
      },
    });
  }),
});
