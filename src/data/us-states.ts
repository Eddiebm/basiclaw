/**
 * US states + DC for state-level topic depth (SEO).
 * `slug` is the lowercase USPS code used in URLs: /us/ca/rights
 */

export interface UsState {
  code: string;
  name: string;
  slug: string;
  capital: string;
  /** Plain-language quirks for tenant / employment / local variation */
  notes?: string;
}

const ROWS: Array<[string, string, string, string?, string?]> = [
  ["AL", "Alabama", "Montgomery", "At-will employment default; landlord–tenant varies by county."],
  ["AK", "Alaska", "Juneau", "Remote geography can affect court access; unique native-title overlay in some matters."],
  ["AZ", "Arizona", "Phoenix", "Strong summer-heat habitability issues; short-term rental rules vary by city."],
  ["AR", "Arkansas", "Little Rock", "Rural/suburban split on housing stock; check local eviction filing rules."],
  ["CA", "California", "Sacramento", "Strong tenant protections in many cities; AB5-style worker classification is heavily litigated."],
  ["CO", "Colorado", "Denver", "Wage-theft and paid-sick-leave rules are state-wide; mountain resort towns have tight housing."],
  ["CT", "Connecticut", "Hartford", "Judicial-process evictions; dense insurance/finance employment clusters."],
  ["DE", "Delaware", "Dover", "Corporate-law hub; residential tenancies often follow Delaware-specific forms."],
  ["FL", "Florida", "Tallahassee", "Hurricane habitability + insurance disputes; condo HOA governance is a frequent flashpoint."],
  ["GA", "Georgia", "Atlanta", "At-will employment; Atlanta metro has distinct landlord–tenant filing practices."],
  ["HI", "Hawaii", "Honolulu", "Strong tenant protections on some islands; leasehold vs fee-simple confusion is common."],
  ["ID", "Idaho", "Boise", "Fast growth markets; watch for non-compete enforceability fact patterns."],
  ["IL", "Illinois", "Springfield", "Chicago vs downstate rules diverge sharply for housing and policing practice."],
  ["IN", "Indiana", "Indianapolis", "Manufacturing-heavy employment; local housing courts differ by county."],
  ["IA", "Iowa", "Des Moines", "Agricultural employment seasonal patterns; university towns have tighter rental markets."],
  ["KS", "Kansas", "Topeka", "Tornado habitability repairs; rural eviction timelines can differ from Wichita/KC."],
  ["KY", "Kentucky", "Frankfort", "Mixed urban/rural; bourbon/tourism employment has seasonal wage patterns."],
  ["LA", "Louisiana", "Baton Rouge", "Civil-law property concepts interact with US-style employment; parish-level variation."],
  ["ME", "Maine", "Augusta", "Seasonal housing and short-term rental pressure on coast; winter habitability issues."],
  ["MD", "Maryland", "Annapolis", "Baltimore-area tenant organizing history; Montgomery County overlays."],
  ["MA", "Massachusetts", "Boston", "Just-cause eviction rules in Boston and other cities; strong wage/hour enforcement."],
  ["MI", "Michigan", "Lansing", "Auto industry cycles; Detroit-area landlord–tenant docket volume is high."],
  ["MN", "Minnesota", "Saint Paul", "Cold-weather habitability; Twin Cities tenant protections beyond state floor."],
  ["MS", "Mississippi", "Jackson", "Rural courts; agricultural and logistics employment clusters."],
  ["MO", "Missouri", "Jefferson City", "Kansas City vs St. Louis metro differences for policing and housing filings."],
  ["MT", "Montana", "Helena", "Resource-industry employment; rural service access affects enforcement."],
  ["NE", "Nebraska", "Lincoln", "Ag and logistics hubs; Omaha vs rural eviction timelines."],
  ["NV", "Nevada", "Carson City", "Hospitality-heavy employment; Las Vegas short-term rental rules are volatile."],
  ["NH", "New Hampshire", "Concord", "Town-meeting local rules; winter heating cost disputes."],
  ["NJ", "New Jersey", "Trenton", "Dense rent-control municipalities; strong anti-discrimination enforcement culture."],
  ["NM", "New Mexico", "Santa Fe", "Oil/gas and federal-land employment mixes; water rights intersect with housing."],
  ["NY", "New York", "Albany", "NYC is its own universe for tenants and gig workers; upstate differs materially."],
  ["NC", "North Carolina", "Raleigh", "Research-triangle non-competes; rapid-growth landlord disputes."],
  ["ND", "North Dakota", "Bismarck", "Energy-sector boom/bust employment swings."],
  ["OH", "Ohio", "Columbus", "Manufacturing and logistics; municipal income-tax complexity for workers."],
  ["OK", "Oklahoma", "Oklahoma City", "Energy and agriculture; tribal jurisdiction overlays in eastern Oklahoma."],
  ["OR", "Oregon", "Salem", "Portland metro tenant protections; statewide rent-cap history—verify current statute."],
  ["PA", "Pennsylvania", "Harrisburg", "Philadelphia vs Pittsburgh vs rural eviction practice differences."],
  ["RI", "Rhode Island", "Providence", "Small state, dense housing stock; marine/industry employment pockets."],
  ["SC", "South Carolina", "Columbia", "Coastal short-term rentals; manufacturing employment clusters."],
  ["SD", "South Dakota", "Pierre", "Tourism and agriculture; sparse court coverage in west river."],
  ["TN", "Tennessee", "Nashville", "Music industry contracting; Nashville growth strains housing."],
  ["TX", "Texas", "Austin", "Oil/gig economy mix; major cities added local tenant protections—check city code."],
  ["UT", "Utah", "Salt Lake City", "Tech-sector non-competes historically common; fast-growth housing pressure."],
  ["VT", "Vermont", "Montpelier", "Seasonal tourism housing; cold-weather habitability."],
  ["VA", "Virginia", "Richmond", "NOVA vs rest-of-state economic and housing divergence; federal contractor employment."],
  ["WA", "Washington", "Olympia", "Seattle-area tech employment; statewide paid family leave and wage rules."],
  ["WV", "West Virginia", "Charleston", "Resource extraction employment; rural housing stock age issues."],
  ["WI", "Wisconsin", "Madison", "Manufacturing legacy; university-town rental regulation differences."],
  ["WY", "Wyoming", "Cheyenne", "Energy employment swings; sparse housing legal services outside Cheyenne/Casper."],
  ["DC", "District of Columbia", "Washington", "Not a state: unique local codes for housing and policing; federal enclaves matter."],
];

export const US_STATES: UsState[] = ROWS.map(([code, name, capital, notes]) => ({
  code,
  name,
  slug: code.toLowerCase(),
  capital,
  ...(notes ? { notes } : {}),
}));

const BY_SLUG = new Map(US_STATES.map((s) => [s.slug, s]));

export function getUsStateBySlug(slug: string): UsState | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}

export const US_STATE_TOPIC_SLUGS = ["rights", "police-stop", "landlord", "employment"] as const;
export type UsStateTopicSlug = (typeof US_STATE_TOPIC_SLUGS)[number];
