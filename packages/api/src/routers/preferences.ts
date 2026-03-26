import { z } from "zod";
import { eq } from "drizzle-orm";
import { userPreferences } from "@meal-planning/db/schema";

import { publicProcedure } from "../index";

export const preferencesRouter = {
  /** Get current user preferences (first row) */
  get: publicProcedure.handler(async ({ context }) => {
    const result = await context.db
      .select()
      .from(userPreferences)
      .limit(1);

    return result[0] ?? null;
  }),

  /** Update preferences (partial update) */
  update: publicProcedure
    .input(
      z.object({
        householdSize: z.number().min(1).max(20).optional(),
        dietaryRestrictions: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        cuisinePreferences: z.array(z.string()).optional(),
        dislikedIngredients: z.array(z.string()).optional(),
        weeklyBudget: z.number().min(0).optional(),
        maxPrepTimeMinutes: z.number().min(5).max(480).optional(),
        cookingSkill: z
          .enum(["beginner", "intermediate", "advanced"])
          .optional(),
        preferredMealTypes: z.array(z.string()).optional(),
        servingsPerMeal: z.number().min(1).max(20).optional(),
        notes: z.string().nullable().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const existing = await context.db
        .select()
        .from(userPreferences)
        .limit(1);

      const updates: Record<string, unknown> = { updatedAt: new Date() };

      if (input.householdSize !== undefined)
        updates.householdSize = input.householdSize;
      if (input.dietaryRestrictions !== undefined)
        updates.dietaryRestrictions = input.dietaryRestrictions;
      if (input.allergies !== undefined) updates.allergies = input.allergies;
      if (input.cuisinePreferences !== undefined)
        updates.cuisinePreferences = input.cuisinePreferences;
      if (input.dislikedIngredients !== undefined)
        updates.dislikedIngredients = input.dislikedIngredients;
      if (input.weeklyBudget !== undefined)
        updates.weeklyBudget = String(input.weeklyBudget);
      if (input.maxPrepTimeMinutes !== undefined)
        updates.maxPrepTimeMinutes = input.maxPrepTimeMinutes;
      if (input.cookingSkill !== undefined)
        updates.cookingSkill = input.cookingSkill;
      if (input.preferredMealTypes !== undefined)
        updates.preferredMealTypes = input.preferredMealTypes;
      if (input.servingsPerMeal !== undefined)
        updates.servingsPerMeal = input.servingsPerMeal;
      if (input.notes !== undefined) updates.notes = input.notes;

      if (existing.length === 0) {
        const result = await context.db
          .insert(userPreferences)
          .values(updates as typeof userPreferences.$inferInsert)
          .returning();
        return result[0]!;
      }

      const result = await context.db
        .update(userPreferences)
        .set(updates)
        .where(eq(userPreferences.id, existing[0]!.id))
        .returning();

      return result[0]!;
    }),

  /** Reset preferences to defaults */
  reset: publicProcedure.handler(async ({ context }) => {
    await context.db.delete(userPreferences);

    const result = await context.db
      .insert(userPreferences)
      .values({
        householdSize: 2,
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: ["american", "mexican", "italian", "asian"],
        dislikedIngredients: [],
        weeklyBudget: "150.00",
        maxPrepTimeMinutes: 45,
        cookingSkill: "intermediate",
        preferredMealTypes: ["dinner"],
        servingsPerMeal: 2,
        notes: null,
      })
      .returning();

    return result[0]!;
  }),
};
