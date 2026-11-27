import { adminRouter } from "@/features/admin/router";
import { accountRouter } from "@/features/account/router";
import { catalogRouter } from "@/features/catalog/router";
import { contentRouter } from "@/features/content/router";
import { dashboardRouter } from "@/features/dashboard/router";
import { linksRouter } from "@/features/links/router";
import { notificationsRouter } from "@/features/notifications/router";
import { paymentsRouter } from "@/features/payments/router";
import { productsRouter } from "@/features/products/router";
import { router } from "./init";

export const appRouter = router({
  account: accountRouter,
  admin: adminRouter,
  catalog: catalogRouter,
  content: contentRouter,
  dashboard: dashboardRouter,
  links: linksRouter,
  notifications: notificationsRouter,
  payments: paymentsRouter,
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
