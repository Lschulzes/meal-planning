import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { productsRouter } from "./products";
import { preferencesRouter } from "./preferences";
import { mealPlansRouter } from "./meal-plans";
import { shoppingListRouter } from "./shopping-list";
import { feedbackRouter } from "./feedback";
import { adminRouter } from "./admin";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  products: productsRouter,
  preferences: preferencesRouter,
  mealPlans: mealPlansRouter,
  shoppingList: shoppingListRouter,
  feedback: feedbackRouter,
  admin: adminRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
