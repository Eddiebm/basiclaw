import type { Country } from "@/data/types";
import { LEGAL_SYSTEM_LABELS } from "@/data/types";
import type { TopicContent, TopicSlug } from "@/components/topics/TopicPage";

const TOPIC_TITLES: Record<TopicSlug, (country: Country) => string> = {
  rights: (c) => `Your Rights in ${c.name}`,
  "police-stop": (c) => `What to Do When Police Stop You in ${c.name}`,
  landlord: (c) => `Tenant Rights and Landlord Rules in ${c.name}`,
};

const TOPIC_PREFILLED: Record<TopicSlug, (country: Country) => string> = {
  rights: (c) => `Walk me through the most important constitutional rights I have in ${c.name} as an ordinary resident.`,
  "police-stop": (c) => `If a police officer stops me on the street in ${c.name}, what do I have to do, what can I refuse, and what should I document?`,
  landlord: (c) => `Explain the basic rules my landlord has to follow in ${c.name} \u2014 deposits, evictions, repairs, rent increases.`,
};

function locale3(es: string, fr: string, pt: string): Record<string, string> {
  return { es, fr, pt };
}

function articleFor(country: Country): string {
  const lower = country.name.toLowerCase();
  if (/^(a|e|i|o|u)/.test(lower)) return "an";
  if (lower.startsWith("united") || lower.startsWith("uk") || lower.startsWith("us")) return "the";
  if (lower.startsWith("the ")) return "";
  if (lower.endsWith("s")) return "";
  return "";
}

function principlesSentence(country: Country): string {
  const principles = country.constitution.keyPrinciples;
  if (principles.length === 0) return `${country.constitution.title} sets the framework for legal life in ${country.name}.`;
  const list = principles.slice(0, 3).join("; ");
  return `${country.constitution.title} (adopted ${country.constitution.yearAdopted}${
    country.constitution.yearLatestAmendment && country.constitution.yearLatestAmendment !== country.constitution.yearAdopted
      ? `, last amended ${country.constitution.yearLatestAmendment}`
      : ""
  }) anchors public life in ${country.name} on ideas like ${list}.`;
}

