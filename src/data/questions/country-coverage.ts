import type { Domain } from "./taxonomy";

/** Countries where BasicLaw currently has stronger context (constitution snippets + chat grounding). */
export const STRONG_COVERAGE_COUNTRIES = [
  "US",
  "GB",
  "CA",
  "AU",
  "IN",
  "NG",
  "GH",
  "KE",
  "ZA",
  "DE",
  "FR",
  "BR",
  "MX",
  "JP",
] as const;

export type StrongCoverageCountryCode = (typeof STRONG_COVERAGE_COUNTRIES)[number];

/**
 * Per-domain list of ISO alpha-2 codes (uppercase) where answers can be more specific
 * (constitution + snippets + chat prompt tuned for that domain).
 * Domains not listed fall back to general educational answers with fewer citations everywhere.
 */
export const DOMAIN_COUNTRY_COVERAGE: Record<Domain, readonly StrongCoverageCountryCode[]> = {
  "identity-status": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "money-debt-tax": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  housing: ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  work: ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "policing-courts": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "family-children": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "health-incapacity": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "digital-life": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "business-self-employed": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "cross-border-immigration": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "consumer-rights": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
  "inheritance-estate": ["US", "GB", "CA", "AU", "DE", "FR", "IN", "BR", "MX", "JP", "NG", "GH", "KE", "ZA"],
};

const STRONG_SET = new Set<string>(STRONG_COVERAGE_COUNTRIES);

export function isStrongCountry(code: string): boolean {
  return STRONG_SET.has(code.trim().toUpperCase());
}

export function domainHasFullCoverageForCountry(domain: Domain, countryCodeUpper: string): boolean {
  const list = DOMAIN_COUNTRY_COVERAGE[domain];
  return list.includes(countryCodeUpper as StrongCoverageCountryCode);
}
