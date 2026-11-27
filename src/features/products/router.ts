import { z } from "zod";
import { activeVendorProcedure, authedProcedure, publicProcedure, router, vendorProcedure } from "@/server/trpc/init";
import { productInput, productListInput } from "./schemas";
import { archiveProduct, browseProducts, createProduct, getPublicProduct, getVendorProduct, listVendorProducts, updateProduct } from "./service";
import { TRPCError } from "@trpc/server";

export const productsRouter = router({
  /** Marketplace for signed-in partners (and vendors browsing). */
  browse: authedProcedure.input(productListInput).query(({ ctx, input }) => browseProducts(ctx.db, input)),
  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const p = await getPublicProduct(ctx.db, input.id);
    if (!p) throw new TRPCError({ code: "NOT_FOUND" });
    return p;
  }),
  listMine: vendorProcedure.input(productListInput).query(({ ctx, input }) => listVendorProducts(ctx.db, ctx.vendor.id, input)),
  getMine: vendorProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => getVendorProduct(ctx.db, ctx.vendor.id, input.id)),
  create: activeVendorProcedure.input(productInput).mutation(({ ctx, input }) => createProduct(ctx.db, ctx.vendor, input)),
  update: activeVendorProcedure.input(productInput.and(z.object({ id: z.string() }))).mutation(({ ctx, input }) => updateProduct(ctx.db, ctx.vendor.id, input.id, input)),
  archive: vendorProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => archiveProduct(ctx.db, ctx.vendor.id, input.id)),
});
