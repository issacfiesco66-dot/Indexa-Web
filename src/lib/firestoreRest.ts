/**
 * Firestore REST API helper — works server-side WITHOUT service account keys.
 * Uses the web API key + project ID from environment variables.
 * Firestore security rules still apply (requests are unauthenticated).
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Type helpers ─────────────────────────────────────────────────────────

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields: Record<string, FirestoreValue> };
  timestampValue?: string;
}

interface FirestoreDocument {
  name: string;
  fields: Record<string, FirestoreValue>;
  createTime: string;
  updateTime: string;
}

function parseValue(val: FirestoreValue): unknown {
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.doubleValue !== undefined) return val.doubleValue;
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.nullValue !== undefined) return null;
  if (val.timestampValue !== undefined) return val.timestampValue;
  if (val.arrayValue) {
    return (val.arrayValue.values ?? []).map(parseValue);
  }
  if (val.mapValue) {
    return parseFields(val.mapValue.fields);
  }
  return null;
}

function parseFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = parseValue(val);
  }
  return result;
}

function extractDocId(name: string): string {
  return name.split("/").pop() ?? "";
}

function toFirestoreValue(val: unknown): FirestoreValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number") {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === "boolean") return { booleanValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Read a single document by collection and document ID.
 * Returns { id, data } or null if not found.
 * Pass authToken to authenticate (needed for non-public collections).
 */
export async function readDoc(
  collectionId: string,
  docId: string,
  authToken?: string
): Promise<{ id: string; data: Record<string, unknown> } | null> {
  if (!PROJECT_ID || !API_KEY) {
    console.error("Firestore REST: missing PROJECT_ID or API_KEY");
    return null;
  }

  const url = `${BASE_URL}/${collectionId}/${docId}?key=${API_KEY}`;
  const headers: Record<string, string> = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(url, { headers, cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error("Firestore REST read error:", res.status, await res.text());
    return null;
  }

  const doc: FirestoreDocument = await res.json();
  return { id: extractDocId(doc.name), data: parseFields(doc.fields) };
}

/**
 * Update (patch) specific fields on a document.
 * Only the provided fields are updated; other fields are left unchanged.
 * Pass authToken to authenticate (needed for protected writes).
 */
export async function updateDoc(
  collectionId: string,
  docId: string,
  data: Record<string, unknown>,
  authToken?: string
): Promise<boolean> {
  if (!PROJECT_ID || !API_KEY) {
    console.error("Firestore REST: missing PROJECT_ID or API_KEY");
    return false;
  }

  const fieldPaths = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const url = `${BASE_URL}/${collectionId}/${docId}?${fieldPaths}&key=${API_KEY}`;

  const fields: Record<string, FirestoreValue> = {};
  for (const [key, val] of Object.entries(data)) {
    fields[key] = toFirestoreValue(val);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    console.error("Firestore REST update error:", res.status, await res.text());
    return false;
  }

  return true;
}

/**
 * Create a document with a specific ID.
 * Pass authToken to authenticate.
 */
export async function createDoc(
  collectionId: string,
  docId: string,
  data: Record<string, unknown>,
  authToken?: string
): Promise<boolean> {
  if (!PROJECT_ID || !API_KEY) {
    console.error("Firestore REST: missing PROJECT_ID or API_KEY");
    return false;
  }

  const url = `${BASE_URL}/${collectionId}?documentId=${docId}&key=${API_KEY}`;

  const fields: Record<string, FirestoreValue> = {};
  for (const [key, val] of Object.entries(data)) {
    fields[key] = toFirestoreValue(val);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    console.error("Firestore REST create error:", res.status, await res.text());
    return false;
  }

  return true;
}

/**
 * Query a collection with a single field equality filter.
 * Returns an array of { id, data } objects.
 */
export async function queryCollection(
  collectionId: string,
  fieldPath: string,
  value: string,
  limit = 1
): Promise<{ id: string; data: Record<string, unknown> }[]> {
  if (!PROJECT_ID || !API_KEY) {
    console.error("Firestore REST: missing PROJECT_ID or API_KEY");
    return [];
  }

  const url = `${BASE_URL}:runQuery?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: {
          fieldFilter: {
            field: { fieldPath },
            op: "EQUAL",
            value: { stringValue: value },
          },
        },
        limit,
      },
    }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("Firestore REST query error:", res.status, await res.text());
    return [];
  }

  const results: { document?: FirestoreDocument }[] = await res.json();

  return results
    .filter((r) => r.document)
    .map((r) => ({
      id: extractDocId(r.document!.name),
      data: parseFields(r.document!.fields),
    }));
}

/**
 * List documents from a collection, returning only specified fields.
 * Useful for sitemap generation where we only need slugs.
 * Uses structuredQuery with select to minimize data transfer.
 */
export async function listCollectionFields(
  collectionId: string,
  fields: string[],
  maxResults = 500
): Promise<{ id: string; data: Record<string, unknown> }[]> {
  if (!PROJECT_ID || !API_KEY) {
    console.error("Firestore REST: missing PROJECT_ID or API_KEY");
    return [];
  }

  const url = `${BASE_URL}:runQuery?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        select: {
          fields: fields.map((f) => ({ fieldPath: f })),
        },
        limit: maxResults,
      },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error("Firestore REST list error:", res.status, await res.text());
    return [];
  }

  const results: { document?: FirestoreDocument }[] = await res.json();

  return results
    .filter((r) => r.document)
    .map((r) => ({
      id: extractDocId(r.document!.name),
      data: parseFields(r.document!.fields),
    }));
}

/**
 * Add a new document to a collection.
 * Returns the new document ID or null on failure.
 */
export async function addDocument(
  collectionId: string,
  data: Record<string, unknown>
): Promise<string | null> {
  if (!PROJECT_ID || !API_KEY) {
    console.error("Firestore REST: missing PROJECT_ID or API_KEY");
    return null;
  }

  const url = `${BASE_URL}/${collectionId}?key=${API_KEY}`;

  const fields: Record<string, FirestoreValue> = {};
  for (const [key, val] of Object.entries(data)) {
    fields[key] = toFirestoreValue(val);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    console.error("Firestore REST add error:", res.status, await res.text());
    return null;
  }

  const doc: FirestoreDocument = await res.json();
  return extractDocId(doc.name);
}
