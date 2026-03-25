import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { mealPlans } from "./meal-plans";

export const shoppingLists = pgTable("shopping_lists", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  mealPlanId: uuid("meal_plan_id")
    .notNull()
    .references(() => mealPlans.id, { onDelete: "cascade" }),
  totalEstimatedCost: numeric("total_estimated_cost", {
    precision: 10,
    scale: 2,
  }),
  meetsFreeDelivery: boolean("meets_free_delivery").default(false),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const shoppingListsRelations = relations(
  shoppingLists,
  ({ one, many }) => ({
    mealPlan: one(mealPlans, {
      fields: [shoppingLists.mealPlanId],
      references: [mealPlans.id],
    }),
    items: many(shoppingListItems),
  }),
);

import { shoppingListItems } from "./shopping-list-items";
