import type { SamsClubProduct } from "./types";

/** Delay execution for a given number of milliseconds */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse a price string like "$12.98" or "12.98" into a number */
export function parsePrice(priceString: string | number | null | undefined): number {
  if (priceString == null) return 0;
  if (typeof priceString === "number") return priceString;
  const cleaned = priceString.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/** Extract unit size and type from strings like "6 lb", "24 oz", "12 ct" */
export function parseUnitInfo(text: string | null | undefined): {
  unitSize: string;
  unitType: string;
} {
  if (!text) return { unitSize: "", unitType: "" };
  const match = text.match(/^([\d.]+)\s*(.+)$/);
  if (match) {
    return { unitSize: match[1]!, unitType: match[2]!.trim().toLowerCase() };
  }
  return { unitSize: text, unitType: "" };
}

/** Retry a function with exponential backoff */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  backoffBaseMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        const waitMs = backoffBaseMs * Math.pow(2, attempt);
        console.warn(
          `[samsclub] Retry ${attempt + 1}/${maxRetries} after ${waitMs}ms: ${lastError.message}`,
        );
        await delay(waitMs);
      }
    }
  }

  throw lastError;
}

/** Normalize raw API response into our SamsClubProduct shape */
export function normalizeProductData(
  raw: Record<string, unknown>,
  category: string = "",
  subcategory: string = "",
): SamsClubProduct {
  const productId =
    String(raw.productId ?? raw.id ?? raw.skuId ?? "unknown");
  const priceInfo = (raw.price ?? raw.pricing ?? {}) as Record<string, unknown>;
  const unitInfo = parseUnitInfo(
    String(raw.unitSize ?? raw.packageSize ?? ""),
  );

  return {
    productId,
    sku: String(raw.skuId ?? raw.sku ?? ""),
    upc: String(raw.upc ?? raw.gtin ?? ""),
    gtin: String(raw.gtin ?? ""),
    name: String(raw.name ?? raw.productName ?? raw.description ?? ""),
    brand: String(raw.brand ?? raw.brandName ?? ""),
    description: String(
      raw.shortDescription ?? raw.description ?? raw.name ?? "",
    ),
    category,
    subcategory,
    imageUrl: String(raw.imageUrl ?? raw.thumbnailUrl ?? raw.image ?? ""),
    price: parsePrice(
      (priceInfo.finalPrice ?? priceInfo.listPrice ?? raw.price) as
        | string
        | number
        | null,
    ),
    pricePerUnit: raw.pricePerUnit
      ? parsePrice(raw.pricePerUnit as string | number)
      : null,
    unitSize: unitInfo.unitSize,
    unitType: unitInfo.unitType,
    inStock: raw.inStock !== false && raw.outOfStock !== true,
    nutritionFacts: (raw.nutritionFacts as Record<string, unknown>) ?? undefined,
  };
}
