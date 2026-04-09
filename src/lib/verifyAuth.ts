/**
 * Server-side auth verification for API routes.
 * Uses Firebase Admin SDK for proper JWT verification (signature, expiry, audience).
 */

import { normalizeRole, type UserRole } from "@/types/tenant";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { getAdminDb } from "@/lib/firebaseAdmin";

interface TokenPayload {
  uid: string;
  email: string;
  role?: UserRole;
}

/**
 * Verifies a Firebase ID token using the Admin SDK.
 * Checks signature, expiry, audience, and issuer.
 * Returns null if the token is invalid or expired.
 */
export async function verifyIdToken(idToken: string): Promise<TokenPayload | null> {
  if (!idToken) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Verifies token AND fetches the user's role from Firestore via Admin SDK.
 * Uses server credentials — immune to client-side role tampering.
 */
export async function verifyRole(
  idToken: string,
  allowedRoles?: UserRole[]
): Promise<TokenPayload | null> {
  const user = await verifyIdToken(idToken);
  if (!user) return null;

  try {
    const doc = await getAdminDb().collection("usuarios").doc(user.uid).get();
    if (!doc.exists) return null;
    const role = normalizeRole(doc.data()?.role);
    user.role = role;
    if (allowedRoles && !allowedRoles.includes(role)) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Verifies a Firebase ID token AND checks that the user has the "admin" or "superadmin" role.
 * Returns the user payload if admin, null otherwise.
 */
export async function verifyAdmin(idToken: string): Promise<TokenPayload | null> {
  return verifyRole(idToken, ["superadmin"]);
}

/**
 * Verifies a Firebase ID token AND checks that the user has the "agency" role.
 */
export async function verifyAgency(idToken: string): Promise<TokenPayload | null> {
  return verifyRole(idToken, ["agency"]);
}

/**
 * Extracts Bearer token from Authorization header.
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}
