/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

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
        role: z.string(),
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

        if (role === "vendor") {
          const vendor = await ctx.prisma.vendor.create({
            data: {
              userId: user.id,
              fname: "fname",
              lname: "lname",
            },
          });
        } else if (role === "partner") {
          const partner = await ctx.prisma.partner.create({
            data: {
              userId: user.id,
              fname: "fname",
              lname: "lname",
            },
          });
        }

        const resultUser = await ctx.prisma.user.findUnique({
          where: {
            email,
          },
          include: { vendor: role === "vendor", partner: role === "partner" },
        });

        return resultUser;
      } catch (error) {
        console.log(error);
      }
    }),
});
