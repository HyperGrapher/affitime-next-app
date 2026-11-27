import { partnerProcedure, router, staffProcedure, vendorProcedure } from "@/server/trpc/init";
import { adminDashboard, partnerDashboard, vendorDashboard } from "./service";

export const dashboardRouter = router({
  vendor: vendorProcedure.query(({ ctx }) => vendorDashboard(ctx.db, ctx.vendor.id)),
  partner: partnerProcedure.query(({ ctx }) => partnerDashboard(ctx.db, ctx.partner.id)),
  admin: staffProcedure.query(({ ctx }) => adminDashboard(ctx.db)),
});
