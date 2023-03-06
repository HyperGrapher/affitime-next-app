import { router, partnerProcedure } from "../trpc";
import { z } from "zod";

export const partnerRouter = router({
  updateInterests: partnerProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          checked: z.boolean(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const { partnerId } = ctx.session;

      console.log({ partnerId });
      console.log(input);

      try {
        await ctx.prisma.partner.update({
          where: { id: partnerId },
          data: {
            interests: { input },
          },
        });

        return { success: true, error: false };
      } catch (error) {
        console.error(error);
        return { success: false, error: error };
      }
    }),
});
