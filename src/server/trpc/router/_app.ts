import { router } from "../trpc";
import { authRouter } from "./auth";
import { linkRouter } from "./link";
import { notificationRouter } from "./notifications";
import { productRouter } from "./product";
import { userRouter } from "./user";
import { userIpsRouter } from "./ips";
import { VendorDashboardRouter } from "./dashboard_vendor";
import { visitRouter } from "./visit";
import { PaymentsRouter } from "./payments";
import { PartnerDashboardRouter } from "./dashboard_partner";
import { partnerRouter } from "./partner";
import { purchaseRouter } from "./purchase";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  partner: partnerRouter,
  link: linkRouter,
  product: productRouter,
  notifications: notificationRouter,
  ips: userIpsRouter,
  dashboardVendor: VendorDashboardRouter,
  dashboardPartner: PartnerDashboardRouter,
  visit: visitRouter,
  payments: PaymentsRouter,
  purchase: purchaseRouter,
});

export type AppRouter = typeof appRouter;
