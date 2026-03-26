// ---------------------------------------------------------------------------
// Context types consumed by prompt builders
// ---------------------------------------------------------------------------

/** User's meal-planning preferences as stored in the database. */
export interface UserContext {
  householdSize: number;
  dietaryRestrictions: string[];
  allergies: string[];
  cuisinePreferences: string[];
  dislikedIngredients: string[];
  weeklyBudget: number;
  maxPrepTimeMinutes: number;
  cookingSkill: string;
  preferredMealTypes: string[];
  servingsPerMeal: number;
  notes: string | null;
}

/** A single meal from a previous week's plan. */
export interface MealHistoryEntry {
  name: string;
  cuisineType: string;
  rating?: number;
  weekDate: string;
}

/** Aggregated feedback from past meal plans. */
export interface FeedbackSummary {
  lovedMeals: Array<{ name: string; rating: number; notes?: string }>;
  dislikedMeals: Array<{ name: string; rating: number; notes?: string }>;
}

/** A Sam's Club product available for ingredient matching. */
export interface ProductInfo {
  productId: string;
  name: string;
  brand: string | null;
  price: number;
  unitSize: string | null;
  inStock: boolean;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function formatList(items: string[]): string {
  if (items.length === 0) return "None";
  return items.join(", ");
}

function formatMealHistory(history: MealHistoryEntry[]): string {
  if (history.length === 0) return "No previous meal history available.";

  return history
    .map((entry) => {
      const rating = entry.rating !== undefined ? ` (rated ${entry.rating}/5)` : "";
      return `- ${entry.name} [${entry.cuisineType}]${rating} — week of ${entry.weekDate}`;
    })
    .join("\n");
}

function formatFeedback(feedback: FeedbackSummary): string {
  const parts: string[] = [];

  if (feedback.lovedMeals.length > 0) {
    parts.push("Loved meals:");
    for (const meal of feedback.lovedMeals) {
      const notes = meal.notes ? ` — "${meal.notes}"` : "";
      parts.push(`  + ${meal.name} (${meal.rating}/5)${notes}`);
    }
  }

  if (feedback.dislikedMeals.length > 0) {
    parts.push("Disliked meals:");
    for (const meal of feedback.dislikedMeals) {
      const notes = meal.notes ? ` — "${meal.notes}"` : "";
      parts.push(`  - ${meal.name} (${meal.rating}/5)${notes}`);
    }
  }

  return parts.length > 0 ? parts.join("\n") : "No feedback available yet.";
}

function formatUserPreferences(ctx: UserContext): string {
  return [
    `Household size: ${ctx.householdSize}`,
    `Servings per meal: ${ctx.servingsPerMeal}`,
    `Weekly budget: $${ctx.weeklyBudget.toFixed(2)}`,
    `Max prep time: ${ctx.maxPrepTimeMinutes} minutes`,
    `Cooking skill: ${ctx.cookingSkill}`,
    `Dietary restrictions: ${formatList(ctx.dietaryRestrictions)}`,
    `Allergies: ${formatList(ctx.allergies)}`,
    `Cuisine preferences: ${formatList(ctx.cuisinePreferences)}`,
    `Disliked ingredients: ${formatList(ctx.dislikedIngredients)}`,
    `Preferred meal types: ${formatList(ctx.preferredMealTypes)}`,
    ctx.notes ? `Additional notes: ${ctx.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Concept generation prompt
// ---------------------------------------------------------------------------

const CONCEPT_SYSTEM_PROMPT = `You are an expert meal-planning assistant. Your job is to generate a week of meal concepts (breakfast, lunch, dinner, and optional snacks) for a household.

RULES:
1. Budget constraints — The total estimated cost for all meals must stay within the weekly budget. Estimate ingredient costs realistically for Sam's Club bulk pricing.
2. Variety — Do NOT repeat the same cuisine type more than twice in a week. Avoid repeating meals that appeared in the recent history unless the user loved them (rated 4+).
3. Ingredient reuse — Maximize ingredient overlap between meals to reduce waste and cost. For example, if one meal uses chicken breast, plan another meal that also uses chicken breast.
4. Dietary compliance — Strictly respect all dietary restrictions and allergies. Never suggest meals containing allergens or restricted foods.
5. Prep time — Every meal must be preparable within the user's max prep time limit.
6. Skill level — Match recipe complexity to the user's cooking skill level (beginner, intermediate, advanced).
7. Balance — Include a good mix of proteins, vegetables, and grains across the week.
8. Feedback — Incorporate user feedback: lean toward meals similar to loved ones, avoid patterns similar to disliked ones.

DAYS: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday.

Respond by calling the provided tool with your structured meal concepts.`;

/**
 * Builds the system and user prompts for the meal-concept generation step.
 *
 * @param userContext - The user's preferences and constraints.
 * @param mealHistory - Recent meal history for variety enforcement.
 * @param feedback    - Aggregated feedback from previous plans.
 * @returns An object with `system` and `user` prompt strings.
 */
export function buildConceptPrompt(
  userContext: UserContext,
  mealHistory: MealHistoryEntry[],
  feedback: FeedbackSummary,
): { system: string; user: string } {
  const userPrompt = `Please generate a full week of meal concepts for my household.

## My Preferences
${formatUserPreferences(userContext)}

## Recent Meal History
${formatMealHistory(mealHistory)}

## Feedback from Previous Plans
${formatFeedback(feedback)}

Generate meal concepts for every day of the week (Sunday through Saturday). Include ${userContext.preferredMealTypes.length > 0 ? userContext.preferredMealTypes.join(", ") : "breakfast, lunch, and dinner"} for each day.

Remember:
- Stay within my $${userContext.weeklyBudget.toFixed(2)} weekly budget
- Each meal should be preparable in under ${userContext.maxPrepTimeMinutes} minutes
- Each meal should serve ${userContext.servingsPerMeal} people
- Maximize ingredient overlap between meals to minimize waste
- Provide variety in cuisines and cooking methods throughout the week`;

  return {
    system: CONCEPT_SYSTEM_PROMPT,
    user: userPrompt,
  };
}

// ---------------------------------------------------------------------------
// Recipe generation prompt
// ---------------------------------------------------------------------------

import type { MealConcept } from "./schemas.js";

const RECIPE_SYSTEM_PROMPT = `You are an expert meal-planning assistant specializing in detailed recipe generation. Given a set of confirmed meal concepts and a list of available Sam's Club products, produce full recipes with precise ingredients, quantities, costs, and step-by-step instructions.

RULES:
1. Sam's Club products — When possible, match ingredients to the provided Sam's Club product list. Use the product ID for matching. Sam's Club sells in bulk, so account for bulk sizing (e.g., a 5 lb bag of chicken breasts — only cost the portion used).
2. Cost accuracy — Calculate ingredient costs by prorating bulk product prices. For example, if a 3 lb bag of rice costs $4.50 and the recipe uses 1 lb, the ingredient cost is $1.50.
3. Pantry staples — Mark common pantry items (salt, pepper, oil, basic spices) as pantry staples with a low estimated cost. Do not assume the user has specialty ingredients.
4. Instructions — Write clear, numbered step-by-step cooking instructions. Each step should be a single, actionable sentence.
5. Nutrition — Provide a reasonable estimate of calories per serving.
6. Servings — Match the servings count to the user's preference.
7. Shopping list — At the end, provide a consolidated list of shopping suggestions to help the user shop efficiently at Sam's Club.

Respond by calling the provided tool with your structured recipes.`;

/**
 * Builds the system and user prompts for the full-recipe generation step.
 *
 * @param confirmedConcepts - The meal concepts the user confirmed / selected.
 * @param availableProducts - Sam's Club products available for ingredient matching.
 * @param userContext       - The user's preferences (for servings, budget, etc.).
 * @returns An object with `system` and `user` prompt strings.
 */
export function buildRecipePrompt(
  confirmedConcepts: MealConcept[],
  availableProducts: ProductInfo[],
  userContext: UserContext,
): { system: string; user: string } {
  const conceptsList = confirmedConcepts
    .map((c) => {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = dayNames[c.dayOfWeek] ?? `Day ${c.dayOfWeek}`;
      return [
        `### ${dayName} — ${c.mealType}`,
        `Name: ${c.name}`,
        `Cuisine: ${c.cuisineType}`,
        `Description: ${c.briefDescription}`,
        `Key ingredients: ${c.keyIngredients.join(", ")}`,
        `Estimated prep time: ${c.estimatedPrepTime} min`,
        `Estimated cost: $${c.estimatedCost.toFixed(2)}`,
      ].join("\n");
    })
    .join("\n\n");

  const productsList = availableProducts
    .map((p) => {
      const stock = p.inStock ? "In Stock" : "Out of Stock";
      const brand = p.brand ? ` (${p.brand})` : "";
      const size = p.unitSize ? ` — ${p.unitSize}` : "";
      return `- [${p.productId}] ${p.name}${brand}${size} — $${p.price.toFixed(2)} [${stock}]`;
    })
    .join("\n");

  const userPrompt = `Generate full recipes for the following confirmed meal concepts.

## User Preferences
${formatUserPreferences(userContext)}

## Confirmed Meal Concepts
${conceptsList}

## Available Sam's Club Products
${productsList.length > 0 ? productsList : "No specific products provided — estimate costs based on typical Sam's Club bulk pricing."}

For each meal:
1. Provide a complete ingredient list with quantities, units, and costs
2. Match ingredients to Sam's Club products where possible (use the product ID)
3. Write clear step-by-step instructions
4. Calculate estimated total cost and calories per serving
5. Each recipe should serve ${userContext.servingsPerMeal} people

After all recipes, provide a consolidated shopping list with suggestions for efficient Sam's Club shopping.`;

  return {
    system: RECIPE_SYSTEM_PROMPT,
    user: userPrompt,
  };
}

