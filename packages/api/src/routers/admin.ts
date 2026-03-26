import { sql } from "drizzle-orm";
import { products } from "@meal-planning/db/schema";

import { publicProcedure } from "../index";

export const adminRouter = {
  /** Get sync status — last sync time, product counts, health info */
  syncStatus: publicProcedure.handler(async ({ context }) => {
    const [countResult] = await context.db
      .select({ count: sql<number>`count(*)` })
      .from(products);

    const [lastSynced] = await context.db
      .select({ lastSyncedAt: sql<string>`max(${products.lastSyncedAt})` })
      .from(products);

    const [enrichedCount] = await context.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.nutritionSource} = 'usda'`);

    const [inStockCount] = await context.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(sql`${products.inStock} = true`);

    return {
      totalProducts: Number(countResult?.count ?? 0),
      enrichedProducts: Number(enrichedCount?.count ?? 0),
      inStockProducts: Number(inStockCount?.count ?? 0),
      lastSyncedAt: lastSynced?.lastSyncedAt ?? null,
    };
  }),
};
