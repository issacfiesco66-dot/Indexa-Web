import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware:
 * 1. Maintenance Mode — redirects all public traffic to /mantenimiento.
 * 2. Admin Auth Gate — /admin/* requires auth + superadmin role cookie.
 * 3. Agency Auth Gate — /agency/* requires auth + agency role cookie.
 */

const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

// Paths that ALWAYS bypass maintenance mode
const MAINTENANCE_BYPASS_PREFIXES = [
  "/admin",        // Admin panel (login + dashboard)
  "/agency",       // Agency panel
  "/api/admin",    // Admin API routes
  "/api/webhooks", // Stripe webhooks must always work
  "/mantenimiento", // The maintenance page itself
  "/_next",        // Next.js internals (static assets, HMR)
  "/favicon",      // Favicon
];

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const roleCookie = request.cookies.get("indexa_role")?.value || "";
  const authCookie =
    request.cookies.get("firebaseAuthToken")?.value ||
    request.cookies.get("__session")?.value;

  // ── 1. Maintenance Mode ────────────────────────────────────────────
  if (MAINTENANCE_MODE) {
    const isBypassed = MAINTENANCE_BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
    const adminBypass = !!authCookie && roleCookie === "superadmin";

    if (!isBypassed && !adminBypass) {
      const maintenanceUrl = new URL("/mantenimiento", request.url);
      return NextResponse.rewrite(maintenanceUrl);
    }
  }

  // Helper: skip RSC prefetch requests (let client-side guards handle them)
  const isRSC =
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-State-Tree") !== null;

  // ── 2. Admin Auth Gate — superadmin only ───────────────────────────
  if (pathname.startsWith("/admin")) {
    if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p)) {
      return NextResponse.next();
    }

    if (!authCookie) {
      if (isRSC) return NextResponse.next();
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If cookie exists but role is not superadmin, redirect
    if (roleCookie && roleCookie !== "superadmin") {
      if (isRSC) return NextResponse.next();
      if (roleCookie === "agency") {
        return NextResponse.redirect(new URL("/agency/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ── 3. Agency Auth Gate — agency (or superadmin) only ──────────────
  if (pathname.startsWith("/agency")) {
    if (!authCookie) {
      if (isRSC) return NextResponse.next();
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (roleCookie && roleCookie !== "agency" && roleCookie !== "superadmin") {
      if (isRSC) return NextResponse.next();
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes (needed for maintenance mode to intercept everything)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
