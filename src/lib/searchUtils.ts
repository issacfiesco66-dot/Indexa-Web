import Fuse, { type IFuseOptions } from "fuse.js";

// ── Phone normalization ──────────────────────────────────────────────
/** Strip all non-digit chars so "(55) 1234-5678" → "5512345678" */
export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

// ── Search index builder (Tarea 3) ──────────────────────────────────
/**
 * Generates a `searchIndex` array for a Firestore document.
 * Contains: nombre lowercase, phone digits-only, email lowercase.
 * Used with Firestore `array-contains` for server-side pre-filtering.
 */
export function buildSearchIndex(fields: {
  nombre?: string;
  telefono?: string;
  email?: string;
}): string[] {
  const tokens: string[] = [];

  if (fields.nombre) {
    const lower = fields.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    tokens.push(lower);
    // Also push individual words for partial matching
    lower.split(/\s+/).forEach((w) => {
      if (w.length >= 2) tokens.push(w);
    });
  }

  if (fields.telefono) {
    const digits = normalizePhone(fields.telefono);
    if (digits.length >= 4) tokens.push(digits);
    // Push last 10 digits (common MX format)
    if (digits.length > 10) tokens.push(digits.slice(-10));
  }

  if (fields.email) {
    tokens.push(fields.email.toLowerCase());
    // Push the local part before @
    const local = fields.email.split("@")[0]?.toLowerCase();
    if (local && local.length >= 2) tokens.push(local);
  }

  return [...new Set(tokens)];
}

// ── Fuse.js fuzzy search (Tarea 2) ──────────────────────────────────

/**
 * Creates a Fuse instance with INDEXA defaults.
 * threshold=0.3 → tolerates ~1 typo per 3 chars.
 */
export function createFuseSearch<T>(
  items: T[],
  keys: string[],
  options?: Partial<IFuseOptions<T>>
): Fuse<T> {
  return new Fuse(items, {
    keys,
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 2,
    ...options,
  });
}

/**
 * Runs a fuzzy search. Returns full list when query is empty.
 * Normalizes phone-like queries (strips formatting) before searching.
 */
export function fuzzySearch<T>(
  fuse: Fuse<T>,
  query: string,
  allItems: T[]
): T[] {
  const q = query.trim();
  if (!q) return allItems;

  // If query is mostly digits, normalize it for phone matching
  const digits = normalizePhone(q);
  const isPhoneLike = digits.length >= 3 && digits.length / q.replace(/\s/g, "").length > 0.6;
  const searchQuery = isPhoneLike ? digits : q;

  const results = fuse.search(searchQuery);
  return results.map((r) => r.item);
}

// ── Pre-process items: add a _phoneNorm virtual field ────────────────
/**
 * Adds a `_phoneNorm` field (digits-only) to each item so Fuse can
 * match phone numbers regardless of formatting.
 */
export function withPhoneNorm<T extends Record<string, unknown>>(
  items: T[],
  phoneField: string = "telefono"
): (T & { _phoneNorm: string })[] {
  return items.map((item) => ({
    ...item,
    _phoneNorm: normalizePhone(String(item[phoneField] ?? "")),
  }));
}
