/**
 * Thin wrapper so `npm run embed:answers` can stay as `node scripts/embed-answers.mjs`
 * while the heavy lifting runs through tsx + TypeScript imports.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const runner = path.join(root, "scripts", "embed-answers-runner.ts");

const r = spawnSync("npx", ["tsx", runner], { cwd: root, stdio: "inherit", env: process.env });
process.exit(typeof r.status === "number" ? r.status : 1);
