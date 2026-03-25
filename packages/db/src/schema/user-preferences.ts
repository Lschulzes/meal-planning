import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  householdSize: integer("household_size").default(1),
  dietaryRestrictions: text("dietary_restrictions").array(),
  allergies: text("allergies").array(),
  cuisinePreferences: text("cuisine_preferences").array(),
  dislikedIngredients: text("disliked_ingredients").array(),
  weeklyBudget: numeric("weekly_budget", { precision: 10, scale: 2 }),
  maxPrepTimeMinutes: integer("max_prep_time_minutes"),
  cookingSkill: text("cooking_skill"),
  preferredMealTypes: text("preferred_meal_types").array(),
  servingsPerMeal: integer("servings_per_meal").default(2),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
