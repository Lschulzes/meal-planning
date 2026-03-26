/**
 * Playwright-based browser fallback for Sam's Club scraping.
 *
 * TODO: Implement this as a fallback when the API client gets blocked.
 * This would use Playwright to:
 * 1. Open samsclub.com in a headless browser
 * 2. Set the zip code / club
 * 3. Navigate to grocery categories
 * 4. Scrape product data from the rendered DOM
 *
 * For now, all functions throw NotImplemented errors.
 * Install playwright as a dev dependency when ready: `pnpm add -D playwright`
 */

import type { ClubInfo, SamsClubProduct } from "./types";

export async function findClubBrowser(_zip: string): Promise<ClubInfo> {
  throw new Error(
    "Browser client not implemented — use api-client instead",
  );
}

export async function fetchProductsBrowser(
  _clubId: string,
  _categoryId: string,
): Promise<SamsClubProduct[]> {
  throw new Error(
    "Browser client not implemented — use api-client instead",
  );
}

export async function fetchProductDetailBrowser(
  _productId: string,
  _clubId: string,
): Promise<SamsClubProduct> {
  throw new Error(
    "Browser client not implemented — use api-client instead",
  );
}
