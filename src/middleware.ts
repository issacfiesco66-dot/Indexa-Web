import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: protects /admin/* routes.
 * Checks for a Firebase auth session cookie (__session) or
 * the firebase-auth-token cookie set by the client.
 * If no session exists, redirects to /admin/login.
 */

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow access to login page itself
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Check for auth cookie (set by client-side AuthContext)
  const authCookie =
    request.cookies.get("firebaseAuthToken")?.value ||
    request.cookies.get("__session")?.value;

  if (!authCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
