import { z } from "zod";

// ---------------------------------------------------------------------------
// Step 1 -- meal concepts
// ---------------------------------------------------------------------------

export const mealConceptSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  name: z.string(),
  cuisineType: z.string(),
  estimatedPrepTime: z.number(),
  estimatedCost: z.number(),
  briefDescription: z.string(),
  keyIngredients: z.array(z.string()),
});

export const conceptsResponseSchema = z.object({
  meals: z.array(mealConceptSchema),
  reasoning: z.string(),
});

// ---------------------------------------------------------------------------
// Step 2 -- full recipes
// ---------------------------------------------------------------------------

export const recipeIngredientSchema = z.object({
  ingredientName: z.string(),
  samsclubProductId: z.string().nullable(),
  quantity: z.number(),
  unit: z.string(),
  estimatedCost: z.number(),
  isPantryStaple: z.boolean(),
});

export const fullRecipeSchema = z.object({
  dayOfWeek: z.number(),
  mealType: z.string(),
  name: z.string(),
  description: z.string(),
  cuisineType: z.string(),
  prepTimeMinutes: z.number(),
  cookTimeMinutes: z.number(),
  servings: z.number(),
  estimatedCaloriesPerServing: z.number(),
  instructions: z.array(z.string()),
  ingredients: z.array(recipeIngredientSchema),
  estimatedTotalCost: z.number(),
});

export const recipesResponseSchema = z.object({
  meals: z.array(fullRecipeSchema),
  totalEstimatedCost: z.number(),
  shoppingListSuggestions: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type MealConcept = z.infer<typeof mealConceptSchema>;
export type ConceptsResponse = z.infer<typeof conceptsResponseSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type FullRecipe = z.infer<typeof fullRecipeSchema>;
export type RecipesResponse = z.infer<typeof recipesResponseSchema>;
