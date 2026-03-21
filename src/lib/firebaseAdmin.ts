import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Parse a service account JSON string and fix the private_key \n issue.
 * Vercel env vars can mangle the literal \n characters in private_key,
 * turning them into escaped \\n. This causes "Invalid PEM structure" errors.
 */
function parseServiceAccount(jsonString: string): Record<string, unknown> {
  const parsed = JSON.parse(jsonString);

  // Fix: Vercel sometimes double-escapes \n → \\n in private_key
  if (parsed.private_key && typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }

  return parsed;
}

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // Option 1: JSON string in env var (recommended for Vercel)
  // Supports both FIREBASE_SERVICE_ACCOUNT and FIREBASE_SERVICE_ACCOUNT_KEY
  const serviceAccountKey =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = parseServiceAccount(serviceAccountKey);
      console.log("[Firebase Admin] Initialized from env var (project:", serviceAccount.project_id, ")");
      return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
    } catch (err) {
      console.error("[Firebase Admin] Failed to parse service account JSON from env var:", err instanceof Error ? err.message : err);
      // fall through to next option
    }
  }

  // Option 2: Local file path (for local development)
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    try {
      const fullPath = resolve(process.cwd(), serviceAccountPath);
      const serviceAccount = parseServiceAccount(readFileSync(fullPath, "utf-8"));
      console.log("[Firebase Admin] Initialized from file:", serviceAccountPath);
      return initializeApp({ credential: cert(serviceAccount as Parameters<typeof cert>[0]) });
    } catch (err) {
      console.error("[Firebase Admin] Failed to read service account file:", err instanceof Error ? err.message : err);
      // fall through to next option
    }
  }

  // Option 3: Project ID only (limited — no admin auth, no writes without IAM)
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId) {
    console.warn("[Firebase Admin] Initialized with projectId only — limited functionality (no auth.createUser, no admin writes).");
    return initializeApp({ projectId });
  }

  throw new Error(
    "Firebase Admin: no credentials found. Set FIREBASE_SERVICE_ACCOUNT (JSON string), FIREBASE_SERVICE_ACCOUNT_PATH (file path), or NEXT_PUBLIC_FIREBASE_PROJECT_ID."
  );
}

let adminDb: Firestore | undefined;
let adminAuthInstance: Auth | undefined;

export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = getAdminApp();
    adminDb = getFirestore(app);
  }
  return adminDb;
}

export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    const app = getAdminApp();
    adminAuthInstance = getAuth(app);
  }
  return adminAuthInstance;
}
