/**
 * HMAC-signed `state` parameter for OAuth flows.
 *
 * Carries the user's UID through the OAuth round-trip without needing a session
 * cookie (Indexa uses Firebase ID tokens, not cookies). The signature prevents
 * an attacker from forging a callback as another user, and the timestamp limits
 * the replay window.
 *
 * Format: base64url(JSON({uid, nonce, ts})).hex(hmac)
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

interface StatePayload {
  uid: string;
  nonce: string;
  ts: number;
  /** Optional provider tag for future multi-provider use */
  p?: string;
}

function getSecret(): Buffer {
  // Reuse the encryption key as HMAC secret — already a 256-bit secret per env.
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("TOKEN_ENCRYPTION_KEY missing or wrong length (need 64 hex chars).");
  }
  return Buffer.from(hex, "hex");
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signState(uid: string, provider = "meta"): string {
  const payload: StatePayload = {
    uid,
    nonce: randomBytes(8).toString("hex"),
    ts: Date.now(),
    p: provider,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = createHmac("sha256", getSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function verifyState(state: string, provider = "meta"): { uid: string } | null {
  if (!state || typeof state !== "string") return null;
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", getSecret()).update(body).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: StatePayload;
  try {
    payload = JSON.parse(fromB64url(body).toString("utf8")) as StatePayload;
  } catch {
    return null;
  }

  if (!payload.uid) return null;
  if (payload.p && payload.p !== provider) return null;
  if (Date.now() - payload.ts > MAX_AGE_MS) return null;

  return { uid: payload.uid };
}
