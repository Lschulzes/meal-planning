import type { SamsClubProduct } from "../services/samsclub/types";

export interface ProductDelta {
  type: "new" | "updated" | "removed";
  productId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

interface DBProduct {
  id: string;
  samsclubProductId: string;
  name: string | null;
  description: string | null;
  price: string | null;
  pricePerUnit: string | null;
  inStock: boolean | null;
  imageUrl: string | null;
}

/** Fields to track for change detection */
const TRACKED_FIELDS: Array<{
  dbKey: keyof DBProduct;
  scrapedKey: keyof SamsClubProduct;
  transform?: (v: unknown) => unknown;
}> = [
  { dbKey: "price", scrapedKey: "price", transform: (v) => String(v) },
  {
    dbKey: "pricePerUnit",
    scrapedKey: "pricePerUnit",
    transform: (v) => (v != null ? String(v) : null),
  },
  { dbKey: "inStock", scrapedKey: "inStock" },
  { dbKey: "name", scrapedKey: "name" },
  { dbKey: "description", scrapedKey: "description" },
  { dbKey: "imageUrl", scrapedKey: "imageUrl" },
];

/** Compare existing DB product with scraped data to detect changes */
export function detectChanges(
  existing: DBProduct,
  scraped: SamsClubProduct,
): ProductDelta | null {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  for (const field of TRACKED_FIELDS) {
    const oldVal = existing[field.dbKey];
    let newVal: unknown = scraped[field.scrapedKey];

    if (field.transform) {
      newVal = field.transform(newVal);
    }

    if (String(oldVal ?? "") !== String(newVal ?? "")) {
      changes[field.dbKey] = { old: oldVal, new: newVal };
    }
  }

  if (Object.keys(changes).length === 0) {
    return null;
  }

  return {
    type: "updated",
    productId: existing.id,
    changes,
  };
}