export function getTopicContent(country: Country, topic: TopicSlug): TopicContent {
  const article = articleFor(country);
  const subjectPhrase = article ? `${article} ${country.name}` : country.name;
  const legalSystem = LEGAL_SYSTEM_LABELS[country.legalSystem];
  const title = TOPIC_TITLES[topic](country);
  const prefilledQuestion = TOPIC_PREFILLED[topic](country);

  switch (topic) {
    case "rights":
      return {
        slug: topic,
        countryCode: country.code,
        title,
        titleByLocale: locale3(
          "Sus derechos en {country}",
          "Vos droits en {country}",
          "Os seus direitos em {country}"
        ),
        intro: `${country.name} is ${legalSystem.toLowerCase().includes("uncodified") ? "an uncodified-constitution jurisdiction" : `a ${legalSystem.toLowerCase()} jurisdiction`}, which shapes how your rights are written down and how you enforce them. ${principlesSentence(country)} This guide turns those principles into the rights you can actually claim.`,
        sections: [
          {
            id: "whereFrom",
            heading: "Where your rights come from",
            titleByLocale: locale3(
              "De dónde vienen sus derechos",
              "D'où viennent vos droits",
              "De onde vêm os seus direitos"
            ),
            body: `In ${country.name}, your most enforceable rights live in ${country.constitution.title}. Constitutions are the highest source of law — when an ordinary statute or government action contradicts them, courts can strike the lower rule down.`,
            bullets: country.constitution.keyPrinciples,
          },
          {
            id: "civilPolitical",
            heading: "Civil and political rights",
            titleByLocale: locale3(
              "Derechos civiles y políticos",
              "Droits civils et politiques",
              "Direitos civis e políticos"
            ),
            body: `Most modern constitutions, including ${country.name}'s, protect a core set of civil and political rights. The exact wording varies, but you can usually expect protections in these areas.`,
            bullets: [
              "Equality before the law and protection from discrimination",
              "Freedom of expression, assembly, and association",
              "The right to a fair hearing and to challenge unlawful detention",
              "Protection of private and family life",
              "Freedom of conscience and religion",
            ],
          },
          {
            id: "economicSocial",
            heading: "Economic, social, and cultural rights",
            titleByLocale: locale3(
              "Derechos económicos, sociales y culturales",
              "Droits économiques, sociaux et culturels",
              "Direitos económicos, sociais e culturais"
            ),
            body: `Some constitutions go further and recognise rights that the state must progressively realise — education, health, housing, work, social security. Whether these are directly enforceable in ${country.name} depends on the wording and on the courts' interpretation. Read the constitution page for the specific articles.`,
          },
          {
            id: "enforce",
            heading: "How to enforce a right",
            titleByLocale: locale3(
              "Cómo hacer valer un derecho",
              "Comment faire valoir un droit",
              "Como fazer valer um direito"
            ),
            body: `If you believe a right has been violated, the typical path is: document what happened (dates, witnesses, photos), preserve any official communication, then either file an internal complaint with the agency, escalate to a national human-rights or ombuds body, or bring the matter before a court. Time limits apply. A licensed lawyer in ${country.name} will know the local procedure.`,
            bullets: [
              "Write down a chronology while details are fresh",
              "Keep originals of letters, citations, or notices",
              "Find out which court or body has jurisdiction",
              "Ask whether you qualify for legal aid",
              "Don't sign anything you don't understand",
            ],
          },
          {
            id: "limits",
            heading: "Limits on rights",
            titleByLocale: locale3("Límites de los derechos", "Limites aux droits", "Limites aos direitos"),
            body: `Almost every right has limits — public health, public safety, the rights of others, national emergencies. Limits must usually be set out in law, pursue a legitimate aim, and be proportionate. Watch for limits that are vague, retroactive, or obviously targeted at a single group.`,
          },
          {
            id: "subnational",
            heading: "When the answer changes",
            titleByLocale: locale3(
              "Cuando cambia la respuesta",
              "Quand la réponse change",
              "Quando a resposta muda"
            ),
            body: `Rights look different the moment you cross into a sub-region (state, province, region) of ${country.name}. Federal or devolved governments often have their own bills of rights, criminal procedure, and family-law rules. Check both layers.`,
          },
        ],
        faqs: [
          {
            q: `Are constitutional rights in ${country.name} enforceable against private individuals or only the state?`,
            a: `Most constitutional rights bind the state directly. Whether they reach into private relationships (employment, contracts, social media) varies — some jurisdictions extend rights horizontally, others rely on ordinary statutes (anti-discrimination laws, labour codes) to do that work.`,
          },
          {
            q: `Can the government suspend my rights during an emergency?`,
            a: `Most constitutions allow temporary derogations during a declared emergency, but a hard core of rights (no torture, no slavery, presumption of innocence in serious matters) usually cannot be suspended even then. Watch for whether the declaration was made by the right body and whether parliament has reviewed it.`,
          },
          {
            q: `What is the difference between a right and a freedom?`,
            a: `In practice the words are used interchangeably. Strictly, a "freedom" describes a space the state must leave alone (e.g. freedom of speech), while a "right" implies a claim you can make (e.g. the right to a fair trial). The legal effect is similar.`,
          },
          {
            q: `Do non-citizens have the same rights in ${country.name}?`,
            a: `Most rights apply to "everyone" or "every person" and so cover non-citizens. A handful are reserved for citizens — typically voting, holding certain offices, and entry/residence. Check the wording of each article.`,
          },
        ],
        prefilledQuestion,
      };
    case "police-stop":
      return {
        slug: topic,
        countryCode: country.code,
        title,
        titleByLocale: locale3(
          "Qué hacer si la policía le detiene en {country}",
          "Que faire si la police vous arrête en {country}",
          "O que fazer se a polícia o parar em {country}"
        ),
        intro: `Police stops are one of the few moments where ordinary people directly encounter the criminal-procedure rules of their country. ${principlesSentence(country)} This page is a calm, plain-language guide to what to do — and what not to do — if a police officer stops you in ${subjectPhrase}.`,
        sections: [
          {
            id: "stayCalm",
            heading: "Stay calm and make the encounter visible",
            titleByLocale: locale3(
              "Mantenga la calma y haga visible el encuentro",
              "Restez calme et rendez la rencontre visible",
              "Mantenha a calma e torne o encontro visível"
            ),
            body: `Most jurisdictions, including ${country.name}, treat aggression toward officers as a separate offence. Keep your hands visible, speak clearly, and avoid sudden movements. If it is safe and lawful to do so, you may record the encounter — recording the police is generally protected speech in democratic states, with exceptions for active operations.`,
          },
          {
            id: "askWhy",
            heading: "Ask why you have been stopped",
            titleByLocale: locale3("Pregunte por qué le han parado", "Demandez pourquoi vous êtes arrêté", "Pergunte por que foi parado"),
            body: `Police are typically required to identify themselves and explain the reason for the stop in plain language. You can ask: "Am I being detained, or am I free to leave?" If the officer says you're free to leave, walk away calmly.`,
            bullets: [
              "Ask for the officer's name and ID number",
              "Ask under what authority you are being stopped",
              "Ask whether you are being arrested",
              "If detained, ask how long the detention is expected to last",
            ],
          },
          {
            id: "mustDo",
            heading: "What you usually have to do",
            titleByLocale: locale3(
              "Lo que normalmente debe hacer",
              "Ce que vous devez généralement faire",
              "O que normalmente deve fazer"
            ),
            body: `In most countries you must give your name and, if requested, identification documents. Some jurisdictions require you to confirm your address or date of birth. Lying about your identity is almost always a separate offence.`,
          },
          {
            id: "needNot",
            heading: "What you usually do not have to do",
            titleByLocale: locale3(
              "Lo que normalmente no tiene que hacer",
              "Ce que vous n'avez généralement pas à faire",
              "O que normalmente não tem de fazer"
            ),
            body: `You generally do not have to answer questions about where you have been, who you were with, or what you were doing. You can politely say: "I would like to speak to a lawyer before answering questions." You usually have the right to remain silent — though in some jurisdictions, silence can be used against you in later proceedings, so consult a local lawyer about the wording you should use.`,
          },
          {
            id: "searches",
            heading: "Searches",
            titleByLocale: locale3("Registros y requisas", "Perquisitions et fouilles", "Buscas e revistas"),
            body: `Rules vary by country and by what is being searched (your body, bag, vehicle, home). Many jurisdictions require either consent, a warrant, or specific statutory grounds (reasonable suspicion of a particular offence). You can usually ask: "Are you searching me with my consent or under a specific power?" Refusing a lawful search is normally an offence; consenting to a search waives your right to challenge it later.`,
          },
          {
            id: "arrested",
            heading: "If you are arrested",
            titleByLocale: locale3("Si le detienen", "Si vous êtes arrêté", "Se for preso"),
            body: `Arrest engages the strongest constitutional protections in ${country.name}: the right to be told why, the right to a lawyer, the right to silence (in most cases), and the right to be brought before a court within a defined window. ${country.constitution.title} or the criminal-procedure code will set the exact hours. Note the time of arrest and ask for it to be recorded.`,
          },
          {
            id: "after",
            heading: "After the encounter",
            titleByLocale: locale3("Después del encuentro", "Après l'interaction", "Depois do contacto"),
            body: `As soon as you are safe, write down the chronology: time, location, officer names and IDs, what was said, what was searched, and the names of any witnesses. If you were injured, photograph the injuries and seek medical attention. If your rights were violated, you can file a complaint with the police complaints body or take the matter to court.`,
          },
        ],
        faqs: [
          {
            q: `Can I refuse to show ID to a police officer in ${country.name}?`,
            a: `Most jurisdictions require you to identify yourself when lawfully stopped. Refusing is often a separate offence. Check the local rule, but as a default: identify yourself, then politely decline further questions until you have a lawyer.`,
          },
          {
            q: `Can I record the police?`,
            a: `Recording in public is generally protected as a form of expression in democratic states. Officers cannot lawfully delete your footage or take your phone without legal authority. There are limits in active operations, secure facilities, or where recording would interfere with an investigation.`,
          },
          {
            q: `What if I think the officer is acting unlawfully?`,
            a: `Comply in the moment to stay safe and avoid a separate "obstruction" charge. Document everything afterwards and challenge the action through the complaints process or the courts. Resist the temptation to escalate verbally on the street — it almost always makes the legal position worse.`,
          },
          {
            q: `Do I have to consent to a search?`,
            a: `If the officer has a lawful power to search you, your consent is irrelevant — the search will happen. If they don't, refusing consent preserves your ability to challenge any evidence later. A neutral phrase: "I do not consent to a search, but I will not physically obstruct you."`,
          },
        ],
        prefilledQuestion,
      };
    case "landlord":
      return {
        slug: topic,
        countryCode: country.code,
        title,
        titleByLocale: locale3(
          "Derechos del inquilino y normas del arrendador en {country}",
          "Droits du locataire et règles du bailleur en {country}",
          "Direitos do inquilino e regras do senhorio em {country}"
        ),
        intro: `Tenancy law varies more than almost any other field, even within a single country. Below is the typical pattern in ${legalSystem.toLowerCase()} jurisdictions, with pointers for ${country.name} specifically. Always check whether your sub-region (state, province, city) has its own statute.`,
        sections: [
          {
            id: "leaseContract",
            heading: "Your lease is a contract \u2014 but not the whole story",
            titleByLocale: locale3(
              "Su contrato de arrendamiento no es toda la historia",
              "Votre bail n'est pas toute l'histoire",
              "A sua renda não é a história toda"
            ),
            body: `In ${country.name}, the lease (or tenancy agreement) sets the day-to-day deal: rent, length, who pays for what. But statute almost always overrides certain clauses: a lease cannot waive your right to a habitable home, cannot forbid you from reporting safety issues, and cannot impose penalties for behaviour the law protects.`,
          },
          {
            id: "deposits",
            heading: "Deposits",
            titleByLocale: locale3("Fianzas y depósitos", "Dépôts de garantie", "Cauções e depósitos"),
            body: `A security deposit is the landlord's protection against damage and unpaid rent. Most jurisdictions cap it at one to three months' rent and require the landlord to either hold it in a separate account or register it with a deposit-protection scheme. At the end of the tenancy, the landlord must return the deposit (minus documented deductions) within a defined window.`,
            bullets: [
              "Get the deposit amount and account details in writing",
              "Take photos of the property's condition on move-in day",
              "Keep receipts for any repairs you pay for",
              "Ask, in writing, for an itemised breakdown of any deductions",
            ],
          },
          {
            id: "repairs",
            heading: "Repairs and habitability",
            titleByLocale: locale3(
              "Reparaciones y habitabilidad",
              "Réparations et habitabilité",
              "Reparações e habitabilidade"
            ),
            body: `Landlords are typically responsible for the structure, the roof, the plumbing, the heating, and anything covered by safety regulations (gas, electrical, fire). Tenants are typically responsible for keeping the place clean and reporting damage promptly. If the landlord refuses to do necessary repairs, the law often lets you escalate to the local authority, withhold rent into a separate account, or end the tenancy early.`,
          },
          {
            id: "rent",
            heading: "Rent increases",
            titleByLocale: locale3("Subidas de alquiler", "Augmentations de loyer", "Aumentos de renda"),
            body: `Whether rent can be raised mid-tenancy depends on the lease and on local rent-control rules. Some cities cap annual increases by an index; others require the landlord to give 30, 60, or 90 days' notice. A "take it or leave" rent hike that ignores a fixed-term lease is usually unenforceable.`,
          },
          {
            id: "eviction",
            heading: "Eviction",
            titleByLocale: locale3("Desalojo", "Expulsion", "Despejo"),
            body: `Eviction is one of the most regulated areas of housing law. In almost every jurisdiction the landlord must give written notice with a defined waiting period, then go through a court process to get a possession order. Self-help eviction \u2014 changing locks, removing belongings, cutting off services \u2014 is almost always illegal and can entitle you to damages.`,
            bullets: [
              "Written notice in the form the law requires",
              "A statutory waiting period before court action",
              "A court hearing where you can defend",
              "An enforcement officer (not the landlord) carrying out the eviction",
            ],
          },
          {
            id: "discrimination",
            heading: "Discrimination and retaliation",
            titleByLocale: locale3(
              "Discriminación y represalias",
              "Discrimination et représailles",
              "Discriminação e retaliação"
            ),
            body: `Landlords cannot lawfully refuse to rent, raise rent, or evict because of a tenant's race, religion, gender, family status, disability, or (in many places) source of income. Retaliation \u2014 trying to evict you because you reported a safety issue \u2014 is also banned in most modern systems and is good evidence of bad faith in court.`,
          },
          {
            id: "help",
            heading: "When to get help",
            titleByLocale: locale3("Cuándo pedir ayuda", "Quand demander de l'aide", "Quando pedir ajuda"),
            body: `Tenant unions, citizens' advice bureaux, and legal aid clinics in ${country.name} are usually free and know the local procedure cold. They can read your lease in five minutes and tell you whether the clause your landlord is leaning on is even enforceable.`,
          },
        ],
        faqs: [
          {
            q: `Can my landlord enter without notice?`,
            a: `Almost no jurisdiction allows the landlord to enter without notice, except in genuine emergencies (fire, flood, gas leak). Standard notice is 24 to 48 hours, in writing, at a reasonable hour. Repeated unannounced entry is harassment.`,
          },
          {
            q: `Can my landlord keep my deposit because of "wear and tear"?`,
            a: `No \u2014 normal wear and tear is the landlord's cost, not yours. Deductions must be for actual damage, supported by evidence (photos, invoices). Move-in photos are your best defence.`,
          },
          {
            q: `What happens if I break the lease early?`,
            a: `You usually owe rent until the landlord re-lets the unit, but the landlord must take reasonable steps to find a new tenant \u2014 they cannot leave the unit empty and bill you for the full term. Negotiate a written break clause if you can.`,
          },
          {
            q: `Can the landlord refuse to renew because they "want to sell"?`,
            a: `Some jurisdictions accept genuine sale or owner-occupation as a no-fault ground for ending a tenancy, with extra notice. Others require the landlord to actually sell or move in within a set window, and to pay compensation if they don't. Check the local statute carefully \u2014 this is a common cover for unlawful evictions.`,
          },
        ],
        prefilledQuestion,
      };
    default: {
      const _exhaustive: never = topic;
      throw new Error(`Unknown topic: ${_exhaustive}`);
    }
  }
}
