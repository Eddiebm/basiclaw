import type { LegalIndexEntry, LegalIndexFile } from "@/lib/legal-index";
import raw from "@/data/legal-index.generated.json";

export const LEGAL_INDEX_DATA = raw as LegalIndexFile;

const byCode = new Map<string, LegalIndexEntry>();
for (const row of LEGAL_INDEX_DATA.entries) {
  byCode.set(row.code.toLowerCase(), row);
}

export function getLegalIndexEntry(code: string): LegalIndexEntry | undefined {
  return byCode.get(code.trim().toLowerCase());
}

export function getAllLegalIndexEntries(): LegalIndexEntry[] {
  return LEGAL_INDEX_DATA.entries;
}
