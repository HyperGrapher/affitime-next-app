import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { UserRoles } from "../../../interface/auth.interface";
import bcrypt from "bcrypt";
import { comparePassword } from "../../../utils/comparePassword";
import dayjs from "dayjs";
import crypto from "crypto";
import axios from "axios";
import type { PulseTokenReturnType } from "../../../interface/email.interface";
import { emailCreds } from "../../../config/constants";

const emailTemplate = {
  email: {
    subject: "Sifre sifirla",
    template: {
      id: 13542,
      variables: {
        name: "burak",
        current_year: "2023",
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

async function sendEmail(withTemplate: object) {
  const pulseToken = await axios.request<PulseTokenReturnType>({
    method: "post",
    url: "https://api.sendpulse.com/oauth/access_token",
    data: emailCreds,
  });

  const resp = await axios.post(
    "https://api.sendpulse.com/smtp/emails",
    withTemplate,
    {
      headers: {
        Authorization: `Bearer ${pulseToken.data.access_token}`,
        "Content-type": "application/json",
      },
    }
  );

  console.log(resp);

  return resp;
}

async function XsendEmail2(withTemplate: Record<string, string>) {
  axios
    .request<PulseTokenReturnType>({
      method: "post",
      url: "https://api.sendpulse.com/oauth/access_token",
      data: emailCreds,
    })
    .then((foo) => {
      axios
        .post("https://api.sendpulse.com/smtp/emails", withTemplate, {
          headers: {
            Authorization: `Bearer ${foo.data.access_token}`,
            "Content-type": "application/json",
          },
        })
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.error(e);
        });
    });
}

export const authRouter = router({
  getSessionUser: protectedProcedure.query(({ ctx }) => {
    const { email } = ctx.session.user;

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
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().trim().email(),
        password: z.string().trim().min(8),
        password2: z.string().trim().min(8),
        username: z.string().trim().min(5),
        brand: z.string().trim().min(5),
        website: z.string().trim().url(),
        phone: z.string().trim().min(10),
        role: z.enum(["VENDOR", "PARTNER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, role, username, brand, website, phone } = input;
      let emailName = "";
      const emailExists = await ctx.prisma.user.count({
        where: {
          email,
        },
      });

      if (emailExists)
        throw new TRPCError({
          message: "Bu email zaten kayıtlı",
          code: "CONFLICT",
          cause: "Email Conflict",
        });

      if (role === UserRoles.VENDOR) {
        const websiteExists = await ctx.prisma.vendor.count({
          where: {
            website,
          },
        });

        if (websiteExists)
          throw new TRPCError({
            message: "Bu website zaten kayıtlı",
            code: "CONFLICT",
            cause: "Website Conflict",
          });

        const brandExists = await ctx.prisma.vendor.count({
          where: {
            brand,
          },
        });

        if (brandExists)
          throw new TRPCError({
            message: "Bu firma zaten kayıtlı",
            code: "CONFLICT",
            cause: "Brand Conflict",
          });

        const phoneExists = await ctx.prisma.vendor.count({
          where: {
            phone: {
              endsWith: phone.substring(phone.length - 10),
            },
          },
        });

        if (phoneExists)
          throw new TRPCError({
            message: "Bu telefon zaten kayıtlı",
            code: "CONFLICT",
            cause: "Phone Conflict",
          });
      } else if (role === UserRoles.PARTNER) {
        const usernameExists = await ctx.prisma.partner.count({
          where: {
            username,
          },
        });

        if (usernameExists)
          throw new TRPCError({
            message: "Bu kullanici ismi zaten kayıtlı",
            code: "CONFLICT",
            cause: "Username Conflict",
          });
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);

        const user = await ctx.prisma.user.create({
          data: {
            email: email,
            password: hashPass,
            role: role,
            packageType: role === "VENDOR" ? "TRIAL" : "PARTNER",
            pro: false,
            trial: role === "VENDOR" ? true : false,
          },
        });

        if (role === UserRoles.VENDOR) {
          const nowDate = dayjs(new Date());
          const trialTill = nowDate.add(14, "day").toDate();
          let apikey = crypto
            .randomBytes(32)
            .toString("base64url")
            .replace(/^a-zA-Z0-9 ]/g, "");
          apikey = `affi-${apikey}`;

          const vendor = await ctx.prisma.vendor.create({
            data: {
              userId: user.id,
              brand,
              website,
              phone,
            },
          });

          emailName = vendor.brand;

          const api = await ctx.prisma.apiKey.create({
            data: {
              vendorId: vendor.id,
              apikey,
            },
          });

          await ctx.prisma.vendor.update({
            where: { id: vendor.id },
            data: {
              apiKeyId: api.id,
            },
          });

          await ctx.prisma.user.update({
            where: { id: user.id },
            data: {
              vendor_id: vendor.id,
              trialTill,
            },
          });
        } else if (role === UserRoles.PARTNER) {
          const partner = await ctx.prisma.partner.create({
            data: {
              userId: user.id,
              username,
              phone,
            },
          });

          emailName = partner.username;

          await ctx.prisma.user.update({
            where: { id: user.id },
            data: {
              partner_id: partner.id,
            },
          });
        }

        await ctx.prisma.user.findFirst({
          where: {
            email,
          },
          include: {
            vendor: role === UserRoles.VENDOR,
            partner: role === UserRoles.PARTNER,
          },
        });

        const emailVerifyTemplate = {
          email: {
            subject: "E-posta adresinizi doğrulayın",
            template: {
              id: 12376,
              variables: {
                name: emailName,
                current_year: new Date().getUTCFullYear(),
                verify_url: `/auth/verify-email/${user.id}`,
              },
            },
            from: {
              name: "Affitime",
              email: "noreply@affitime.com",
            },
            to: [
              {
                email: user.email,
                name: emailName,
              },
            ],
          },
        };

        await sendEmail(emailVerifyTemplate);

        return await ctx.prisma.user.findFirst({
          where: {
            email,
          },
          include: {
            vendor: role === UserRoles.VENDOR,
            partner: role === UserRoles.PARTNER,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }),

  updatePassword: protectedProcedure
    .input(
      z.object({
        password1: z.string().min(8),
        password2: z.string().min(8),
        oldPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = ctx.session;
      const { password1, password2, oldPassword } = input;

      if (!email) throw new Error("Kullanıcı sezonu sonlanmış");

      if (password1 !== password2) throw new Error("Şifre tekrarı aynı olmalı");

      const user = await ctx.prisma.user.findFirst({
        where: { email: email },
        include: { vendor: true, partner: true },
      });

      if (!user) throw new Error("User not found!");

      const result = await comparePassword(oldPassword, user.password);

      if (!result) throw new Error("Eski şifrenizi doğru giriniz!");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password1, salt);

      return ctx.prisma.user.update({
        where: {
          email,
        },
        data: {
          password: hashedPassword,
        },
      });
    }),
  deleteSession: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.id;

    if (!userId) throw new Error("Kullanıcı sezonu sonlanmış");

    return ctx.prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }),

  createAdmin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        adminpass: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, adminpass } = input;

      if (adminpass !== "@@affitime-admin@@")
        throw new Error("Cannot create admin");

      const exist = await ctx.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (exist)
        throw new TRPCError({
          message: "Bu email zaten kayıtlı",
          code: "CONFLICT",
          cause: "Email Conflict",
        });

      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await ctx.prisma.user.create({
          data: {
            email: email,
            password: hashedPassword,
            role: UserRoles.ADMIN,
            packageType: "NONE",
            pro: true,
          },
        });

        return { message: "ok", error: null };
      } catch (error) {
        console.error(error);
      }
    }),
});
