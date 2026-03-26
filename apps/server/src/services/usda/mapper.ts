import type { UsdaFoodSearchResult, ProductNutrition } from "./types";
import { NUTRIENT_IDS } from "./constants";

/** Extract a nutrient value by its ID from the USDA food nutrients array */
function findNutrient(
  food: UsdaFoodSearchResult,
  nutrientId: number,
): number | null {
  const nutrient = food.foodNutrients.find(
    (n) => n.nutrientId === nutrientId,
  );
  return nutrient?.value ?? null;
}

/** Map USDA food data to our ProductNutrition schema */
export function mapNutrients(food: UsdaFoodSearchResult): ProductNutrition {
  return {
    calories: findNutrient(food, NUTRIENT_IDS.calories),
    protein: findNutrient(food, NUTRIENT_IDS.protein),
    totalFat: findNutrient(food, NUTRIENT_IDS.totalFat),
    saturatedFat: findNutrient(food, NUTRIENT_IDS.saturatedFat),
    carbohydrates: findNutrient(food, NUTRIENT_IDS.carbohydrates),
    fiber: findNutrient(food, NUTRIENT_IDS.fiber),
    sugar: findNutrient(food, NUTRIENT_IDS.sugar),
    sodium: findNutrient(food, NUTRIENT_IDS.sodium),
    cholesterol: findNutrient(food, NUTRIENT_IDS.cholesterol),
    servingSize: food.servingSize ?? null,
    servingSizeUnit: food.servingSizeUnit ?? null,
  };
}
