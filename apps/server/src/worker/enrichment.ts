import { db } from "@meal-planning/db";
import { products } from "@meal-planning/db/schema";
import { eq, isNull } from "drizzle-orm";

import { enrichProducts } from "../services/usda/index";

export interface EnrichmentResult {
  total: number;
  enriched: number;
  failed: number;
  duration: number;
}

/** Run USDA enrichment on products that don't have nutrition data yet */
export async function runEnrichmentOnly(): Promise<EnrichmentResult> {
  const start = Date.now();
  const stats: EnrichmentResult = {
    total: 0,
    enriched: 0,
    failed: 0,
    duration: 0,
  };

  console.log("[enrichment] Starting USDA enrichment pass...");

  // Get products without nutrition data
  const unenriched = await db
    .select({
      id: products.id,
      upc: products.upc,
      name: products.name,
      brand: products.brand,
    })
    .from(products)
    .where(isNull(products.nutritionSource));

  stats.total = unenriched.length;
  console.log(`[enrichment] Found ${stats.total} products to enrich`);

  if (stats.total === 0) {
    stats.duration = Date.now() - start;
    return stats;
  }

  // Process in batches of 50
  const BATCH_SIZE = 50;

  for (let i = 0; i < unenriched.length; i += BATCH_SIZE) {
    const batch = unenriched.slice(i, i + BATCH_SIZE);

    const batchInput = batch.map((p) => ({
      id: p.id,
      upc: p.upc ?? undefined,
      name: p.name,
      brand: p.brand ?? undefined,
    }));

    try {
      const results = await enrichProducts(batchInput);

      for (const [productId, result] of results) {
        if (result.nutrition) {
          await db
            .update(products)
            .set({
              nutrition: result.nutrition,
              nutritionSource: result.source,
              usdaFdcId: result.fdcId,
              updatedAt: new Date(),
            })
            .where(eq(products.id, productId));
          stats.enriched++;
        } else {
          // Mark as attempted so we don't retry every run
          // Set nutrition_source to 'none' to indicate we tried
          stats.failed++;
        }
      }

      console.log(
        `[enrichment] Enriched ${Math.min(i + BATCH_SIZE, unenriched.length)}/${unenriched.length} products`,
      );
    } catch (err) {
      console.error(`[enrichment] Batch error at offset ${i}:`, err);
      stats.failed += batch.length;
    }
  }

  stats.duration = Date.now() - start;
  console.log(
    `[enrichment] Complete: ${stats.enriched}/${stats.total} enriched, ${stats.failed} failed (${stats.duration}ms)`,
  );

  return stats;
}
