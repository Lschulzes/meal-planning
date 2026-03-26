import { db } from "@meal-planning/db";
import { products, productHistory } from "@meal-planning/db/schema";
import { eq, sql } from "drizzle-orm";
import { env } from "@meal-planning/env/server";

import { fetchAllGroceryProducts } from "../services/samsclub/index";
import type { SamsClubProduct } from "../services/samsclub/types";
import { detectChanges } from "./delta-detector";

export interface SyncResult {
  new: number;
  updated: number;
  unchanged: number;
  removed: number;
  errors: number;
  duration: number;
}

/** Run a full product sync: scrape Sam's Club, upsert to DB, track changes */
export async function runFullSync(): Promise<SyncResult> {
  const start = Date.now();
  const stats: SyncResult = {
    new: 0,
    updated: 0,
    unchanged: 0,
    removed: 0,
    errors: 0,
    duration: 0,
  };

  const zipCode = env.SAMSCLUB_ZIP_CODE;
  console.log(`[sync] Starting full product sync for zip code: ${zipCode}`);

  let scrapedProducts: SamsClubProduct[];
  try {
    scrapedProducts = await fetchAllGroceryProducts(zipCode);
    console.log(`[sync] Scraped ${scrapedProducts.length} products`);
  } catch (err) {
    console.error("[sync] Failed to fetch products from Sam's Club:", err);
    return { ...stats, errors: 1, duration: Date.now() - start };
  }

  const scrapedIds = new Set<string>();

  for (const scraped of scrapedProducts) {
    scrapedIds.add(scraped.productId);

    try {
      const [existing] = await db
        .select()
        .from(products)
        .where(eq(products.samsclubProductId, scraped.productId))
        .limit(1);

      if (!existing) {
        // New product
        await db.insert(products).values({
          samsclubProductId: scraped.productId,
          sku: scraped.sku || null,
          upc: scraped.upc || null,
          gtin: scraped.gtin || null,
          name: scraped.name,
          brand: scraped.brand || null,
          description: scraped.description || null,
          category: scraped.category || null,
          subcategory: scraped.subcategory || null,
          imageUrl: scraped.imageUrl || null,
          price: scraped.price ? String(scraped.price) : null,
          pricePerUnit: scraped.pricePerUnit
            ? String(scraped.pricePerUnit)
            : null,
          unitSize: scraped.unitSize || null,
          unitType: scraped.unitType || null,
          inStock: scraped.inStock,
          zipCode,
          nutrition: scraped.nutritionFacts ?? null,
          tags: inferTags(scraped),
          lastSyncedAt: new Date(),
        });
        stats.new++;
      } else {
        // Existing — check for changes
        const delta = detectChanges(existing, scraped);

        if (delta) {
          // Get max version for history
          const [maxVersion] = await db
            .select({
              max: sql<number>`coalesce(max(${productHistory.version}), 0)`,
            })
            .from(productHistory)
            .where(eq(productHistory.productId, existing.id));

          await db.transaction(async (tx) => {
            await tx
              .update(products)
              .set({
                name: scraped.name,
                brand: scraped.brand || null,
                description: scraped.description || null,
                category: scraped.category || null,
                subcategory: scraped.subcategory || null,
                imageUrl: scraped.imageUrl || null,
                price: scraped.price ? String(scraped.price) : null,
                pricePerUnit: scraped.pricePerUnit
                  ? String(scraped.pricePerUnit)
                  : null,
                unitSize: scraped.unitSize || null,
                unitType: scraped.unitType || null,
                inStock: scraped.inStock,
                tags: inferTags(scraped),
                lastSyncedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(products.id, existing.id));

            await tx.insert(productHistory).values({
              productId: existing.id,
              version: (maxVersion?.max ?? 0) + 1,
              price: scraped.price ? String(scraped.price) : null,
              pricePerUnit: scraped.pricePerUnit
                ? String(scraped.pricePerUnit)
                : null,
              inStock: scraped.inStock,
              snapshot: scraped,
            });
          });

          stats.updated++;
        } else {
          // Just update last synced time
          await db
            .update(products)
            .set({ lastSyncedAt: new Date() })
            .where(eq(products.id, existing.id));
          stats.unchanged++;
        }
      }
    } catch (err) {
      console.error(
        `[sync] Error processing product ${scraped.productId}:`,
        err,
      );
      stats.errors++;
    }
  }

  // Mark products not in scraped results as out of stock
  if (scrapedIds.size > 0) {
    try {
      const allDbProducts = await db
        .select({ id: products.id, samsclubProductId: products.samsclubProductId })
        .from(products)
        .where(eq(products.zipCode, zipCode));

      const toRemove = allDbProducts.filter(
        (p) => !scrapedIds.has(p.samsclubProductId),
      );

      for (const product of toRemove) {
        await db
          .update(products)
          .set({ inStock: false, updatedAt: new Date() })
          .where(eq(products.id, product.id));
        stats.removed++;
      }
    } catch (err) {
      console.error("[sync] Error marking removed products:", err);
      stats.errors++;
    }
  }

  stats.duration = Date.now() - start;
  console.log(
    `[sync] Complete: ${stats.new} new, ${stats.updated} updated, ${stats.unchanged} unchanged, ${stats.removed} removed, ${stats.errors} errors (${stats.duration}ms)`,
  );

  return stats;
}

/** Infer product tags from category and name for AI filtering */
function inferTags(product: SamsClubProduct): string[] {
  const tags: string[] = [];
  const cat = (product.category || "").toLowerCase();
  const name = (product.name || "").toLowerCase();

  if (cat.includes("meat") || cat.includes("seafood") || name.includes("chicken") || name.includes("beef") || name.includes("pork") || name.includes("salmon") || name.includes("shrimp")) {
    tags.push("protein");
  }
  if (cat.includes("produce") || name.includes("lettuce") || name.includes("tomato") || name.includes("fruit")) {
    tags.push("produce");
  }
  if (cat.includes("dairy") || name.includes("milk") || name.includes("cheese") || name.includes("yogurt")) {
    tags.push("dairy");
  }
  if (cat.includes("frozen")) tags.push("frozen");
  if (cat.includes("pantry") || cat.includes("canned")) tags.push("pantry");
  if (cat.includes("beverage")) tags.push("beverage");
  if (cat.includes("snack")) tags.push("snack");
  if (cat.includes("bread") || cat.includes("bakery")) tags.push("bakery");
  if (cat.includes("breakfast")) tags.push("breakfast");
  if (cat.includes("deli")) tags.push("deli");

  return tags;
}
