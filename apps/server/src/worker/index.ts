import cron from "node-cron";
import { env } from "@meal-planning/env/server";

import { runFullSync } from "./sync-products";
import { runEnrichmentOnly } from "./enrichment";

/** Start the cron scheduler for daily product sync */
export function startWorker(): void {
  if (!env.SYNC_ENABLED) {
    console.log("[worker] Sync is disabled (SYNC_ENABLED=false)");
    return;
  }

  // Run daily at 3am
  cron.schedule("0 3 * * *", async () => {
    console.log("[worker] Starting scheduled daily sync...");
    try {
      const syncResult = await runFullSync();
      console.log("[worker] Sync complete:", syncResult);

      // Run enrichment after sync
      const enrichResult = await runEnrichmentOnly();
      console.log("[worker] Enrichment complete:", enrichResult);
    } catch (err) {
      console.error("[worker] Scheduled sync failed:", err);
    }
  });

  console.log("[worker] Cron scheduled: daily product sync at 3:00 AM");
}

export { runFullSync, runEnrichmentOnly };
