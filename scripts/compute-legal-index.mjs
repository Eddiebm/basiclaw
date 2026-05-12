/**
 * Entry shim so `npm run build:index` can stay wired to `compute-legal-index.mjs`.
 * Implementation lives in `compute-legal-index.ts` (tsx resolves TypeScript + path aliases).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const r = spawnSync("npx", ["tsx", join(here, "compute-legal-index.ts")], {
  cwd: root,
  stdio: "inherit",
  shell: true,
  env: process.env,
});
process.exit(r.status === null ? 1 : r.status);
