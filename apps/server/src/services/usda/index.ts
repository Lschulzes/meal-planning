import type { EnrichmentResult } from "./types";
import { searchByUpc, searchByName } from "./client";
import { mapNutrients } from "./mapper";
import { REQUEST_DELAY_MS } from "./constants";

export type { ProductNutrition, EnrichmentResult } from "./types";

/** Delay helper */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Enrich a single product with USDA nutritional data.
 *
 * Lookup strategy:
 * 1. Try UPC lookup (most accurate)
 * 2. If no UPC match, try name + brand search
 * 3. If still no match, try generic name search
 * 4. If nothing found, return null nutrition
 */
export async function enrichProduct(product: {
  upc?: string;
  name: string;
  brand?: string;
}): Promise<EnrichmentResult> {
  try {
    // Strategy 1: UPC lookup
    if (product.upc) {
      const upcResult = await searchByUpc(product.upc);
      if (upcResult.foods.length > 0) {
        const food = upcResult.foods[0]!;
        return {
          nutrition: mapNutrients(food),
          fdcId: String(food.fdcId),
          source: "usda",
        };
      }
    }

    // Strategy 2: Name + brand search
    if (product.brand) {
      const brandResult = await searchByName(product.name, product.brand);
      if (brandResult.foods.length > 0) {
        const food = brandResult.foods[0]!;
        return {
          nutrition: mapNutrients(food),
          fdcId: String(food.fdcId),
          source: "usda",
        };
      }
    }

    // Strategy 3: Generic name search
    const nameResult = await searchByName(product.name);
    if (nameResult.foods.length > 0) {
      const food = nameResult.foods[0]!;
      return {
        nutrition: mapNutrients(food),
        fdcId: String(food.fdcId),
        source: "usda",
      };
    }

    // No match found
    return { nutrition: null, fdcId: null, source: null };
  } catch (err) {
    console.error(
      `[usda] Failed to enrich product "${product.name}":`,
      err,
    );
    return { nutrition: null, fdcId: null, source: null };
  }
}

/**
 * Enrich multiple products in batch with rate limiting.
 * Uses an in-memory cache for UPC lookups within a single run.
 */
export async function enrichProducts(
  products: Array<{
    id: string;
    upc?: string;
    name: string;
    brand?: string;
  }>,
): Promise<Map<string, EnrichmentResult>> {
  const results = new Map<string, EnrichmentResult>();
  const upcCache = new Map<string, EnrichmentResult>();

  for (let i = 0; i < products.length; i++) {
    const product = products[i]!;

    // Check UPC cache first
    if (product.upc && upcCache.has(product.upc)) {
      results.set(product.id, upcCache.get(product.upc)!);
      continue;
    }

    const result = await enrichProduct(product);
    results.set(product.id, result);

    // Cache by UPC if available
    if (product.upc) {
      upcCache.set(product.upc, result);
    }

    // Rate limit
    if (i < products.length - 1) {
      await delay(REQUEST_DELAY_MS);
    }

    // Log progress every 10 products
    if ((i + 1) % 10 === 0 || i === products.length - 1) {
      console.log(
        `[usda] Enriched ${i + 1}/${products.length} products`,
      );
    }
  }

  return results;
}
