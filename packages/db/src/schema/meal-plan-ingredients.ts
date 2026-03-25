import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { mealPlanItems } from "./meal-plan-items";
import { products } from "./products";

export const mealPlanIngredients = pgTable("meal_plan_ingredients", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  mealPlanItemId: uuid("meal_plan_item_id")
    .notNull()
    .references(() => mealPlanItems.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  ingredientName: text("ingredient_name").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  unit: text("unit"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  isPantryStaple: boolean("is_pantry_staple").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const mealPlanIngredientsRelations = relations(
  mealPlanIngredients,
  ({ one }) => ({
    mealPlanItem: one(mealPlanItems, {
      fields: [mealPlanIngredients.mealPlanItemId],
      references: [mealPlanItems.id],
    }),
    product: one(products, {
      fields: [mealPlanIngredients.productId],
      references: [products.id],
    }),
  }),
);
