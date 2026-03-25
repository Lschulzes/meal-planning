import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { mealPlanItems } from "./meal-plan-items";

export const mealFeedback = pgTable("meal_feedback", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  mealPlanItemId: uuid("meal_plan_item_id")
    .notNull()
    .references(() => mealPlanItems.id, { onDelete: "cascade" }),
  rating: integer("rating"),
  wouldRepeat: boolean("would_repeat"),
  difficultyRating: integer("difficulty_rating"),
  actualPrepTime: integer("actual_prep_time"),
  tasteNotes: text("taste_notes"),
  improvementNotes: text("improvement_notes"),
  tooMuchFood: boolean("too_much_food"),
  tooLittleFood: boolean("too_little_food"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const mealFeedbackRelations = relations(mealFeedback, ({ one }) => ({
  mealPlanItem: one(mealPlanItems, {
    fields: [mealFeedback.mealPlanItemId],
    references: [mealPlanItems.id],
  }),
}));
