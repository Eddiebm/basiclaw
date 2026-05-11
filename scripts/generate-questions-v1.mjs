/**
 * Generates src/data/questions/questions.v1.jsonl (~1000 citizen questions).
 * Run: node scripts/generate-questions-v1.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/data/questions/questions.v1.jsonl");

const STAGES = [
  "child",
  "teen",
  "young-adult",
  "working-age",
  "family-formation",
  "midlife",
  "older-adult",
  "end-of-life",
];

const DOMAINS = [
  "identity-status",
  "money-debt-tax",
  "housing",
  "work",
  "policing-courts",
  "family-children",
  "health-incapacity",
  "digital-life",
  "business-self-employed",
  "cross-border-immigration",
  "consumer-rights",
  "inheritance-estate",
];

const ARCHETYPE_IDS = [
  "can-without-consent",
  "ignore-consequences",
  "deadline",
  "who-to-complain",
  "documents-needed",
  "enforceable-where",
  "how-much-charge",
  "can-refuse",
  "rights-when",
  "how-to-challenge",
  "what-counts-as",
  "crime-vs-civil",
];

function disclaimerTierForRisk(risk) {
  return risk === "none" ? "standard" : "elevated";
}

function subnationalForDomain(domain) {
  return domain === "housing" || domain === "work" || domain === "family-children";
}

function skipCell(stage, domain) {
  if (stage === "child" && domain === "business-self-employed") return true;
  if (stage === "child" && domain === "inheritance-estate") return true;
  if (stage === "teen" && domain === "inheritance-estate") return true;
  if (stage === "end-of-life" && domain === "digital-life") return true;
  return false;
}

function baseCount(stage, domain) {
  const w = {
    housing: 16,
    work: 15,
    "policing-courts": 15,
    "family-children": 14,
    "digital-life": 14,
    "money-debt-tax": 11,
    "consumer-rights": 10,
    "health-incapacity": 10,
    "cross-border-immigration": 10,
    "identity-status": 9,
    "business-self-employed": 9,
    "inheritance-estate": 9,
  };
  const sf = {
    child: 0.72,
    teen: 0.88,
    "young-adult": 1.0,
    "working-age": 1.05,
    "family-formation": 1.02,
    midlife: 0.98,
    "older-adult": 0.92,
    "end-of-life": 0.85,
  };
  let n = Math.round(w[domain] * sf[stage]);
  if (domain === "business-self-employed" && (stage === "child" || stage === "teen")) n = 0;
  if (domain === "inheritance-estate" && (stage === "child" || stage === "teen")) n = 0;
  if (stage === "end-of-life" && domain === "digital-life") n = 0;
  return Math.max(3, n);
}

const BANK = {
  "identity-status": (stage, i) => {
    const rows = [
      "Can a school share my personal information with others without my consent?",
      "What happens if I ignore a request to verify my identity?",
      "What is the deadline to correct an error on my official ID record?",
      "Who do I complain to about discrimination when accessing a public service?",
      "What documents do I need to prove my legal name and date of birth?",
      "Is an online terms-of-service notice enforceable if I never clicked it?",
      "How much can they charge for replacing a lost ID card?",
      "Can I refuse to answer questions about my religion or beliefs?",
      "What are my rights when someone demands my nationality or immigration status?",
      "How do I challenge a wrongful denial of a name or gender marker update?",
      "What counts as harassment based on a protected characteristic?",
      "When does repeated insults become a crime versus a civil dispute?",
    ];
    return rows[i % rows.length];
  },
  "money-debt-tax": (stage, i) => {
    const rows = [
      "Can a bank freeze my account without telling me first?",
      "What happens if I ignore letters from a debt collector?",
      "What is the deadline to dispute an incorrect charge on a bill?",
      "Who do I complain to about unfair lending or hidden fees?",
      "What documents do I need to apply for hardship relief on debts?",
      "Is a payment plan offered by text message enforceable if I did not sign?",
      "How much can they charge in late fees on a consumer loan?",
      "Can I refuse direct debit changes proposed by a utility provider?",
      "What are my rights when my wages are garnished or deducted?",
      "How do I challenge a tax assessment I believe is wrong?",
      "What counts as predatory lending under consumer protection rules?",
      "When does unpaid debt become a criminal matter versus a civil collection issue?",
    ];
    return rows[i % rows.length];
  },
  housing: (stage, i) => {
    const rows = [
      "Can my landlord enter my home without notice?",
      "What happens if I ignore an eviction notice?",
      "What is the deadline to respond to a termination of tenancy?",
      "Who do I complain to about unsafe housing conditions?",
      "What documents do I need to get my security deposit back?",
      "Is a verbal lease agreement enforceable if there is a dispute?",
      "How much can they raise rent during a fixed-term lease?",
      "Can I refuse entry for non-emergency repairs?",
      "What are my rights when heating or water fails for several days?",
      "How do I challenge an unlawful eviction attempt?",
      "What counts as harassment by a landlord or property manager?",
      "When does property damage become a criminal matter versus a civil claim?",
    ];
    return rows[i % rows.length];
  },
  work: (stage, i) => {
    const rows = [
      "Can my employer change my schedule without agreement?",
      "What happens if I ignore a workplace investigation interview request?",
      "What is the deadline to appeal a dismissal decision?",
      "Who do I complain to about unpaid wages or missing overtime?",
      "What documents do I need to prove employment and pay rates?",
      "Is a non-compete clause enforceable if I never received legal advice?",
      "How much can they deduct from pay for equipment or uniforms?",
      "Can I refuse unsafe work that risks serious injury?",
      "What are my rights when I report wrongdoing at work?",
      "How do I challenge discrimination in hiring or promotion?",
      "What counts as workplace bullying under the law?",
      "When does theft at work become a criminal matter versus internal discipline?",
    ];
    return rows[i % rows.length];
  },
  "policing-courts": (stage, i) => {
    const rows = [
      "Can police search my bag without a warrant?",
      "What happens if I ignore a summons to court?",
      "What is the deadline to file an appeal after a judgment?",
      "Who do I complain to about misconduct by law enforcement?",
      "What documents do I need to apply for legal aid or a public defender?",
      "Is a recorded confession made without a lawyer present always admissible?",
      "How much can courts award in costs after a small claim?",
      "Can I refuse to answer police questions without a lawyer?",
      "What are my rights when I am stopped in public?",
      "How do I challenge a fine or ticket I believe is unfair?",
      "What counts as self-defence versus excessive force?",
      "When does a fight become assault in criminal law versus a civil lawsuit?",
    ];
    return rows[i % rows.length];
  },
  "family-children": (stage, i) => {
    const rows = [
      "Can a guardian move a child to another city without the other parent’s consent?",
      "What happens if I ignore a child support payment order?",
      "What is the deadline to respond to custody-related court papers?",
      "Who do I complain to about unsafe contact during visitation?",
      "What documents do I need to prove income for support calculations?",
      "Is a handwritten parenting agreement enforceable years later?",
      "How much can agencies charge for certified copies of family court orders?",
      "Can I refuse mediation if I fear coercion?",
      "What are my rights when social services visit my home?",
      "How do I challenge an adoption or guardianship decision?",
      "What counts as neglect versus a disagreement about parenting style?",
      "When does family conflict become a criminal matter versus a private dispute?",
    ];
    return rows[i % rows.length];
  },
  "health-incapacity": (stage, i) => {
    const rows = [
      "Can a clinic share my medical records without consent?",
      "What happens if I ignore a bill from a hospital?",
      "What is the deadline to appeal a denied treatment authorization?",
      "Who do I complain to about dangerous care in a facility?",
      "What documents do I need to name someone to make decisions if I am incapacitated?",
      "Is an advance decision made years ago still enforceable?",
      "How much can they charge for copies of my medical file?",
      "Can I refuse treatment even if doctors disagree?",
      "What are my rights when I am detained for mental health assessment?",
      "How do I challenge a wrongful capacity determination?",
      "What counts as informed consent before a procedure?",
      "When does medical error become a criminal matter versus a compensation claim?",
    ];
    return rows[i % rows.length];
  },
  "digital-life": (stage, i) => {
    const rows = [
      "Can a platform delete my account without explanation?",
      "What happens if I ignore a copyright infringement notice?",
      "What is the deadline to request deletion of personal data?",
      "Who do I complain to about illegal content or harassment online?",
      "What documents do I need to prove ownership of an online account?",
      "Is a clickwrap contract enforceable for a minor’s account?",
      "How much can a provider charge to export my data?",
      "Can I refuse facial recognition at an airport kiosk?",
      "What are my rights when my private messages are leaked?",
      "How do I challenge a wrongful account suspension?",
      "What counts as cyberstalking under the law?",
      "When does online fraud become a criminal matter versus a bank dispute?",
    ];
    return rows[i % rows.length];
  },
  "business-self-employed": (stage, i) => {
    const rows = [
      "Can a client cancel a contract without paying for completed work?",
      "What happens if I ignore business registration renewal notices?",
      "What is the deadline to file required business tax returns?",
      "Who do I complain to about unfair competition or copied branding?",
      "What documents do I need to open a business bank account?",
      "Is a handshake deal with a supplier enforceable?",
      "How much can a marketplace charge in seller fees?",
      "Can I refuse a one-sided indemnity clause?",
      "What are my rights when a platform withholds payouts?",
      "How do I challenge a wrongful business licence denial?",
      "What counts as misleading advertising for a small business?",
      "When does unpaid invoices become theft versus a civil debt?",
    ];
    return rows[i % rows.length];
  },
  "cross-border-immigration": (stage, i) => {
    const rows = [
      "Can border officers confiscate my devices without a court order?",
      "What happens if I ignore a request to attend an immigration interview?",
      "What is the deadline to renew a residence permit?",
      "Who do I complain to about wrongful denial of a visa?",
      "What documents do I need to prove family ties for reunification?",
      "Is a job offer letter enough for a work permit application?",
      "How much can agencies charge for expedited processing?",
      "Can I refuse to sign documents I do not understand?",
      "What are my rights when facing removal or deportation proceedings?",
      "How do I challenge an incorrect entry ban?",
      "What counts as a sham marriage under immigration rules?",
      "When does overstaying become a criminal matter versus an administrative issue?",
    ];
    return rows[i % rows.length];
  },
  "consumer-rights": (stage, i) => {
    const rows = [
      "Can a store refuse a refund without a receipt?",
      "What happens if I ignore a recall notice for a product I bought?",
      "What is the deadline to return a defective item?",
      "Who do I complain to about misleading food labelling?",
      "What documents do I need to prove a purchase for a warranty claim?",
      "Is an extended warranty sold at checkout enforceable?",
      "How much can delivery companies charge for customs handling?",
      "Can I refuse an automatic subscription renewal?",
      "What are my rights when an online order never arrives?",
      "How do I challenge a credit report error?",
      "What counts as false advertising for a subscription service?",
      "When does selling counterfeit goods become a criminal matter?",
    ];
    return rows[i % rows.length];
  },
  "inheritance-estate": (stage, i) => {
    const rows = [
      "Can an executor sell property without beneficiaries’ consent?",
      "What happens if I ignore probate paperwork?",
      "What is the deadline to contest a will?",
      "Who do I complain to about mishandled estate funds?",
      "What documents do I need to prove entitlement to an inheritance?",
      "Is a handwritten will enforceable if witnesses are disputed?",
      "How much can professionals charge to administer an estate?",
      "Can I refuse to serve as an executor?",
      "What are my rights when someone hides assets after a death?",
      "How do I challenge an unfair distribution proposal?",
      "What counts as undue influence when a will is made?",
      "When does inheritance fraud become a criminal matter?",
    ];
    return rows[i % rows.length];
  },
};

function riskFor(stage, domain, i) {
  if (domain === "policing-courts" && i % 5 === 0) return "urgent-criminal";
  if (domain === "cross-border-immigration" && i % 6 === 0) return "immigration-removal";
  if (domain === "family-children" && i % 7 === 0) return "domestic-violence";
  if (domain === "family-children" && i % 9 === 0) return "child-welfare";
  if (domain === "health-incapacity" && i % 8 === 0) return "mental-health-hold";
  return "none";
}

function tweakQuestion(q, stage, index) {
  if (index === 0) return q;
  const suffixes = [
    " (practical checklist)",
    " — first steps",
    " — common myths",
    " — timelines and notices",
    " — evidence to gather",
  ];
  return `${q}${suffixes[index % suffixes.length]}`;
}

const questions = [];
for (const stage of STAGES) {
  for (const domain of DOMAINS) {
    if (skipCell(stage, domain)) continue;
    const n = baseCount(stage, domain);
    const fn = BANK[domain];
    for (let i = 0; i < n; i++) {
      const id = `qv1-${stage}-${domain}-${i}`;
      const archetype = ARCHETYPE_IDS[(i + domain.length + stage.length) % ARCHETYPE_IDS.length];
      const risk = riskFor(stage, domain, i);
      const baseQ = fn(stage, i);
      const question = tweakQuestion(baseQ, stage, i);
      questions.push({
        id,
        stage,
        domain,
        archetype,
        question,
        minJurisdiction: "country",
        subnationalRelevance: subnationalForDomain(domain),
        risk,
        disclaimerTier: disclaimerTierForRisk(risk),
        related: [],
      });
    }
  }
}

const byGroup = new Map();
for (const q of questions) {
  const k = `${q.stage}|${q.domain}`;
  if (!byGroup.has(k)) byGroup.set(k, []);
  byGroup.get(k).push(q.id);
}

for (const q of questions) {
  const k = `${q.stage}|${q.domain}`;
  const ids = byGroup.get(k).filter((x) => x !== q.id);
  q.related = ids.slice(0, 3);
}

const lines = questions.map((q) => JSON.stringify(q));
fs.writeFileSync(OUT, `${lines.join("\n")}\n`, "utf8");
console.log("Wrote", questions.length, "questions to", OUT);
