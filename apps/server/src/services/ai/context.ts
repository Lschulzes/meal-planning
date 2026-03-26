import { db } from "@meal-planning/db";
import {
  userPreferences,
  mealPlans,
  mealPlanItems,
  mealFeedback,
  products,
} from "@meal-planning/db/schema";
import { desc, eq, gte, isNotNull, inArray, or, ilike } from "drizzle-orm";
import type {
  UserContext,
  MealHistoryEntry,
  FeedbackSummary,
  ProductInfo,
} from "./prompts.js";

// ---------------------------------------------------------------------------
// Defaults used when the database has no preferences row yet.
// ---------------------------------------------------------------------------

const DEFAULT_USER_CONTEXT: UserContext = {
  householdSize: 2,
  dietaryRestrictions: [],
  allergies: [],
  cuisinePreferences: [],
  dislikedIngredients: [],
  weeklyBudget: 150,
  maxPrepTimeMinutes: 60,
  cookingSkill: "intermediate",
  preferredMealTypes: ["breakfast", "lunch", "dinner"],
  servingsPerMeal: 2,
  notes: null,
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Loads the first user-preferences row from the database and maps it into
 * the {@link UserContext} shape consumed by prompt builders.
 *
 * Falls back to sensible defaults when no row exists or a column is null.
 */
export async function buildUserContext(): Promise<UserContext> {
  const rows = await db
    .select()
    .from(userPreferences)
    .limit(1);

  const row = rows[0];
  if (!row) {
    return { ...DEFAULT_USER_CONTEXT };
  }

  return {
    householdSize: row.householdSize ?? DEFAULT_USER_CONTEXT.householdSize,
    dietaryRestrictions: row.dietaryRestrictions ?? DEFAULT_USER_CONTEXT.dietaryRestrictions,
    allergies: row.allergies ?? DEFAULT_USER_CONTEXT.allergies,
    cuisinePreferences: row.cuisinePreferences ?? DEFAULT_USER_CONTEXT.cuisinePreferences,
    dislikedIngredients: row.dislikedIngredients ?? DEFAULT_USER_CONTEXT.dislikedIngredients,
    weeklyBudget: row.weeklyBudget
      ? parseFloat(row.weeklyBudget)
      : DEFAULT_USER_CONTEXT.weeklyBudget,
    maxPrepTimeMinutes: row.maxPrepTimeMinutes ?? DEFAULT_USER_CONTEXT.maxPrepTimeMinutes,
    cookingSkill: row.cookingSkill ?? DEFAULT_USER_CONTEXT.cookingSkill,
    preferredMealTypes: row.preferredMealTypes ?? DEFAULT_USER_CONTEXT.preferredMealTypes,
    servingsPerMeal: row.servingsPerMeal ?? DEFAULT_USER_CONTEXT.servingsPerMeal,
    notes: row.notes ?? null,
  };
}

/**
 * Retrieves meal-plan items from the most recent N weeks and formats them
 * as {@link MealHistoryEntry} objects for the concept prompt.
 *
 * @param weeks - How many weeks of history to look back (default 4).
 */
export async function buildMealHistory(weeks = 4): Promise<MealHistoryEntry[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeks * 7);
  const cutoffStr = cutoff.toISOString().split("T")[0] as string;

  const plans = await db
    .select({
      weekStartDate: mealPlans.weekStartDate,
      recipeName: mealPlanItems.recipeName,
      cuisineType: mealPlanItems.cuisineType,
      mealPlanItemId: mealPlanItems.id,
    })
    .from(mealPlans)
    .innerJoin(mealPlanItems, eq(mealPlanItems.mealPlanId, mealPlans.id))
    .where(gte(mealPlans.weekStartDate, cutoffStr))
    .orderBy(desc(mealPlans.weekStartDate));

  // Collect all item IDs so we can batch-fetch feedback
  const itemIds = plans.map((p) => p.mealPlanItemId);

  let feedbackMap: Map<string, number> = new Map();
  if (itemIds.length > 0) {
    const feedbackRows = await db
      .select({
        mealPlanItemId: mealFeedback.mealPlanItemId,
        rating: mealFeedback.rating,
      })
      .from(mealFeedback)
      .where(inArray(mealFeedback.mealPlanItemId, itemIds));

    feedbackMap = new Map(
      feedbackRows
        .filter((r) => r.rating !== null)
        .map((r) => [r.mealPlanItemId, r.rating as number]),
    );
  }

  return plans.map((row) => ({
    name: row.recipeName,
    cuisineType: row.cuisineType ?? "Unknown",
    rating: feedbackMap.get(row.mealPlanItemId),
    weekDate: row.weekStartDate,
  }));
}

/**
 * Aggregates meal feedback into loved (rating >= 4) and disliked (rating <= 2)
 * buckets for the concept prompt.
 */
export async function buildFeedbackSummary(): Promise<FeedbackSummary> {
  const rows = await db
    .select({
      recipeName: mealPlanItems.recipeName,
      rating: mealFeedback.rating,
      tasteNotes: mealFeedback.tasteNotes,
    })
    .from(mealFeedback)
    .innerJoin(mealPlanItems, eq(mealPlanItems.id, mealFeedback.mealPlanItemId))
    .where(isNotNull(mealFeedback.rating));

  const lovedMeals: FeedbackSummary["lovedMeals"] = [];
  const dislikedMeals: FeedbackSummary["dislikedMeals"] = [];

  for (const row of rows) {
    if (row.rating === null) continue;
    const entry = {
      name: row.recipeName,
      rating: row.rating,
      notes: row.tasteNotes ?? undefined,
    };
    if (row.rating >= 4) {
      lovedMeals.push(entry);
    } else if (row.rating <= 2) {
      dislikedMeals.push(entry);
    }
  }

  return { lovedMeals, dislikedMeals };
}

/**
 * Queries the product catalog and returns a lightweight list of
 * {@link ProductInfo} objects suitable for inclusion in prompts.
 *
 * @param tags        - Optional tag filters (matched with OR).
 * @param searchTerms - Optional search terms matched against the product name (ILIKE).
 */
export async function buildProductContext(
  tags?: string[],
  searchTerms?: string[],
): Promise<ProductInfo[]> {
  const conditions = [];

  if (tags && tags.length > 0) {
    // Match any product whose tags array overlaps with the requested tags.
    // Drizzle doesn't have a native arrayOverlaps for all drivers, so we
    // fall back to checking each tag with OR + ilike on the name as a proxy.
    for (const tag of tags) {
      conditions.push(ilike(products.name, `%${tag}%`));
    }
  }

  if (searchTerms && searchTerms.length > 0) {
    for (const term of searchTerms) {
      conditions.push(ilike(products.name, `%${term}%`));
    }
  }

  const query = db
    .select({
      productId: products.samsclubProductId,
      name: products.name,
      brand: products.brand,
      price: products.price,
      unitSize: products.unitSize,
      inStock: products.inStock,
    })
    .from(products);

  const rows =
    conditions.length > 0
      ? await query.where(or(...conditions)).limit(200)
      : await query.limit(200);

  return rows.map((row) => ({
    productId: row.productId,
    name: row.name,
    brand: row.brand ?? null,
    price: row.price ? parseFloat(row.price) : 0,
    unitSize: row.unitSize ?? null,
    inStock: row.inStock ?? true,
  }));
}
