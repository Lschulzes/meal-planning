import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { mealFeedback, mealPlanItems } from "@meal-planning/db/schema";

import { publicProcedure } from "../index";

export const feedbackRouter = {
  /** Submit feedback for a meal plan item */
  submit: publicProcedure
    .input(
      z.object({
        mealPlanItemId: z.string().uuid(),
        rating: z.number().min(1).max(5),
        wouldRepeat: z.boolean().optional(),
        difficultyRating: z.number().min(1).max(5).optional(),
        actualPrepTime: z.number().optional(),
        tasteNotes: z.string().optional(),
        improvementNotes: z.string().optional(),
        tooMuchFood: z.boolean().optional(),
        tooLittleFood: z.boolean().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const result = await context.db
        .insert(mealFeedback)
        .values({
          mealPlanItemId: input.mealPlanItemId,
          rating: input.rating,
          wouldRepeat: input.wouldRepeat ?? null,
          difficultyRating: input.difficultyRating ?? null,
          actualPrepTime: input.actualPrepTime ?? null,
          tasteNotes: input.tasteNotes ?? null,
          improvementNotes: input.improvementNotes ?? null,
          tooMuchFood: input.tooMuchFood ?? null,
          tooLittleFood: input.tooLittleFood ?? null,
        })
        .returning();

      return result[0]!;
    }),

  /** Get all feedback for a meal plan */
  getByPlanId: publicProcedure
    .input(z.object({ mealPlanId: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      return context.db
        .select({
          feedback: mealFeedback,
          item: mealPlanItems,
        })
        .from(mealFeedback)
        .innerJoin(
          mealPlanItems,
          eq(mealFeedback.mealPlanItemId, mealPlanItems.id),
        )
        .where(eq(mealPlanItems.mealPlanId, input.mealPlanId))
        .orderBy(mealPlanItems.dayOfWeek);
    }),

  /** Get feedback history across all plans */
  history: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
        })
        .optional(),
    )
    .handler(async ({ context, input }) => {
      return context.db
        .select({
          feedback: mealFeedback,
          item: mealPlanItems,
        })
        .from(mealFeedback)
        .innerJoin(
          mealPlanItems,
          eq(mealFeedback.mealPlanItemId, mealPlanItems.id),
        )
        .orderBy(desc(mealFeedback.createdAt))
        .limit(input?.limit ?? 50);
    }),
};
