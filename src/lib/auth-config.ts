// TODO: replace with full Clerk/Upstash/Stripe implementation.

export function isAuthEnabled(): boolean {
  return false;
}

export function isClerkEnabled(): boolean {
  return isAuthEnabled();
}

export function getCurrentUserId(): string | null {
  return null;
}