// ---------------------------------------------------------------------------
// Cart addon suggestion prompt
// ---------------------------------------------------------------------------

const CART_ADDON_SYSTEM_PROMPT = `You are a helpful shopping assistant for Sam's Club. The user has a cart that is below the minimum order threshold. Suggest useful grocery items from the available products that would complement their existing meal plan and help them reach the minimum.

Prioritize:
- Pantry staples that keep well (rice, canned goods, oils, spices)
- Items that complement the user's existing meal plan
- Good value-per-dollar items at Sam's Club bulk pricing
- Items the user is likely to use before they expire

Return only an array of product IDs to add to the cart.`;

/**
 * Builds the system and user prompts for cart-addon suggestions.
 *
 * @param currentCartTotal  - The user's current cart total in dollars.
 * @param targetMinimum     - The minimum order amount to reach.
 * @param availableProducts - Sam's Club products available to suggest.
 * @returns An object with `system` and `user` prompt strings.
 */
export function buildCartAddonPrompt(
  currentCartTotal: number,
  targetMinimum: number,
  availableProducts: ProductInfo[],
): { system: string; user: string } {
  const gap = targetMinimum - currentCartTotal;

  const productsList = availableProducts
    .filter((p) => p.inStock)
    .map((p) => {
      const brand = p.brand ? ` (${p.brand})` : "";
      const size = p.unitSize ? ` — ${p.unitSize}` : "";
      return `- [${p.productId}] ${p.name}${brand}${size} — $${p.price.toFixed(2)}`;
    })
    .join("\n");

  const userPrompt = `My current cart total is $${currentCartTotal.toFixed(2)} and the minimum order is $${targetMinimum.toFixed(2)}. I need to add about $${gap.toFixed(2)} more.

## Available Products
${productsList}

Suggest products to add to my cart to reach the minimum. Try to keep the total close to the minimum without going too far over. Choose items that are generally useful pantry staples or versatile grocery items.`;

  return {
    system: CART_ADDON_SYSTEM_PROMPT,
    user: userPrompt,
  };
}
