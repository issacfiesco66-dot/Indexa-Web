import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // el scan + ingest puede tardar con cientos de rows

/**
 * POST /api/funerarias/migrate
 *
 * Escanea `prospectos_frios` buscando funerarias (por keywords en nombre/categoria),
 * llama a HI /api/leads/funeraria (ingest idempotente), crea el doc en
 * `funeraria_leads` con el token devuelto por HI, y marca el doc original
 * con `migrated_to_hi: true` (no lo borra — auditoría).
 *
 * Auth: Firebase ID token del admin en Authorization: Bearer <token>.
 *
 * Body:
 *   { dryRun: boolean }    // true = solo contar/preview, false = ejecutar
 *
 * Respuesta:
 *   {
 *     ok: true,
 *     dryRun: boolean,
 *     scanned: number,         // total de prospectos_frios revisados
 *     matched: number,         // docs que parecen funerarias
 *     already_migrated: number,
 *     migrated: number,        // creados en funeraria_leads (solo si !dryRun)
 *     opt_out: number,         // saltados por opt-out en HI
 *     already_in_funnel: number,
 *     no_phone: number,
 *     errors: number,
 *     sample: Array<{nombre, phone, ciudad}>  // hasta 10 ejemplos para preview
 *   }
 */

// Regex MISMA que ScraperPanel — si agregamos keywords, actualizar ambos.
const FUNERARIA_KEYWORDS_RE = /funerar|funeral|funebr|f[uú]nebre|capilla|velatorio|velatoria|cremat|ataud|atau[dt]/i;

function looksLikeFuneraria(doc: Record<string, unknown>): boolean {
  const nombre = typeof doc.nombre === "string" ? doc.nombre : "";
  const categoria = typeof doc.categoria === "string" ? doc.categoria : "";
  return FUNERARIA_KEYWORDS_RE.test(`${categoria} ${nombre}`);
}

/** Normaliza teléfono MX a E.164 (+52...). Devuelve null si no se puede. */
function normalizeMxPhone(raw: string): string | null {
  if (!raw) return null;
  // Dejar solo + y dígitos, y permitir solo un + al inicio
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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const dryRun = (body as { dryRun?: unknown })?.dryRun !== false; // default true (preview)

  // 3. HI config
  const HI_BASE = (process.env.HI_API_BASE_URL ?? "https://historias-infinitas.com").replace(/\/$/, "");
  const HI_KEY = process.env.HI_INDEXA_API_KEY ?? "";
  if (!HI_KEY || HI_KEY.length < 16) {
    return NextResponse.json({ error: "hi_api_key_no_configurada" }, { status: 500 });
  }

  // 4. Scan prospectos_frios
  const db = getAdminDb();
  let scanned = 0;
  let matched = 0;
  let already_migrated = 0;
  let migrated = 0;
  let opt_out = 0;
  let already_in_funnel = 0;
  let no_phone = 0;
  let errors = 0;
  const sample: Array<{ nombre: string; phone: string; ciudad: string }> = [];

  const snap = await db.collection("prospectos_frios").get();
  scanned = snap.size;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (!looksLikeFuneraria(data)) continue;
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

    if (sample.length < 10) sample.push({ nombre, phone, ciudad });

    if (dryRun) continue;

    // 5. HI ingest
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
          city: ciudad || undefined,
          source: "indexa_migration",
          notes: `Migrado de prospectos_frios (${docSnap.id})`,
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (e) {
      console.error("[migrate] HI fetch error:", nombre, e);
      errors += 1;
      continue;
    }

    if (ingestRes.status === 403) {
      opt_out += 1;
      await docSnap.ref.update({ migrated_to_hi: true, hi_opt_out: true }).catch(() => undefined);
      continue;
    }
    if (ingestRes.status === 409) {
      const data409 = await ingestRes.json().catch(() => ({} as Record<string, unknown>));
      already_in_funnel += 1;
      // Intentamos linkear al funeraria_leads existente (solo marcamos el origen)
      await docSnap.ref
        .update({
          migrated_to_hi: true,
          hi_lead_id: typeof data409.lead_id === "string" ? data409.lead_id : null,
          hi_already_in_funnel: true,
        })
        .catch(() => undefined);
      continue;
    }
    if (!ingestRes.ok) {
      console.error("[migrate] HI ingest no-ok:", nombre, ingestRes.status);
      errors += 1;
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

    // 6. Verificar si ya existe en funeraria_leads (por phone) — evitar duplicados
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
      await docSnap.ref.update({ migrated_to_hi: true, hi_lead_id }).catch(() => undefined);
      migrated += 1;
    } catch (e) {
      console.error("[migrate] funeraria_leads write error:", nombre, e);
      errors += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    scanned,
    matched,
    already_migrated,
    migrated,
    opt_out,
    already_in_funnel,
    no_phone,
    errors,
    sample,
  });
}
