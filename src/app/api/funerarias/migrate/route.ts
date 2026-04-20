import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/funerarias/migrate
 *
 * Escanea `prospectos_frios` buscando funerarias (por keywords en nombre/categoria)
 * y las migra a `funeraria_leads` con token de HI.
 *
 * Auth: Firebase ID token del admin en Authorization: Bearer <token>.
 *
 * Body:
 *   {
 *     dryRun?: boolean,       // default true — solo cuenta/preview (fast)
 *     limit?: number,         // default 30 — cuántas migrar por batch (ignorado en dryRun)
 *     startAfterId?: string,  // cursor doc-id para continuar (ignorado en dryRun)
 *   }
 *
 * Respuesta:
 *   {
 *     ok: true,
 *     dryRun: boolean,
 *     scanned: number,
 *     matched: number,
 *     already_migrated: number,
 *     migrated: number,
 *     opt_out: number,
 *     already_in_funnel: number,
 *     no_phone: number,
 *     errors: number,
 *     sample: Array<{nombre, phone, ciudad}>,   // hasta 10, solo en dryRun
 *     nextCursor: string | null,                // continuar con este startAfterId si != null
 *   }
 *
 * Flujo típico (cliente):
 *   1. POST {dryRun: true}  → ve counts totales
 *   2. loop while nextCursor != null:
 *        POST {dryRun: false, limit: 30, startAfterId: nextCursor}
 *        acumula stats
 */

// Regex MISMAS que ScraperPanel/scraper_funerarias — si agregamos keywords,
// actualizar los 3 lugares (ScraperPanel.tsx, scraper_funerarias.py, aquí).
const FUNERARIA_KEYWORDS_RE = /funerar|funeral|funebr|f[uú]nebre|capilla|velatorio|velatoria|cremat|ataud|atau[dt]/i;
const VETERINARIA_KEYWORDS_RE = /veterinari|vetmedi|cl[ií]nica vet|hospital vet/i;

const PAGE_SIZE = 500;          // páginas de Firestore para iterar sin cargar todo en memoria
const DEFAULT_MIGRATE_LIMIT = 30;

type Vertical = "funeraria" | "veterinaria" | "hospicio" | "geriatrico";

/** Devuelve la vertical detectada, o null si el doc no parece B2B relevante. */
function detectVertical(doc: Record<string, unknown>): Vertical | null {
  const nombre = typeof doc.nombre === "string" ? doc.nombre : "";
  const categoria = typeof doc.categoria === "string" ? doc.categoria : "";
  const text = `${categoria} ${nombre}`;
  if (FUNERARIA_KEYWORDS_RE.test(text)) return "funeraria";
  if (VETERINARIA_KEYWORDS_RE.test(text)) return "veterinaria";
  return null;
}

function normalizeMxPhone(raw: string): string | null {
  if (!raw) return null;
  let cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) cleaned = "+" + cleaned.slice(1).replace(/\+/g, "");
  else cleaned = cleaned.replace(/\+/g, "");

  if (cleaned.startsWith("+52") && cleaned.length === 13) return cleaned;
  if (cleaned.startsWith("+521") && cleaned.length === 14) return "+52" + cleaned.slice(4);
  if (cleaned.startsWith("52") && cleaned.length === 12) return "+" + cleaned;
  if (cleaned.startsWith("521") && cleaned.length === 13) return "+52" + cleaned.slice(3);
  const only = cleaned.replace(/\+/g, "");
  if (only.length === 10) return "+52" + only;
  if (cleaned.startsWith("+") && cleaned.length >= 11 && cleaned.length <= 16) return cleaned;
  return null;
}

async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getAdminDb().collection("usuarios").doc(uid).get();
    const role = snap.data()?.role;
    return role === "admin" || role === "superadmin";
  } catch {
    return false;
  }
}

interface MigrateBody {
  dryRun?: boolean;
  limit?: number;
  startAfterId?: string;
}

