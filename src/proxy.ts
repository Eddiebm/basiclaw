import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

function shouldLogEmbedPageView(pathname: string, method: string): boolean {
  return method === "GET" && pathname.startsWith("/embed/") && !pathname.endsWith(".js");
}

function isEmbedBypassPath(pathname: string): boolean {
  return pathname === "/embed" || pathname.startsWith("/embed/");
}

const isProtectedPage = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/:locale/dashboard(.*)",
  "/:locale/account(.*)",
]);

const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()) &&
  Boolean(process.env.CLERK_SECRET_KEY?.trim());

function verifyCronAuthorization(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  if (request.headers.get("x-vercel-cron") === "1") {
    return true;
  }
  const want = process.env.CRON_SECRET?.trim();
  if (!want) return false;
  const authz = request.headers.get("authorization");
  if (!authz?.startsWith("Bearer ")) return false;
  return authz.slice(7) === want;
}

export default hasClerk
  ? clerkMiddleware(async (auth, request) => {
      const pathname = request.nextUrl.pathname;
      if (isEmbedBypassPath(pathname)) {
        if (shouldLogEmbedPageView(pathname, request.method)) {
          const ref = request.headers.get("referer") ?? "";
          console.log(
            JSON.stringify({
              type: "embed_page_request",
              path: pathname,
              referer: ref,
            })
          );
        }
        return NextResponse.next();
      }
      if (pathname.startsWith("/api/")) {
        if (pathname.startsWith("/api/cron")) {
          if (!verifyCronAuthorization(request)) {
            return NextResponse.json({ error: "unauthorized" }, { status: 401 });
          }
          return NextResponse.next();
        }
        if (pathname.startsWith("/api/me")) {
          await auth.protect();
          return NextResponse.next();
        }
        return NextResponse.next();
      }
      if (isProtectedPage(request)) {
        await auth.protect();
      }
      return intlMiddleware(request);
    })
  : async (request: NextRequest) => {
      const pathname = request.nextUrl.pathname;
      if (isEmbedBypassPath(pathname)) {
        if (shouldLogEmbedPageView(pathname, request.method)) {
          const ref = request.headers.get("referer") ?? "";
          console.log(
            JSON.stringify({
              type: "embed_page_request",
              path: pathname,
              referer: ref,
            })
          );
        }
        return NextResponse.next();
      }
      if (pathname.startsWith("/api/cron")) {
        if (!verifyCronAuthorization(request)) {
          return NextResponse.json({ error: "unauthorized" }, { status: 401 });
        }
        return NextResponse.next();
      }
      if (pathname.startsWith("/api/me")) {
        return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
      }
      return intlMiddleware(request);
    };

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/api/me/(.*)",
    "/api/cron/(.*)",
  ],
};
