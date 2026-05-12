/**
 * Pre-compute Legal Literacy Index scores into `src/data/legal-index.generated.json`.
 * Invoked via `npm run build:index`.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COUNTRIES } from "../src/data/countries";
import { buildLegalIndexFile } from "../src/lib/legal-index";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src/data/legal-index.generated.json");
const payload = buildLegalIndexFile(COUNTRIES);
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath} (${payload.entries.length} countries)`);
