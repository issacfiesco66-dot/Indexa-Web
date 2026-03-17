/**
 * Server-side auth verification for API routes.
 * Verifies Firebase ID tokens via the Google tokeninfo endpoint.
 * No firebase-admin SDK needed.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

interface TokenPayload {
  uid: string;
  email: string;
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
 * Extracts Bearer token from Authorization header or from request body's authToken field.
 */
export function extractToken(request: Request, bodyAuthToken?: string): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return bodyAuthToken || null;
}
