/**
 * Server-side auth verification for API routes.
 * Verifies Firebase ID tokens via the Google tokeninfo endpoint.
 * No firebase-admin SDK needed.
 */

import { normalizeRole, type UserRole } from "@/types/tenant";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

interface TokenPayload {
  uid: string;
  email: string;
  role?: UserRole;
}

/**
 * Verifies a Firebase ID token and returns the user's UID and email.
 * Returns null if the token is invalid or expired.
 */
export async function verifyIdToken(idToken: string): Promise<TokenPayload | null> {
  if (!idToken || !PROJECT_ID) return null;

  try {
    // Decode and verify token via Google's secure token verification endpoint
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const user = data.users?.[0];
    if (!user) return null;

    return {
      uid: user.localId,
      email: user.email ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Fetches the user's role from Firestore and returns the full payload.
 * Returns null if token is invalid or Firestore read fails.
 */
export async function verifyRole(
  idToken: string,
  allowedRoles?: UserRole[]
): Promise<TokenPayload | null> {
  const user = await verifyIdToken(idToken);
  if (!user) return null;

  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/usuarios/${user.uid}?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        headers: { Authorization: `Bearer ${idToken}` },
      }
    );
    if (!res.ok) return null;
    const doc = await res.json();
    const role = normalizeRole(doc.fields?.role?.stringValue);
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
  // "admin" role strings are normalized to "superadmin" by normalizeRole()
  return verifyRole(idToken, ["superadmin"]);
}

/**
 * Verifies a Firebase ID token AND checks that the user has the "agency" role.
 */
export async function verifyAgency(idToken: string): Promise<TokenPayload | null> {
  return verifyRole(idToken, ["agency"]);
}

/**
 * Extracts Bearer token from Authorization header or from request body's authToken field.
 */
export function extractToken(request: Request, bodyAuthToken?: string): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return bodyAuthToken || null;
}
