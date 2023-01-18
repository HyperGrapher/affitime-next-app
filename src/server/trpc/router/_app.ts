import { router } from "../trpc";
import { authRouter } from "./auth";
import { linkRouter } from "./link";
import { notificationRouter } from "./notifications";
import { productRouter } from "./product";
import { userRouter } from "./user";
import { userIpsRouter } from "./ips";
import { VendorDashboardRouter } from "./dashboard_vendor";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  link: linkRouter,
  product: productRouter,
  notifications: notificationRouter,
  ips: userIpsRouter,
  dashboardVendor: VendorDashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
