import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import {
  mealPlans,
  mealPlanItems,
  mealPlanIngredients,
} from "@meal-planning/db/schema";

import { publicProcedure } from "../index";

export const mealPlansRouter = {
  /** List all meal plans, newest first */
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .handler(async ({ context, input }) => {
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;

      return context.db
        .select()
        .from(mealPlans)
        .orderBy(desc(mealPlans.weekStartDate))
        .limit(limit)
        .offset(offset);
    }),

  /** Get full plan with items, ingredients, and shopping list */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const plan = await context.db.query.mealPlans.findFirst({
        where: eq(mealPlans.id, input.id),
        with: {
          items: {
            with: {
              ingredients: true,
            },
          },
          shoppingList: {
            with: {
              items: true,
            },
          },
        },
      });

      return plan ?? null;
    }),

  /** Save a finalized meal plan to DB */
  create: publicProcedure
    .input(
      z.object({
        weekStartDate: z.string(),
        aiModelUsed: z.string().optional(),
        aiPromptContext: z.unknown().optional(),
        totalEstimatedCost: z.number().optional(),
        items: z.array(
          z.object({
            dayOfWeek: z.number().min(0).max(6),
            mealType: z.string(),
            recipeName: z.string(),
            recipeDescription: z.string().optional(),
            recipeInstructions: z.unknown().optional(),
            cuisineType: z.string().optional(),
            prepTimeMinutes: z.number().optional(),
            cookTimeMinutes: z.number().optional(),
            servings: z.number().optional(),
            estimatedCalories: z.number().optional(),
            estimatedCost: z.number().optional(),
            ingredients: z
              .array(
                z.object({
                  productId: z.string().uuid().nullable().optional(),
                  ingredientName: z.string(),
                  quantity: z.number().optional(),
                  unit: z.string().optional(),
                  estimatedCost: z.number().optional(),
                  isPantryStaple: z.boolean().optional(),
                }),
              )
              .optional(),
          }),
        ),
      }),
    )
    .handler(async ({ context, input }) => {
      return context.db.transaction(async (tx) => {
        const [plan] = await tx
          .insert(mealPlans)
          .values({
            weekStartDate: input.weekStartDate,
            status: "draft",
            totalEstimatedCost: input.totalEstimatedCost
              ? String(input.totalEstimatedCost)
              : null,
            aiModelUsed: input.aiModelUsed ?? null,
            aiPromptContext: input.aiPromptContext ?? null,
          })
          .returning();

        for (const item of input.items) {
          const [planItem] = await tx
            .insert(mealPlanItems)
            .values({
              mealPlanId: plan!.id,
              dayOfWeek: item.dayOfWeek,
              mealType: item.mealType,
              recipeName: item.recipeName,
              recipeDescription: item.recipeDescription ?? null,
              recipeInstructions: item.recipeInstructions ?? null,
              cuisineType: item.cuisineType ?? null,
              prepTimeMinutes: item.prepTimeMinutes ?? null,
              cookTimeMinutes: item.cookTimeMinutes ?? null,
              servings: item.servings ?? null,
              estimatedCalories: item.estimatedCalories ?? null,
              estimatedCost: item.estimatedCost
                ? String(item.estimatedCost)
                : null,
            })
            .returning();

          if (item.ingredients) {
            for (const ing of item.ingredients) {
              await tx.insert(mealPlanIngredients).values({
                mealPlanItemId: planItem!.id,
                productId: ing.productId ?? null,
                ingredientName: ing.ingredientName,
                quantity: ing.quantity ? String(ing.quantity) : null,
                unit: ing.unit ?? null,
                estimatedCost: ing.estimatedCost
                  ? String(ing.estimatedCost)
                  : null,
                isPantryStaple: ing.isPantryStaple ?? false,
              });
            }
          }
        }

        return plan;
      });
    }),

  /** Update plan status */
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["draft", "active", "completed"]),
      }),
    )
    .handler(async ({ context, input }) => {
      const result = await context.db
        .update(mealPlans)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(mealPlans.id, input.id))
        .returning();

      return result[0] ?? null;
    }),

  /** Delete a meal plan */
  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      await context.db
        .delete(mealPlans)
        .where(eq(mealPlans.id, input.id));

      return { success: true };
    }),
};
