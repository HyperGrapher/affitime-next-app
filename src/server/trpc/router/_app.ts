import { router } from "../trpc";
import { authRouter } from "./auth";
import { linkRouter } from "./link";
import { notificationRouter } from "./notifications";
import { productRouter } from "./product";
import { userRouter } from "./user";
import { userIpsRouter } from "./ips";
import { dashboardRouter } from "./dashboard";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  link: linkRouter,
  product: productRouter,
  notifications: notificationRouter,
  ips: userIpsRouter,
  dashboard: dashboardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
