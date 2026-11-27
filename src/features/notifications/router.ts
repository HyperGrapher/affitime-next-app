import { z } from "zod";
import { authedProcedure, router } from "@/server/trpc/init";
import { pageInput } from "@/lib/pagination";
import { listNotifications, markAllRead, markRead, unreadCount } from "./service";

export const notificationsRouter = router({
  list: authedProcedure
    .input(pageInput.extend({ unreadOnly: z.boolean().optional() }))
    .query(({ ctx, input }) => listNotifications(ctx.db, ctx.viewer.userId, input)),
  unreadCount: authedProcedure.query(({ ctx }) => unreadCount(ctx.db, ctx.viewer.userId)),
  markRead: authedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => markRead(ctx.db, ctx.viewer.userId, input.id)),
  markAllRead: authedProcedure.mutation(({ ctx }) => markAllRead(ctx.db, ctx.viewer.userId)),
});
