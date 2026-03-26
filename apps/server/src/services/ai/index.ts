import { z, toJSONSchema } from "zod";
import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";

import { sendMessage } from "./client.js";
import {
  conceptsResponseSchema,
  recipesResponseSchema,
} from "./schemas.js";
import {
  buildConceptPrompt,
  buildRecipePrompt,
  buildCartAddonPrompt,
} from "./prompts.js";

import type {
  UserContext,
  MealHistoryEntry,
  FeedbackSummary,
  ProductInfo,
} from "./prompts.js";

import type {
  MealConcept,
  ConceptsResponse,
  RecipesResponse,
} from "./schemas.js";

// Re-export types so consumers can import everything from the barrel.
export type {
  UserContext,
  MealHistoryEntry,
  FeedbackSummary,
  ProductInfo,
} from "./prompts.js";

export type {
  MealConcept,
  ConceptsResponse,
  RecipeIngredient,
  FullRecipe,
  RecipesResponse,
} from "./schemas.js";

// Re-export context helpers
export {
  buildUserContext,
  buildMealHistory,
  buildFeedbackSummary,
  buildProductContext,
} from "./context.js";

// ---------------------------------------------------------------------------
// Internal helper — convert a Zod schema to the Anthropic Tool.InputSchema
// ---------------------------------------------------------------------------

function zodToToolInputSchema(schema: z.ZodType): Tool.InputSchema {
  const jsonSchema = toJSONSchema(schema) as Record<string, unknown>;

  // Anthropic requires `type: "object"` at the top level.
  // toJSONSchema already produces an object schema for z.object().
  return {
    type: "object",
    ...(jsonSchema.properties !== undefined && {
      properties: jsonSchema.properties,
    }),
    ...(jsonSchema.required !== undefined && {
      required: jsonSchema.required as string[],
    }),
    // Spread any additional schema properties ($defs, etc.)
    ...Object.fromEntries(
      Object.entries(jsonSchema).filter(
        ([key]) => !["type", "properties", "required"].includes(key),
      ),
    ),
  } as Tool.InputSchema;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates high-level meal concepts for a full week based on the user's
 * preferences, recent meal history, and past feedback.
 *
 * This is Step 1 of the two-step planning flow. The returned concepts can
 * be presented to the user for review before generating full recipes.
 *
 * @param preferences - The user's dietary preferences and constraints.
 * @param history     - Recent meal history for variety enforcement.
 * @param feedback    - Aggregated feedback from previous meal plans.
 * @returns A validated {@link ConceptsResponse} with meal concepts and reasoning.
 */
export async function generateMealConcepts(
  preferences: UserContext,
  history: MealHistoryEntry[],
  feedback: FeedbackSummary,
): Promise<ConceptsResponse> {
  const { system, user } = buildConceptPrompt(preferences, history, feedback);
  const inputSchema = zodToToolInputSchema(conceptsResponseSchema);

  const raw = await sendMessage(
    system,
    user,
    "generate_meal_concepts",
    "Generate a week of meal concepts matching the user's preferences, budget, and dietary requirements.",
    inputSchema,
  );

  return conceptsResponseSchema.parse(raw);
}

/**
 * Generates full recipes with ingredients, instructions, and costs for a
 * set of confirmed meal concepts.
 *
 * This is Step 2 of the two-step planning flow. It takes the concepts the
 * user approved (possibly modified) and produces detailed recipes with
 * Sam's Club product matching.
 *
 * @param concepts    - The confirmed meal concepts from Step 1.
 * @param products    - Available Sam's Club products for ingredient matching.
 * @param preferences - The user's dietary preferences (for servings, budget, etc.).
 * @returns A validated {@link RecipesResponse} with full recipes and a shopping list.
 */
export async function generateFullRecipes(
  concepts: MealConcept[],
  products: ProductInfo[],
  preferences: UserContext,
): Promise<RecipesResponse> {
  const { system, user } = buildRecipePrompt(concepts, products, preferences);
  const inputSchema = zodToToolInputSchema(recipesResponseSchema);

  const raw = await sendMessage(
    system,
    user,
    "generate_full_recipes",
    "Generate detailed recipes with ingredients, instructions, costs, and Sam's Club product matching.",
    inputSchema,
  );

  return recipesResponseSchema.parse(raw);
}

/**
 * Suggests additional Sam's Club products to add to the user's cart so that
 * the order total reaches a given minimum threshold.
 *
 * @param currentCartTotal  - The user's current cart total in dollars.
 * @param targetMinimum     - The minimum order amount to reach.
 * @param availableProducts - Sam's Club products available for suggestion.
 * @returns An array of Sam's Club product IDs to add to the cart.
 */
export async function suggestCartAddons(
  currentCartTotal: number,
  targetMinimum: number,
  availableProducts: ProductInfo[],
): Promise<string[]> {
  const cartAddonSchema = z.object({
    productIds: z.array(z.string()),
  });

  const { system, user } = buildCartAddonPrompt(
    currentCartTotal,
    targetMinimum,
    availableProducts,
  );
  const inputSchema = zodToToolInputSchema(cartAddonSchema);

  const raw = await sendMessage(
    system,
    user,
    "suggest_cart_addons",
    "Suggest Sam's Club product IDs to add to the cart to reach the order minimum.",
    inputSchema,
  );

  const parsed = cartAddonSchema.parse(raw);
  return parsed.productIds;
}
