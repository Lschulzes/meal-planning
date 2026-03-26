export interface ProductNutrition {
  calories: number | null;
  protein: number | null;
  totalFat: number | null;
  saturatedFat: number | null;
  carbohydrates: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  servingSize: number | null;
  servingSizeUnit: string | null;
}

export interface UsdaFoodSearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  foodNutrients: UsdaNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface UsdaNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface UsdaSearchResponse {
  totalHits: number;
  foods: UsdaFoodSearchResult[];
}

export interface EnrichmentResult {
  nutrition: ProductNutrition | null;
  fdcId: string | null;
  source: "usda" | null;
}
