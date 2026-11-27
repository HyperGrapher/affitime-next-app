import { publicProcedure, router } from "@/server/trpc/init";
import { listCategories, listTags } from "./service";

export const catalogRouter = router({
  categories: publicProcedure.query(({ ctx }) => listCategories(ctx.db)),
  tags: publicProcedure.query(({ ctx }) => listTags(ctx.db)),
});
