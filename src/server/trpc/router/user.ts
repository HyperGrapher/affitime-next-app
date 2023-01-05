/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

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
        console.log(error);

        return { error: true, message: "IP upsert failed" };
      }
    }),
});
