/**
 * 366 rotating “rights of the day” lines for the newsletter cron.
 * Broad, universal civic-literacy themes — not jurisdiction-specific legal claims.
 */

const BASE_THEMES: readonly string[] = [
  "Clarity about the law helps people plan their lives with confidence — literacy is a civic baseline, not a luxury.",
  "Fair procedures matter: people should understand what steps exist when a dispute arises.",
  "Equality before the law is a cornerstone idea in modern constitutionalism — no one should be arbitrary singled out.",
  "Freedom of thought and conscience is widely protected because autonomy underpins democratic legitimacy.",
  "Privacy protects dignity: personal data and intimate choices deserve thoughtful safeguards.",
  "Freedom of expression supports accountability — societies debate trade-offs between speech and safety.",
  "Peaceful assembly lets communities signal problems early; it is part of healthy civic feedback loops.",
  "Access to courts (or equivalent dispute forums) is part of making rights real in practice, not only on paper.",
  "Proportionality is a recurring legal idea: responses to harm should fit the scale of the problem.",
  "Non-discrimination norms aim to prevent unfair treatment based on protected characteristics.",
  "Children’s rights frameworks emphasise best interests of the child as a guiding standard.",
  "Property rights are balanced with public needs — takings and regulation are classic tension points.",
  "Environmental stewardship increasingly appears in constitutions as a shared responsibility.",
  "Health and safety regulation exists because markets alone rarely price all external risks.",
  "Labour protections reflect the idea that bargaining power is uneven without baseline rules.",
  "Education rights recognise that opportunity depends on skills and knowledge, not birth alone.",
  "Social security concepts vary, but many systems aim to reduce destitution after shocks.",
  "Immigration and citizenship rules illustrate how states define membership — and why clarity matters.",
  "Criminal justice norms stress legality, presumption of innocence, and humane treatment in detention.",
  "Victims’ rights movements highlight information, support, and participation in proceedings.",
  "Digital rights debates ask how old principles apply to new technologies like AI and surveillance.",
  "Transparency fights corruption: public access to information supports trust in institutions.",
  "Federalism and devolution distribute power so local communities can adapt rules sensibly.",
  "Separation of powers tries to prevent any single branch from dominating the others.",
  "Judicial independence is defended because courts often must decide against majorities.",
  "Emergency powers are dangerous without sunset clauses and oversight — history warns loudly.",
  "Referenda and elections embody popular sovereignty — but they still need fair rules and facts.",
  "Human dignity is a recurring constitutional anchor used to interpret open-textured guarantees.",
  "Remedies matter: a right without enforcement is often only a slogan.",
  "Legal pluralism exists in many societies — understanding which rule applies is half the battle.",
  "Contracts work because promises can be enforced — but unconscionable terms invite pushback.",
  "Consumer protection exists because information asymmetry is normal in complex markets.",
  "Whistleblower protections try to align private incentives with public integrity.",
  "Data minimisation is a privacy hygiene idea: collect only what you truly need.",
  "Accessibility is part of justice: people with disabilities should navigate systems on fair terms.",
  "Time limits exist to balance finality against fairness — statutes of limitations are everywhere.",
  "Good faith and honesty in dealings reduce litigation and rebuild trust after conflict.",
];

function build366(): readonly string[] {
  const rows: string[] = [];
  for (let day = 1; day <= 366; day += 1) {
    const base = BASE_THEMES[(day - 1) % BASE_THEMES.length]!;
    rows.push(
      `${base} (Day ${day} of 366 — a rotating universal theme for civic awareness; not tailored legal advice.)`
    );
  }
  return rows;
}

export const RIGHTS_OF_DAY: readonly string[] = build366();

export function rightOfDayForUtcIndex(dayOfYear: number): string {
  const idx = Math.min(Math.max(dayOfYear, 1), 366) - 1;
  return RIGHTS_OF_DAY[idx] ?? RIGHTS_OF_DAY[0]!;
}
