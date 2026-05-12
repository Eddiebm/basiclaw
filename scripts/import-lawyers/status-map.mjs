/** Legal / operational status for each ISO2 importer (mirrors docs). */
export const IMPORTER_STATUS = {
  US: "unknown",
  GB: "restricted-personal-use-only",
  CA: "unknown",
  AU: "restricted-personal-use-only",
  IN: "unknown",
  NG: "unknown",
  GH: "unknown",
  KE: "unknown",
  ZA: "unknown",
  BR: "unknown",
};

export function isImporterLive(status) {
  return status === "permitted-public-roll" || status === "permitted-with-attribution" || status === "rate-limited";
}
