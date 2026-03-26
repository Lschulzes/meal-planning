import type { ClubInfo, SamsClubProduct } from "./types";
import { DEFAULT_HEADERS, SAMSCLUB_API_BASE, RATE_LIMIT } from "./constants";
import { delay, retry, normalizeProductData } from "./utils";

/**
 * These API endpoints are approximations based on known Walmart/Sam's Club patterns.
 * They WILL need to be verified by inspecting network requests in browser devtools.
 * Update the paths in this file as needed.
 */

/** Find the nearest Sam's Club by zip code */
export async function findClub(zip: string): Promise<ClubInfo> {
  return retry(async () => {
    const url = `${SAMSCLUB_API_BASE}/node/vivaldi/browse/v2/clubs?distance=50&zip=${encodeURIComponent(zip)}`;

    const res = await fetch(url, { headers: DEFAULT_HEADERS });

    if (!res.ok) {
      throw new Error(`Club lookup failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const clubs = (data.clubs ?? data.payload ?? []) as Array<
      Record<string, unknown>
    >;

    if (clubs.length === 0) {
      throw new Error(`No Sam's Club found near zip ${zip}`);
    }

    const club = clubs[0]!;
    return {
      clubId: String(club.id ?? club.clubId ?? ""),
      name: String(club.name ?? ""),
      address: String(club.address ?? club.address1 ?? ""),
      city: String(club.city ?? ""),
      state: String(club.state ?? ""),
      zip: String(club.zip ?? club.zipCode ?? ""),
      distance: Number(club.distance ?? 0),
    };
  });
}

/** Fetch products for a given category with pagination */
export async function fetchCategoryProducts(
  clubId: string,
  categoryId: string,
  offset: number = 0,
  limit: number = RATE_LIMIT.pageSize,
): Promise<{
  products: Record<string, unknown>[];
  totalCount: number;
}> {
  return retry(async () => {
    const url = `${SAMSCLUB_API_BASE}/node/vivaldi/browse/v2/categories/${categoryId}?clubId=${clubId}&offset=${offset}&limit=${limit}`;

    const res = await fetch(url, { headers: DEFAULT_HEADERS });

    if (!res.ok) {
      throw new Error(
        `Category fetch failed: ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as Record<string, unknown>;
    const payload = (data.payload ?? data) as Record<string, unknown>;
    const records = (payload.records ??
      payload.products ??
      payload.items ??
      []) as Array<Record<string, unknown>>;
    const totalCount = Number(
      payload.totalCount ?? payload.totalRecords ?? records.length,
    );

    return { products: records, totalCount };
  });
}

/** Search for products by query string */
export async function searchProducts(
  clubId: string,
  query: string,
  offset: number = 0,
  limit: number = RATE_LIMIT.pageSize,
): Promise<{
  products: Record<string, unknown>[];
  totalCount: number;
}> {
  return retry(async () => {
    const url = `${SAMSCLUB_API_BASE}/node/vivaldi/browse/v2/search?searchTerm=${encodeURIComponent(query)}&clubId=${clubId}&offset=${offset}&limit=${limit}`;

    const res = await fetch(url, { headers: DEFAULT_HEADERS });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const payload = (data.payload ?? data) as Record<string, unknown>;
    const records = (payload.records ??
      payload.products ??
      []) as Array<Record<string, unknown>>;
    const totalCount = Number(
      payload.totalCount ?? payload.totalRecords ?? records.length,
    );

    return { products: records, totalCount };
  });
}

/** Fetch a single product's details */
export async function fetchProduct(
  productId: string,
  clubId: string,
): Promise<Record<string, unknown>> {
  return retry(async () => {
    const url = `${SAMSCLUB_API_BASE}/node/vivaldi/browse/v2/products/${productId}?clubId=${clubId}`;

    const res = await fetch(url, { headers: DEFAULT_HEADERS });

    if (!res.ok) {
      throw new Error(
        `Product fetch failed: ${res.status} ${res.statusText}`,
      );
    }

    const data = (await res.json()) as Record<string, unknown>;
    return (data.payload ?? data) as Record<string, unknown>;
  });
}

/** Fetch all products for a category, handling pagination */
export async function fetchAllCategoryProducts(
  clubId: string,
  categoryId: string,
  categoryName: string,
): Promise<SamsClubProduct[]> {
  const allProducts: SamsClubProduct[] = [];
  let offset = 0;

  const { products: firstPage, totalCount } = await fetchCategoryProducts(
    clubId,
    categoryId,
    0,
    RATE_LIMIT.pageSize,
  );

  for (const raw of firstPage) {
    allProducts.push(normalizeProductData(raw, categoryName));
  }

  console.log(
    `[samsclub] Fetching category ${categoryName} (${allProducts.length}/${totalCount} products)...`,
  );

  offset = RATE_LIMIT.pageSize;

  while (offset < totalCount) {
    await delay(RATE_LIMIT.requestDelayMs);

    const { products: page } = await fetchCategoryProducts(
      clubId,
      categoryId,
      offset,
      RATE_LIMIT.pageSize,
    );

    for (const raw of page) {
      allProducts.push(normalizeProductData(raw, categoryName));
    }

    console.log(
      `[samsclub] Fetching category ${categoryName} (${allProducts.length}/${totalCount} products)...`,
    );

    offset += RATE_LIMIT.pageSize;

    if (page.length === 0) break;
  }

  return allProducts;
}
