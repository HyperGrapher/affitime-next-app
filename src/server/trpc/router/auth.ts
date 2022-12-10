/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { UserRoles } from "../../../interface/auth.interface";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSessionUser: protectedProcedure.query(({ ctx }) => {
    const { email } = ctx.session.user;

    if (!email) throw new TRPCError({ code: "NOT_FOUND" });

    return ctx.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        role: true,
        email: true,
        image: true,
        name: true,
        password: false,
        trial: true,
        active: true,
        emailVerified: true,
        vendor: true,
        partner: true,
      },
    });
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "Authanticated";
  }),
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['VENDOR', 'PARTNER']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, role } = input;

      try {
        console.log({ email, password, role });

        const user = await ctx.prisma.user.create({
          data: {
            email: email,
            password: password,
            role: role,
            name: "vendor-name",
          },
        });

        if (role === UserRoles.VENDOR) {
          const vendor = await ctx.prisma.vendor.create({
            data: {
              userId: user.id,
              fname: "fname",
              lname: "lname",
            },
          });

          await ctx.prisma.user.update({
            where: { id: user.id },
            data: {
              vendor_id: vendor.id,
            },
          });
        } else if (role === UserRoles.PARTNER) {
          const partner = await ctx.prisma.partner.create({
            data: {
              userId: user.id,
              fname: "fname",
              lname: "lname",
            },
          });

          await ctx.prisma.user.update({
            where: { id: user.id },
            data: {
              partner_id: partner.id,
            },
          });
        }

        const resultUser = await ctx.prisma.user.findUnique({
          where: {
            email,
          },
          include: { vendor: role === UserRoles.VENDOR, partner: role === UserRoles.PARTNER },
        });

        return resultUser;
      } catch (error) {
        console.log(error);
      }
    }),
});
