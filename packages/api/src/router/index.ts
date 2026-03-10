import { router } from "../trpc";
import { authRouter } from "./auth";
import { productRouter } from "./product";
import { orderRouter } from "./order";

export const appRouter = router({
  auth: authRouter,
  product: productRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
