import { runEnrichmentOnly } from "./enrichment";

runEnrichmentOnly()
  .then((result) => {
    console.log("Enrichment complete:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Enrichment failed:", err);
    process.exit(1);
  });
