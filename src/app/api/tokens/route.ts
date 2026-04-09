import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { encryptToken, decryptToken, isEncrypted } from "@/lib/tokenCrypto";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

// Fields that get encrypted at rest
const ENCRYPTED_FIELDS = ["metaAccessToken", "nanoBananaApiKey"] as const;
// Fields stored in plaintext (not sensitive secrets)
const PLAIN_FIELDS = ["metaAdAccountId", "metaPageId"] as const;
const ALL_FIELDS = [...ENCRYPTED_FIELDS, ...PLAIN_FIELDS] as const;

type TokenField = (typeof ALL_FIELDS)[number];

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const user = await verifyIdToken(idToken);
  if (!user) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  let body: { action?: string; tokens?: Partial<Record<TokenField, string>> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const { action } = body;
  const db = getAdminDb();
  const docRef = db.collection("usuarios").doc(user.uid);

  try {
    // ── Save: encrypt sensitive fields and write to Firestore ────
    if (action === "save") {
      const tokens = body.tokens;
      if (!tokens) return NextResponse.json({ error: "Faltan tokens." }, { status: 400 });

      const update: Record<string, string> = {};
      for (const field of ENCRYPTED_FIELDS) {
        if (field in tokens) {
          const val = tokens[field]?.trim() || "";
          update[field] = val ? encryptToken(val) : "";
        }
      }
      for (const field of PLAIN_FIELDS) {
        if (field in tokens) {
          let val = tokens[field]?.trim() || "";
          if (field === "metaAdAccountId") val = val.replace("act_", "");
          update[field] = val;
        }
      }

      if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: "No hay campos para guardar." }, { status: 400 });
      }

      await docRef.set(update, { merge: true });
      return NextResponse.json({ success: true });
    }

    // ── Load: read from Firestore and decrypt sensitive fields ───
    if (action === "load") {
      const snap = await docRef.get();
      if (!snap.exists) return NextResponse.json({ tokens: {} });

      const data = snap.data() || {};
      const result: Partial<Record<TokenField, string>> = {};

      for (const field of ENCRYPTED_FIELDS) {
        const raw = data[field] as string | undefined;
        if (raw) {
          result[field] = decryptToken(raw);
          // Auto-migrate: if stored in plaintext, re-encrypt
          if (!isEncrypted(raw)) {
            await docRef.update({ [field]: encryptToken(raw) });
          }
        }
      }
      for (const field of PLAIN_FIELDS) {
        if (data[field]) result[field] = data[field] as string;
      }

      return NextResponse.json({ tokens: result });
    }

    // ── Clear: wipe token fields ────────────────────────────────
    if (action === "clear") {
      const update: Record<string, string> = {};
      for (const field of ALL_FIELDS) update[field] = "";
      await docRef.set(update, { merge: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno.";
    console.error("[api/tokens] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
