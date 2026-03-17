import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware:
 * 1. Maintenance Mode — redirects all public traffic to /mantenimiento
 *    when NEXT_PUBLIC_MAINTENANCE_MODE=true. Admin routes and API routes
 *    used by admins are excluded so the team can keep working.
 * 2. Admin Auth Gate — protects /admin/* routes (existing logic).
 */

const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

// Paths that ALWAYS bypass maintenance mode
const MAINTENANCE_BYPASS_PREFIXES = [
  "/admin",        // Admin panel (login + dashboard)
  "/api/admin",    // Admin API routes
  "/api/webhooks", // Stripe webhooks must always work
  "/mantenimiento", // The maintenance page itself
  "/_next",        // Next.js internals (static assets, HMR)
  "/favicon",      // Favicon
];

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Maintenance Mode ────────────────────────────────────────────
  if (MAINTENANCE_MODE) {
    const isBypassed = MAINTENANCE_BYPASS_PREFIXES.some((p) => pathname.startsWith(p));

    // Check for admin cookie — admins bypass maintenance even on public pages
    const hasAdminCookie =
      request.cookies.get("firebaseAuthToken")?.value ||
      request.cookies.get("__session")?.value;
    const adminBypass = !!hasAdminCookie && request.cookies.get("indexa_role")?.value === "admin";

    if (!isBypassed && !adminBypass) {
      const maintenanceUrl = new URL("/mantenimiento", request.url);
      return NextResponse.rewrite(maintenanceUrl);
    }
  }

  // ── 2. Admin Auth Gate ─────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow access to login page
    if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p)) {
      return NextResponse.next();
    }

    const authCookie =
      request.cookies.get("firebaseAuthToken")?.value ||
      request.cookies.get("__session")?.value;

    if (!authCookie) {
      const isRSC = request.headers.get("RSC") === "1" ||
        request.headers.get("Next-Router-State-Tree") !== null;
      if (isRSC) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes (needed for maintenance mode to intercept everything)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
