import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { resolve } from "path";

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  // Option 1: JSON string in env var (recommended for Vercel)
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      return initializeApp({ credential: cert(serviceAccount) });
    } catch {
      // Invalid JSON — fall through
    }
  }

  // Option 2: Local file path (for local development)
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    try {
      const fullPath = resolve(process.cwd(), serviceAccountPath);
      const serviceAccount = JSON.parse(readFileSync(fullPath, "utf-8"));
      return initializeApp({ credential: cert(serviceAccount) });
    } catch {
      // Service account file not found — fall through
    }
  }

  // Option 3: Project ID only (limited — no admin writes)
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (projectId) {
    return initializeApp({ projectId });
  }

  throw new Error("Firebase Admin: no credentials found. Set FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_SERVICE_ACCOUNT_PATH, or NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
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
