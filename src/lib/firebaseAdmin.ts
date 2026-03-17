import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (serviceAccountPath) {
    try {
      const fullPath = resolve(process.cwd(), serviceAccountPath);
      const serviceAccount = JSON.parse(readFileSync(fullPath, "utf-8"));
      return initializeApp({ credential: cert(serviceAccount) });
    } catch {
      // Service account file not found — fall through to projectId
    }
  }

  if (projectId) {
    return initializeApp({ projectId });
  }

  throw new Error("Firebase Admin: no credentials found. Set FIREBASE_SERVICE_ACCOUNT_PATH or NEXT_PUBLIC_FIREBASE_PROJECT_ID.");
}

let adminDb: Firestore | undefined;

export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = getAdminApp();
    adminDb = getFirestore(app);
  }
  return adminDb;
}
