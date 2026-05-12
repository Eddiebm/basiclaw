import { currentUser } from "@clerk/nextjs/server";
import { isAuthEnabled } from "@/lib/auth-config";

function adminEmailSet(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function isAdminUser(): Promise<boolean> {
  if (!isAuthEnabled()) return false;
  try {
    const user = await currentUser();
    if (!user) return false;
    const role = user.publicMetadata?.role;
    if (role === "admin") return true;
    const emails = adminEmailSet();
    if (emails.size === 0) return false;
    for (const e of user.emailAddresses) {
      const addr = e.emailAddress?.toLowerCase();
      if (addr && emails.has(addr)) return true;
    }
    return false;
  } catch {
    return false;
  }
}
