import { runFullSync } from "./sync-products";

runFullSync()
  .then((result) => {
    console.log("Sync complete:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
