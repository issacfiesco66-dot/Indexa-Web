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
  "/api/agency",   // Agency API routes
  "/api/webhooks", // Stripe webhooks must always work
  "/mantenimiento", // The maintenance page itself
  "/_next",        // Next.js internals (static assets, HMR)
  "/favicon",      // Favicon
];

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

// API routes exempt from CSRF (webhooks need external access)
const CSRF_EXEMPT_PREFIXES = [
  "/api/webhooks",
  "/api/cron",
  "/api/prospectos/ingest",
  "/api/contact",
  "/api/bio-visit",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 0. CSRF Protection — block cross-origin state-changing API requests ──
  const method = request.method;
  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
    !CSRF_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "Forbidden: cross-origin request" },
            { status: 403 }
          );
        }
      } catch {
        // Invalid origin header — block
        return NextResponse.json(
          { error: "Forbidden: invalid origin" },
          { status: 403 }
        );
      }
    }
  }

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

  // ── 4. Dashboard Gate — client + agency (support) + superadmin ─────
  if (pathname.startsWith("/dashboard")) {
    if (!authCookie) {
      if (isRSC) return NextResponse.next();
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // All authenticated roles can access /dashboard/*
    // BrandingProvider handles white-label injection client-side
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes (needed for maintenance mode to intercept everything)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
