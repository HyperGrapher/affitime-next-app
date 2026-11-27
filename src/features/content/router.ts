import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router, staffProcedure } from "@/server/trpc/init";
import { dbRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { pageInput, skipTake, toPage } from "@/lib/pagination";
import { sendTemplatedEmail } from "@/server/services/email";
import { contactInput, faqInput } from "./schemas";

export const contentRouter = router({
  faq: publicProcedure.query(({ ctx }) => ctx.db.faq.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { id: "asc" }] })),
  submitContact: publicProcedure.input(contactInput).mutation(async ({ ctx, input }) => {
    if (input.website) return { ok: true }; // honeypot hit: pretend success
    if (!(await dbRateLimit(`contact:${getClientIp(ctx.headers)}`, 5, 3600))) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    await ctx.db.contactMessage.create({ data: { name: input.name, email: input.email, subject: input.subject, message: input.message } });
    await sendTemplatedEmail("CONTACT_RECEIPT", input.email, { name: input.name }, input.name);
    return { ok: true };
  }),

  // admin
  faqAll: adminProcedure.query(({ ctx }) => ctx.db.faq.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] })),
  faqSave: adminProcedure.input(faqInput.extend({ id: z.number().int().optional() })).mutation(({ ctx, input }) => {
    const { id, ...data } = input;
    return id ? ctx.db.faq.update({ where: { id }, data }) : ctx.db.faq.create({ data });
  }),
  faqDelete: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => ctx.db.faq.delete({ where: { id: input.id } })),
  messages: staffProcedure.input(pageInput.extend({ handled: z.boolean().optional() })).query(async ({ ctx, input }) => {
    const where = input.handled === undefined ? {} : { handled: input.handled };
    const [items, total] = await Promise.all([ctx.db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, ...skipTake(input) }), ctx.db.contactMessage.count({ where })]);
    return toPage(items, total, input);
  }),
  messageHandled: staffProcedure.input(z.object({ id: z.string(), handled: z.boolean() })).mutation(({ ctx, input }) => ctx.db.contactMessage.update({ where: { id: input.id }, data: { handled: input.handled } })),
});
