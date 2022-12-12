/* eslint-disable @typescript-eslint/no-unused-vars */
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const linkRouter = router({
  // TODO: To be implemented
  getLinkById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;

      if (!id) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.prisma.link.findUnique({
        where: {
          id,
        },
      });
    }),
  // TODO: To be implemented
  createLink: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        city: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = ctx.session.user;

      const data = input;

      if (!email)
        throw new TRPCError({ code: "NOT_FOUND", message: "Email not found" });

      if (!data)
        throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });

      try {
        await ctx.prisma.user.findUnique({
          where: { email },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),

  // TODO: To be implemented
  updateLink: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = input;

      if (!data)
        throw new TRPCError({ code: "NOT_FOUND", message: "IP not found" });
      // https://www.prisma.io/docs/concepts/components/prisma-client/crud#update-a-number-field
      try {
        await ctx.prisma.link.update({
          where: { id: "" },
          data: {
            count: {
              increment: 1,
            },
          },
        });

        return { error: false, message: "ok" };
      } catch (error) {
        return { error: true, message: "" };
      }
    }),
});
