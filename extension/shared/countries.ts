// Minimal jurisdiction dataset for the extension popup selector. We deliberately
// ship a slim list (the most-requested jurisdictions on basiclaw.vercel.app)
// instead of mirroring all 195 entries from the web app — this keeps the popup
// bundle tiny. The full list is one click away on the website.

export interface JurisdictionOption {
  code: string;
  name: string;
  flag: string;
}

export const JURISDICTIONS: JurisdictionOption[] = [
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "ie", name: "Ireland", flag: "🇮🇪" },
  { code: "nz", name: "New Zealand", flag: "🇳🇿" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "pt", name: "Portugal", flag: "🇵🇹" },
  { code: "se", name: "Sweden", flag: "🇸🇪" },
  { code: "no", name: "Norway", flag: "🇳🇴" },
  { code: "ch", name: "Switzerland", flag: "🇨🇭" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "ae", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "za", name: "South Africa", flag: "🇿🇦" },
  { code: "ng", name: "Nigeria", flag: "🇳🇬" },
  { code: "ke", name: "Kenya", flag: "🇰🇪" },
  { code: "gh", name: "Ghana", flag: "🇬🇭" },
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "mx", name: "Mexico", flag: "🇲🇽" },
  { code: "ar", name: "Argentina", flag: "🇦🇷" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "kr", name: "South Korea", flag: "🇰🇷" },
  { code: "ph", name: "Philippines", flag: "🇵🇭" },
];

export const DEFAULT_JURISDICTION = "us";
