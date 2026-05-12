/**
 * Shared utilities for BasicLaw lawyer-directory importers.
 * Node 18+ (global fetch). No third-party deps.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const USER_AGENT =
  "BasicLawImporter/1.0 (https://basiclaw.app; contact: eddie@basiclaw.app)";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, "..", "..");
export const DATA_DIR = join(REPO_ROOT, "data", "imported-lawyers");
export const CACHE_ROOT = join(DATA_DIR, ".cache");

let lastRequestAt = 0;

export function sha256Hex(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function nowIso() {
  return new Date().toISOString();
}

export function parseImporterArgs(argv) {
  const out = {
    dryRun: false,
    limit: Infinity,
    page: 1,
    resume: false,
    throttleMs: 2000,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--resume") out.resume = true;
    else if (a === "--limit" && argv[i + 1]) out.limit = Math.max(0, Number(argv[++i]) || 0);
    else if (a === "--page" && argv[i + 1]) out.page = Math.max(1, Number(argv[++i]) || 1);
    else if (a === "--throttle-ms" && argv[i + 1])
      out.throttleMs = Math.max(0, Number(argv[++i]) || 0);
  }
  return out;
}

export async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function throttle(ms) {
  if (ms <= 0) return;
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < ms) await sleep(ms - elapsed);
  lastRequestAt = Date.now();
}

export function cachePathForUrl(iso2, url) {
  const h = sha256Hex(url);
  return join(CACHE_ROOT, iso2, `${h}.html`);
}

/**
 * GET with disk cache (raw body as utf-8 text). Respects throttle + User-Agent.
 * @param {string} iso2
 * @param {string} url
 * @param {{ dryRun: boolean, throttleMs: number }} opts
 */
export async function fetchTextCached(iso2, url, opts) {
  const { dryRun, throttleMs } = opts;
  const dest = cachePathForUrl(iso2, url);
  try {
    const st = await stat(dest);
    if (st.isFile()) return readFile(dest, "utf8");
  } catch {
    /* miss */
  }
  if (dryRun) {
    throw new Error(
      `Dry-run: no cached response for ${url}. Run once without --dry-run to populate data/imported-lawyers/.cache/${iso2}/ (only if importer is permitted).`,
    );
  }
  await throttle(throttleMs);
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/json;q=0.9,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const body = await res.text();
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, body, "utf8");
  return body;
}

export async function readRecordsJson(path) {
  try {
    const raw = await readFile(path, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.records)) return data.records;
  } catch {
    /* none */
  }
  return [];
}

export async function writeRecordsJson(path, records) {
  await mkdir(dirname(path), { recursive: true });
  const pretty = `${JSON.stringify(records, null, 2)}\n`;
  await writeFile(path, pretty, "utf8");
}

export function resumeSkipSet(existing) {
  const s = new Set();
  for (const r of existing) {
    if (r && r.externalId != null) s.add(String(r.externalId));
  }
  return s;
}

/**
 * Normalised partner-shaped record (cache-only; not ingested yet).
 */
export function makeBaseRecord(partial) {
  const ts = nowIso();
  return {
    sourceCountry: partial.sourceCountry,
    sourceName: partial.sourceName,
    sourceUrl: partial.sourceUrl,
    sourceLicense: partial.sourceLicense,
    sourceFetchedAt: partial.sourceFetchedAt ?? ts,
    externalId: partial.externalId,
    fullName: partial.fullName,
    firmName: partial.firmName ?? null,
    country: partial.country,
    jurisdiction: partial.jurisdiction ?? null,
    practiceAreas: partial.practiceAreas ?? [],
    languages: partial.languages ?? ["en"],
    email: partial.email ?? null,
    phone: partial.phone ?? null,
    websiteUrl: partial.websiteUrl ?? null,
    address: partial.address ?? null,
    disciplinaryStatus: partial.disciplinaryStatus ?? "unknown",
    verifiedByRegulator: partial.verifiedByRegulator ?? false,
  };
}

export function printDisabled(iso2) {
  console.error(
    `Importer disabled pending ToS clarification — see docs/lawyer-import/${iso2}.md`,
  );
}

export function logImporterFlags(iso2, args) {
  const lim = args.limit === Number.POSITIVE_INFINITY ? "all" : String(args.limit);
  console.log(
    `[${iso2}] flags: dryRun=${args.dryRun} limit=${lim} page=${args.page} resume=${args.resume} throttleMs=${args.throttleMs}`,
  );
}
