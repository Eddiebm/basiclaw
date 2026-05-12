import { hashIpForUsage } from "@/lib/request-ip";

export function usageSubjectForEmbed(
  embedTenant: { id: string } | null,
  userId: string | null,
  ipHash: string
): { usageUserId: string | null; usageIpHash: string } {
  if (embedTenant) {
    return { usageUserId: null, usageIpHash: hashIpForUsage(`embed-tenant:${embedTenant.id}`) };
  }
  return { usageUserId: userId, usageIpHash: ipHash };
}
