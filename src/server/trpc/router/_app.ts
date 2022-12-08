import { router } from "../trpc";
import { authRouter } from "./auth";
import { linkRouter } from "./link";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  link: linkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
