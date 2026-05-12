import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getRedis } from "@/lib/redis-client";
import type { LawyerFeeStructure, LawyerPartnerTier, NotableReview } from "@/data/verified-lawyers";

const FILE_PATH = path.join(process.cwd(), "tmp", "basiclaw-partners.json");
const REDIS_KEY = "basiclaw:partners:v1";

/** Logical namespaces (also used inside the JSON blob today). */
export const PARTNER_STORAGE_NAMESPACES = {
  applications: "partners:applications",
  byCountry: "partners:byCountry:{code}",
  byId: "partners:byId:{id}",
  byPlan: "partners:byPlan",
  consultLeads: "lawyer-leads:submitted",
  converted: "lawyer-leads:converted",
} as const;

export type PartnerApplicationStatus = "pending" | "approved" | "rejected";

export type PartnerApplicationRecord = {
  id: string;
  status: PartnerApplicationStatus;
  name: string;
  email: string;
  barNumber?: string;
  country: string;
  /** Free-text practice areas from the intake form */
  practiceAreas: string;
  receivedAt: string;
};

export type PartnerLawyer = {
  id: string;
  slug: string;
  name: string;
  firmName?: string;
  country: string;
  jurisdiction: string;
  practiceAreas: string[];
  languages: string[];
  headshotUrl?: string;
  websiteUrl?: string;
  phone?: string;
  email?: string;
  feeStructure?: LawyerFeeStructure;
  acceptsRemoteClients?: boolean;
  notableReviews?: NotableReview[];
  referralCommissionPct?: number;
  partnerTier: LawyerPartnerTier;
  bio?: string;
  approvedAt: string;
  sourceApplicationId?: string;
};

export type LawyerConsultLeadRecord = {
  id: string;
  lawyerSlug: string;
  lawyerId: string;
  kind: "verified" | "partner";
  fromName: string;
  fromEmail: string;
  message: string;
  receivedAt: string;
};

export type LawyerConvertedLeadRecord = {
  id: string;
  lawyerSlug: string;
  lawyerId: string;
  kind: "verified" | "partner";
  estimatedValueUsd?: number;
  note?: string;
  convertedAt: string;
};

type PartnerStoreShape = {
  applications: PartnerApplicationRecord[];
  lawyers: PartnerLawyer[];
  consultLeads: LawyerConsultLeadRecord[];
  convertedLeads: LawyerConvertedLeadRecord[];
};

async function readFileStore(): Promise<PartnerStoreShape> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PartnerStoreShape>;
    return {
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
      lawyers: Array.isArray(parsed.lawyers) ? parsed.lawyers : [],
      consultLeads: Array.isArray(parsed.consultLeads) ? parsed.consultLeads : [],
      convertedLeads: Array.isArray(parsed.convertedLeads) ? parsed.convertedLeads : [],
    };
  } catch {
    return { applications: [], lawyers: [], consultLeads: [], convertedLeads: [] };
  }
}

async function writeFileStore(data: PartnerStoreShape): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function readStore(): Promise<PartnerStoreShape> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(REDIS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<PartnerStoreShape>;
        return {
          applications: Array.isArray(parsed.applications) ? parsed.applications : [],
          lawyers: Array.isArray(parsed.lawyers) ? parsed.lawyers : [],
          consultLeads: Array.isArray(parsed.consultLeads) ? parsed.consultLeads : [],
          convertedLeads: Array.isArray(parsed.convertedLeads) ? parsed.convertedLeads : [],
        };
      } catch {
        /* fall through */
      }
    }
  }
  return readFileStore();
}

async function writeStore(data: PartnerStoreShape): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, JSON.stringify(data));
    return;
  }
  await writeFileStore(data);
}

export async function appendPartnerApplication(input: Omit<PartnerApplicationRecord, "id" | "status" | "receivedAt">): Promise<PartnerApplicationRecord> {
  const store = await readStore();
  const row: PartnerApplicationRecord = {
    ...input,
    id: randomUUID(),
    status: "pending",
    receivedAt: new Date().toISOString(),
  };
  store.applications.unshift(row);
  await writeStore(store);
  return row;
}

/** Approved partners only — never returns pending applications. */
export async function listApprovedPartnerLawyers(): Promise<PartnerLawyer[]> {
  const store = await readStore();
  return store.lawyers.filter((l) => Boolean(l.slug));
}

export async function getPartnerLawyerBySlug(slug: string): Promise<PartnerLawyer | undefined> {
  const s = slug.trim().toLowerCase();
  const store = await readStore();
  return store.lawyers.find((l) => l.slug.toLowerCase() === s);
}

/**
 * Promote a pending application to an approved directory partner.
 * Intended for manual admin / scripts — not exposed publicly.
 */
export async function approvePartnerApplication(applicationId: string, tier: LawyerPartnerTier): Promise<PartnerLawyer | null> {
  const store = await readStore();
  const app = store.applications.find((a) => a.id === applicationId && a.status === "pending");
  if (!app) return null;

  const baseSlug = `${app.name}-${app.country}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const slug = `${baseSlug || "partner"}-${randomUUID().slice(0, 6)}`;

  const practiceAreas = app.practiceAreas
    .split(/[,;\n]+/)
    .map((x) => x.trim())
    .filter(Boolean);

  const lawyer: PartnerLawyer = {
    id: randomUUID(),
    slug,
    name: app.name,
    country: app.country.toUpperCase(),
    jurisdiction: `${app.country.toUpperCase()} — partner directory (pending manual bio)`,
    practiceAreas: practiceAreas.length > 0 ? practiceAreas : ["General practice"],
    languages: ["English"],
    email: app.email,
    partnerTier: tier,
    approvedAt: new Date().toISOString(),
    sourceApplicationId: app.id,
    bio: `Approved partner listing created from application ${app.id}. Replace this bio in storage.`,
  };

  app.status = "approved";
  store.lawyers.unshift(lawyer);
  await writeStore(store);
  return lawyer;
}

export async function appendLawyerConsultLead(input: Omit<LawyerConsultLeadRecord, "id" | "receivedAt">): Promise<LawyerConsultLeadRecord> {
  const store = await readStore();
  const row: LawyerConsultLeadRecord = {
    ...input,
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
  };
  store.consultLeads.unshift(row);
  await writeStore(store);
  return row;
}

export async function appendConvertedLead(input: Omit<LawyerConvertedLeadRecord, "id" | "convertedAt">): Promise<LawyerConvertedLeadRecord> {
  const store = await readStore();
  const row: LawyerConvertedLeadRecord = {
    ...input,
    id: randomUUID(),
    convertedAt: new Date().toISOString(),
  };
  store.convertedLeads.unshift(row);
  await writeStore(store);
  return row;
}