export async function POST(req: Request) {
  // 1. Auth
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return NextResponse.json({ error: "missing_token" }, { status: 401 });

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(match[1])).uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  if (!(await isUserAdmin(uid))) {
    return NextResponse.json({ error: "not_admin" }, { status: 403 });
  }

  // 2. Body
  let body: MigrateBody = {};
  try {
    body = (await req.json()) as MigrateBody;
  } catch {
    /* empty body allowed */
  }
  const dryRun = body.dryRun !== false;
  const migrateLimit = Math.min(100, Math.max(1, Number(body.limit) || DEFAULT_MIGRATE_LIMIT));
  const startAfterId = typeof body.startAfterId === "string" && body.startAfterId.length > 0
    ? body.startAfterId
    : null;

  // 3. HI config
  const HI_BASE = (process.env.HI_API_BASE_URL ?? "https://historias-infinitas.com").replace(/\/$/, "");
  const HI_KEY = process.env.HI_INDEXA_API_KEY ?? "";
  if (!HI_KEY || HI_KEY.length < 16) {
    return NextResponse.json({ error: "hi_api_key_no_configurada" }, { status: 500 });
  }

  const db = getAdminDb();

  // Counters
  let scanned = 0;
  let matched = 0;
  let already_migrated = 0;
  let migrated = 0;
  let opt_out = 0;
  let already_in_funnel = 0;
  let no_phone = 0;
  let errors = 0;
  const sample: Array<{ nombre: string; phone: string; ciudad: string }> = [];

  // ── DRY RUN: escanea todo en una pasada, rápido (solo reads) ──────────
  if (dryRun) {
    const snap = await db.collection("prospectos_frios").get();
    scanned = snap.size;
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const vertical = detectVertical(data);
      if (!vertical) continue;
      matched += 1;

      if (data.migrated_to_hi === true) {
        already_migrated += 1;
        continue;
      }

      const nombre = String(data.nombre ?? "").trim();
      const phone = normalizeMxPhone(String(data.telefono ?? "").trim());
      const ciudad = String(data.ciudad ?? "").trim();

      if (!nombre || !phone) {
        no_phone += 1;
        continue;
      }
      if (sample.length < 10) sample.push({ nombre, phone, ciudad });
    }

    return NextResponse.json({
      ok: true,
      dryRun: true,
      scanned,
      matched,
      already_migrated,
      migrated: 0,
      opt_out: 0,
      already_in_funnel: 0,
      no_phone,
      errors: 0,
      sample,
      nextCursor: null,
    });
  }

  // ── REAL MIGRATION: paginada, hasta `migrateLimit` migraciones por request ──
  let cursor: string | null = startAfterId;
  let lastSeenId: string | null = startAfterId;
  let reachedEnd = false;

  // Loop de páginas — cada página lee PAGE_SIZE docs; procesamos funerarias hasta llenar migrateLimit
  outer: while (migrated + errors + opt_out + already_in_funnel < migrateLimit) {
    let q = db
      .collection("prospectos_frios")
      .orderBy("__name__")
      .limit(PAGE_SIZE);
    if (cursor) {
      const cursorDoc = await db.collection("prospectos_frios").doc(cursor).get();
      if (cursorDoc.exists) q = q.startAfter(cursorDoc);
    }
    const pageSnap = await q.get();
    if (pageSnap.empty) {
      reachedEnd = true;
      break;
    }

    for (const docSnap of pageSnap.docs) {
      scanned += 1;
      lastSeenId = docSnap.id;
      cursor = docSnap.id;

      const data = docSnap.data();
      const vertical = detectVertical(data);
      if (!vertical) continue;
      matched += 1;

      if (data.migrated_to_hi === true) {
        already_migrated += 1;
        continue;
      }

      const nombre = String(data.nombre ?? "").trim();
      const phoneRaw = String(data.telefono ?? "").trim();
      const phone = normalizeMxPhone(phoneRaw);
      const ciudad = String(data.ciudad ?? "").trim();

      if (!nombre || !phone) {
        no_phone += 1;
        continue;
      }

      // HI ingest
      let ingestRes: Response;
      try {
        ingestRes = await fetch(`${HI_BASE}/api/leads/funeraria`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Indexa-Key": HI_KEY,
          },
          body: JSON.stringify({
            business_name: nombre,
            phone,
            vertical,
            city: ciudad || undefined,
            source: "indexa_migration",
            notes: `Migrado de prospectos_frios (${docSnap.id}) como ${vertical}`,
          }),
          signal: AbortSignal.timeout(15_000),
        });
      } catch (e) {
        console.error("[migrate] HI fetch error:", nombre, e);
        errors += 1;
        if (migrated + errors + opt_out + already_in_funnel >= migrateLimit) break outer;
        continue;
      }

      if (ingestRes.status === 403) {
        opt_out += 1;
        await docSnap.ref
          .update({ migrated_to_hi: true, hi_opt_out: true })
          .catch(() => undefined);
        if (migrated + errors + opt_out + already_in_funnel >= migrateLimit) break outer;
        continue;
      }
      if (ingestRes.status === 409) {
        const data409 = await ingestRes
          .json()
          .catch(() => ({} as Record<string, unknown>));
        already_in_funnel += 1;
        await docSnap.ref
          .update({
            migrated_to_hi: true,
            hi_lead_id: typeof data409.lead_id === "string" ? data409.lead_id : null,
            hi_already_in_funnel: true,
          })
          .catch(() => undefined);
        if (migrated + errors + opt_out + already_in_funnel >= migrateLimit) break outer;
        continue;
      }
      if (!ingestRes.ok) {
        console.error("[migrate] HI ingest no-ok:", nombre, ingestRes.status);
        errors += 1;
        if (migrated + errors + opt_out + already_in_funnel >= migrateLimit) break outer;
        continue;
      }

      const j = (await ingestRes.json()) as {
        ok?: boolean;
        lead_id?: string;
        token?: string;
        link?: string;
      };
      const hi_lead_id = j.lead_id ?? "";
      const hi_token = j.token ?? "";
      const hi_link = j.link ?? "";

      // ¿ya existe en funeraria_leads por phone?
      let existingFL = null;
      try {
        const existing = await db
          .collection("funeraria_leads")
          .where("phone", "==", phone)
          .limit(1)
          .get();
        if (!existing.empty) existingFL = existing.docs[0];
      } catch {
        /* ignore */
      }

      const nowIso = new Date().toISOString();
      const flPayload: Record<string, unknown> = {
        nombre,
        phone,
        ciudad,
        direccion: String(data.direccion ?? ""),
        status: "pendiente_envio",
        vertical,
        hi_lead_id,
        hi_token,
        hi_link,
        source: "indexa_migration",
        source_prospecto_id: docSnap.id,
        createdAt: existingFL ? existingFL.get("createdAt") ?? Timestamp.now() : Timestamp.now(),
        sentAt: existingFL?.get("sentAt") ?? null,
        engagedAt: existingFL?.get("engagedAt") ?? null,
        optedOutAt: existingFL?.get("optedOutAt") ?? null,
        migratedAt: nowIso,
      };

      try {
        if (existingFL) {
          await existingFL.ref.update(flPayload);
        } else {
          await db.collection("funeraria_leads").add(flPayload);
        }
        await docSnap.ref
          .update({ migrated_to_hi: true, hi_lead_id })
          .catch(() => undefined);
        migrated += 1;
      } catch (e) {
        console.error("[migrate] funeraria_leads write error:", nombre, e);
        errors += 1;
      }

      if (migrated + errors + opt_out + already_in_funnel >= migrateLimit) break outer;
    }

    // Si la página vino incompleta, ya no hay más
    if (pageSnap.size < PAGE_SIZE) {
      reachedEnd = true;
      break;
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: false,
    scanned,
    matched,
    already_migrated,
    migrated,
    opt_out,
    already_in_funnel,
    no_phone,
    errors,
    sample: [],
    nextCursor: reachedEnd ? null : lastSeenId,
  });
}
