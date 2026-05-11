/**
 * Validates constitution snippet JSON files (parse + excerpt length cap).
 * Run: npm run verify:chat
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNIPPET_DIR = path.join(__dirname, "../src/data/constitution-snippets");
const ISO2 = ["us", "gh", "ng", "gb", "in", "de", "fr", "br", "mx", "ca", "au"];

for (const code of ISO2) {
  const filePath = path.join(SNIPPET_DIR, `${code}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr)) throw new Error(`${code}.json must be an array`);
  for (const row of arr) {
    if (!row.id || !row.title || !row.excerpt) throw new Error(`${code}.json missing id/title/excerpt`);
    if (row.excerpt.length > 500) throw new Error(`${code} snippet ${row.id}: excerpt > 500 chars (${row.excerpt.length})`);
  }
  console.log(`${code}.json OK (${arr.length} snippets)`);
}

console.log("All snippet files valid.");
