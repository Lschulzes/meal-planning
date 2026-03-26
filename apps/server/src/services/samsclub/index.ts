import type {
  ClubInfo,
  SamsClubCategory,
  SamsClubProduct,
} from "./types";
import { GROCERY_CATEGORIES } from "./categories";
import { findClub, fetchAllCategoryProducts, fetchProduct } from "./api-client";
import { delay, normalizeProductData } from "./utils";
import { RATE_LIMIT } from "./constants";

export type { SamsClubProduct, SamsClubCategory, ClubInfo } from "./types";

/** Look up the nearest Sam's Club for a zip code */
export async function fetchClubByZip(zipCode: string): Promise<ClubInfo> {
  return findClub(zipCode);
}

/** Get the known grocery category tree */
export async function fetchGroceryCategories(
  _clubId: string,
): Promise<SamsClubCategory[]> {
  // For now, return the hardcoded category list.
  // TODO: Fetch dynamically from the API if an endpoint is discovered.
  return GROCERY_CATEGORIES;
}

/** Fetch products for a single category with pagination */
export async function fetchProductsByCategory(
  clubId: string,
  categoryId: string,
  _offset?: number,
  _limit?: number,
): Promise<SamsClubProduct[]> {
  const category = GROCERY_CATEGORIES.find((c) => c.id === categoryId);
  return fetchAllCategoryProducts(
    clubId,
    categoryId,
    category?.name ?? "Unknown",
  );
}

/** Fetch ALL grocery products across all categories for a zip code */
export async function fetchAllGroceryProducts(
  zipCode: string,
): Promise<SamsClubProduct[]> {
  console.log(`[samsclub] Starting full grocery fetch for zip: ${zipCode}`);

  const club = await findClub(zipCode);
  console.log(
    `[samsclub] Using club: ${club.name} (${club.clubId}) — ${club.distance} mi away`,
  );

  const allProducts: SamsClubProduct[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < GROCERY_CATEGORIES.length; i++) {
    const category = GROCERY_CATEGORIES[i]!;
    console.log(
      `[samsclub] Category ${i + 1}/${GROCERY_CATEGORIES.length}: ${category.name}`,
    );

    try {
      const products = await fetchAllCategoryProducts(
        club.clubId,
        category.id,
        category.name,
      );

      for (const product of products) {
        if (!seenIds.has(product.productId)) {
          seenIds.add(product.productId);
          allProducts.push(product);
        }
      }

      // Delay between categories
      if (i < GROCERY_CATEGORIES.length - 1) {
        await delay(RATE_LIMIT.requestDelayMs);
      }
    } catch (err) {
      console.error(
        `[samsclub] Failed to fetch category ${category.name}:`,
        err,
      );
    }
  }

  console.log(
    `[samsclub] Fetch complete: ${allProducts.length} unique products from ${GROCERY_CATEGORIES.length} categories`,
  );

  return allProducts;
}

/** Fetch details for a single product */
export async function fetchProductDetail(
  productId: string,
  clubId: string,
): Promise<SamsClubProduct> {
  const raw = await fetchProduct(productId, clubId);
  return normalizeProductData(raw);
}
