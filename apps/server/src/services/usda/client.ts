import type { UsdaSearchResponse, UsdaFoodSearchResult } from "./types";
import { USDA_BASE_URL, getApiKey, MAX_RETRIES } from "./constants";

/** Delay helper */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry with exponential backoff */
async function retry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await delay(1000 * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}

/** Search USDA by UPC code */
export async function searchByUpc(
  upc: string,
): Promise<UsdaSearchResponse> {
  return retry(async () => {
    const apiKey = getApiKey();
    const res = await fetch(`${USDA_BASE_URL}/foods/search?api_key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: upc,
        dataType: ["Branded"],
        pageSize: 5,
      }),
    });

    if (!res.ok) {
      throw new Error(`USDA search by UPC failed: ${res.status}`);
    }

    return (await res.json()) as UsdaSearchResponse;
  });
}

/** Search USDA by product name and optional brand */
export async function searchByName(
  name: string,
  brand?: string,
): Promise<UsdaSearchResponse> {
  return retry(async () => {
    const apiKey = getApiKey();
    const query = brand ? `${name} ${brand}` : name;

    const res = await fetch(`${USDA_BASE_URL}/foods/search?api_key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        dataType: ["Branded", "Foundation", "SR Legacy"],
        pageSize: 5,
      }),
    });

    if (!res.ok) {
      throw new Error(`USDA search by name failed: ${res.status}`);
    }

    return (await res.json()) as UsdaSearchResponse;
  });
}

/** Get detailed food data by FDC ID */
export async function getFoodDetails(
  fdcId: number,
): Promise<UsdaFoodSearchResult> {
  return retry(async () => {
    const apiKey = getApiKey();
    const res = await fetch(
      `${USDA_BASE_URL}/food/${fdcId}?api_key=${apiKey}`,
      {
        headers: { Accept: "application/json" },
      },
    );

    if (!res.ok) {
      throw new Error(`USDA food detail failed: ${res.status}`);
    }

    return (await res.json()) as UsdaFoodSearchResult;
  });
}
