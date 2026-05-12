#!/usr/bin/env node
/**
 * Orchestrator: runs each ISO2 importer sequentially.
 * Skips (logs) any importer whose status is not "live" per status-map.mjs.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { IMPORTER_STATUS, isImporterLive } from "./status-map.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const ORDER = ["US", "GB", "CA", "AU", "IN", "NG", "GH", "KE", "ZA", "BR"];

const rows = [];

for (const iso of ORDER) {
  const status = IMPORTER_STATUS[iso];
  const script = join(__dirname, `${iso}.mjs`);
  const live = isImporterLive(status);
  if (!live) {
    rows.push({ iso, status, skipped: true, exitCode: null, note: "not live" });
    continue;
  }
  const r = spawnSync(process.execPath, [script], { stdio: "inherit", cwd: REPO_ROOT });
  rows.push({ iso, status, skipped: false, exitCode: r.status ?? r.signal, note: "" });
}

console.log("\n=== import-lawyers summary ===\n");
console.log(
  ["ISO", "status", "ran?", "exit", "note"].join("\t") +
    "\n" +
    rows
      .map((x) =>
        [x.iso, x.status, x.skipped ? "no" : "yes", x.exitCode ?? "-", x.note || "-"].join("\t"),
      )
      .join("\n"),
);
console.log("");

const bad = rows.filter((x) => !x.skipped && x.exitCode !== 0);
if (bad.length) process.exit(1);
