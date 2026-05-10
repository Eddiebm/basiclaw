import { COUNTRIES, COUNTRY_BY_CODE } from "@/data/countries";
import type { Country, LegalSystem, Region } from "@/data/types";

export const REGIONS: readonly Region[] = [
  "Africa",
  "Americas",
  "Asia",
  "Europe",
  "Oceania",
] as const;

export const LEGAL_SYSTEMS: readonly LegalSystem[] = [
  "common-law",
  "civil-law",
  "mixed",
  "islamic-law",
  "uncodified",
  "socialist-law",
  "religious-law",
  "customary-law",
] as const;

export function getCountry(code: string): Country | undefined {
  return COUNTRY_BY_CODE[code.toLowerCase()];
}

export function getPopularCountries(): Country[] {
  return COUNTRIES.filter((country) => country.popular);
}

export function searchCountries(query: string): Country[] {
  const term = query.trim().toLowerCase();
  if (!term) return COUNTRIES;
  return COUNTRIES.filter((country) => {
    const haystack = [
      country.name,
      country.officialName ?? "",
      country.code,
      country.alpha3,
      country.capital,
      ...country.languages,
      country.region,
      country.subregion,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });
}

export function groupByRegion(countries: Country[] = COUNTRIES): Record<Region, Country[]> {
  const grouped: Record<Region, Country[]> = {
    Africa: [],
    Americas: [],
    Asia: [],
    Europe: [],
    Oceania: [],
    Antarctica: [],
  };
  for (const country of countries) {
    grouped[country.region].push(country);
  }
  for (const region of REGIONS) {
    grouped[region].sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
}

export function groupByLegalSystem(countries: Country[] = COUNTRIES): Record<LegalSystem, Country[]> {
  const grouped = {} as Record<LegalSystem, Country[]>;
  for (const system of LEGAL_SYSTEMS) {
    grouped[system] = [];
  }
  for (const country of countries) {
    grouped[country.legalSystem].push(country);
  }
  for (const system of LEGAL_SYSTEMS) {
    grouped[system].sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
}

export function countryStats() {
  const total = COUNTRIES.length;
  const active = COUNTRIES.filter((c) => c.status === "active").length;
  const preview = COUNTRIES.filter((c) => c.status === "preview").length;
  const planned = COUNTRIES.filter((c) => c.status === "planned").length;
  return { total, active, preview, planned };
}
