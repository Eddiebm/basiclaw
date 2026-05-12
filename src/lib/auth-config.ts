import { auth } from "@clerk/nextjs/server";

export function isClerkEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() && process.env.CLERK_SECRET_KEY?.trim()
  );
}

/** Alias used by newer call sites — true when Clerk env is present. */
export function isAuthEnabled(): boolean {
  return isClerkEnabled();
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}
