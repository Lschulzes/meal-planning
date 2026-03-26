import { env } from "@meal-planning/env/server";

export const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

export function getApiKey(): string {
  return env.USDA_API_KEY;
}

/** Nutrient ID mappings from USDA FoodData Central */
export const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  totalFat: 1004,
  saturatedFat: 1258,
  carbohydrates: 1005,
  fiber: 1079,
  sugar: 2000,
  sodium: 1093,
  cholesterol: 1253,
} as const;

/** Delay between API requests in ms */
export const REQUEST_DELAY_MS = 500;

/** Max retries on failure */
export const MAX_RETRIES = 2;
