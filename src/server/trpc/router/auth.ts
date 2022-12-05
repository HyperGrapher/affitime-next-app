/* eslint-disable @typescript-eslint/no-unused-vars */
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "Secret message!";
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
        console.log({ email, password, role } );
       
        return await ctx.prisma.user.create({
          data: {
            email: email,
            password: password,
            role: role,
            name: "vendor-name",
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
});
