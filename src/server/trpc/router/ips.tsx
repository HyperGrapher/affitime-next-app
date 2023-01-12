// import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { z } from "zod";


export const userIpsRouter = router({

    createIp: protectedProcedure
        .input(
            z.object({
                ip: z.string(),
                country: z.string(),
                ipInfo: z.object({
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

            })
        )
        .mutation(async ({ ctx, input }) => {
            const { vendorId, partnerId, id } = ctx.session;

            try {

                await ctx.prisma.userIps.create({
                    data: {
                        ip: input.ip,
                        country: input.country,
                        user_id: id,
                        partner_id: partnerId,
                        vendor_id: vendorId,
                        ipInfo: input.ipInfo

                    },
                });

                return { success: true, error: false };
            } catch (error) {
                console.error(error);
                return { success: false, error: error };
            }
        }),
})