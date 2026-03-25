import {
  date,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mealPlans = pgTable("meal_plans", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weekStartDate: date("week_start_date").notNull(),
  status: text("status").default("draft"),
  totalEstimatedCost: numeric("total_estimated_cost", {
    precision: 10,
    scale: 2,
  }),
  aiModelUsed: text("ai_model_used"),
  aiPromptContext: jsonb("ai_prompt_context"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const mealPlansRelations = relations(mealPlans, ({ many, one }) => ({
  items: many(mealPlanItems),
  shoppingList: one(shoppingLists, {
    fields: [mealPlans.id],
    references: [shoppingLists.mealPlanId],
  }),
}));

import { mealPlanItems } from "./meal-plan-items";
import { shoppingLists } from "./shopping-lists";
