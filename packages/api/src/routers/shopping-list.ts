import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  shoppingLists,
  shoppingListItems,
  mealPlanIngredients,
  mealPlanItems,
} from "@meal-planning/db/schema";

import { publicProcedure } from "../index";

export const shoppingListRouter = {
  /** Get shopping list for a meal plan */
  getByPlanId: publicProcedure
    .input(z.object({ mealPlanId: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      const list = await context.db.query.shoppingLists.findFirst({
        where: eq(shoppingLists.mealPlanId, input.mealPlanId),
        with: {
          items: true,
        },
      });

      return list ?? null;
    }),

  /** Generate a shopping list from a meal plan's ingredients */
  generate: publicProcedure
    .input(z.object({ mealPlanId: z.string().uuid() }))
    .handler(async ({ context, input }) => {
      return context.db.transaction(async (tx) => {
        // Delete existing shopping list for this plan
        await tx
          .delete(shoppingLists)
          .where(eq(shoppingLists.mealPlanId, input.mealPlanId));

        // Get all ingredients for this plan's items
        const items = await tx
          .select({
            ingredient: mealPlanIngredients,
          })
          .from(mealPlanIngredients)
          .innerJoin(
            mealPlanItems,
            eq(mealPlanIngredients.mealPlanItemId, mealPlanItems.id),
          )
          .where(eq(mealPlanItems.mealPlanId, input.mealPlanId));

        // Aggregate by product (or ingredient name if no product linked)
        const aggregated = new Map<
          string,
          {
            productId: string | null;
            productName: string;
            totalCost: number;
            notes: string[];
          }
        >();

        for (const { ingredient } of items) {
          if (ingredient.isPantryStaple) continue;

          const key = ingredient.productId ?? ingredient.ingredientName;
          const existing = aggregated.get(key);

          if (existing) {
            existing.totalCost += Number(ingredient.estimatedCost ?? 0);
          } else {
            aggregated.set(key, {
              productId: ingredient.productId,
              productName: ingredient.ingredientName,
              totalCost: Number(ingredient.estimatedCost ?? 0),
              notes: [],
            });
          }
        }

        const totalCost = Array.from(aggregated.values()).reduce(
          (sum, item) => sum + item.totalCost,
          0,
        );
        const meetsFreeDelivery = totalCost >= 50;

        const [list] = await tx
          .insert(shoppingLists)
          .values({
            mealPlanId: input.mealPlanId,
            totalEstimatedCost: String(totalCost.toFixed(2)),
            meetsFreeDelivery,
            status: "pending",
          })
          .returning();

        for (const item of aggregated.values()) {
          await tx.insert(shoppingListItems).values({
            shoppingListId: list!.id,
            productId: item.productId,
            productName: item.productName,
            quantity: 1,
            estimatedCost: String(item.totalCost.toFixed(2)),
            purchased: false,
            notes: item.notes.length > 0 ? item.notes.join("; ") : null,
          });
        }

        return tx.query.shoppingLists.findFirst({
          where: eq(shoppingLists.id, list!.id),
          with: { items: true },
        });
      });
    }),

  /** Toggle an item as purchased/unpurchased */
  toggleItem: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        purchased: z.boolean(),
      }),
    )
    .handler(async ({ context, input }) => {
      const result = await context.db
        .update(shoppingListItems)
        .set({ purchased: input.purchased })
        .where(eq(shoppingListItems.id, input.id))
        .returning();

      return result[0] ?? null;
    }),
};
