import {
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { mealPlans } from "./meal-plans";

export const mealPlanItems = pgTable("meal_plan_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  mealPlanId: uuid("meal_plan_id")
    .notNull()
    .references(() => mealPlans.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  mealType: text("meal_type").notNull(),
  recipeName: text("recipe_name").notNull(),
  recipeDescription: text("recipe_description"),
  recipeInstructions: jsonb("recipe_instructions"),
  cuisineType: text("cuisine_type"),
  prepTimeMinutes: integer("prep_time_minutes"),
  cookTimeMinutes: integer("cook_time_minutes"),
  servings: integer("servings"),
  estimatedCalories: integer("estimated_calories"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const mealPlanItemsRelations = relations(
  mealPlanItems,
  ({ one, many }) => ({
    mealPlan: one(mealPlans, {
      fields: [mealPlanItems.mealPlanId],
      references: [mealPlans.id],
    }),
    ingredients: many(mealPlanIngredients),
    feedback: many(mealFeedback),
  }),
);

import { mealPlanIngredients } from "./meal-plan-ingredients";
import { mealFeedback } from "./meal-feedback";
