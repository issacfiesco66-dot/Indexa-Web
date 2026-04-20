import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/funerarias/baja
 *
 * Invocado por /admin/prospectos (pestaña Funerarias) cuando el admin marca
 * a una funeraria como BAJA. Hace dos cosas:
 *   1. Notifica a HI con POST /api/leads/funeraria/optout  → HI bloquea el
 *      teléfono para que indexa no lo re-introduzca en futuras tandas.
 *   2. Actualiza el doc Firestore `funeraria_leads/{leadId}` con status='baja'.
 *
 * Auth: Firebase ID token del admin en header `Authorization: Bearer <token>`.
 *
 * Body: { leadId: string, phone: string, reason?: string }
 */

async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getAdminDb().collection("usuarios").doc(uid).get();
    const role = snap.data()?.role;
    return role === "admin" || role === "superadmin";
  } catch (e) {
    console.error("[funerarias/baja] isUserAdmin error:", e);
    return false;
  }
}

export async function POST(req: Request) {
  // 1. Verificar Firebase ID token
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json({ error: "missing_token" }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(match[1]);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  if (!(await isUserAdmin(uid))) {
    return NextResponse.json({ error: "not_admin" }, { status: 403 });
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "json_invalido" }, { status: 400 });
  }
  const b = (body ?? {}) as { leadId?: unknown; phone?: unknown; reason?: unknown };
  const leadId = typeof b.leadId === "string" ? b.leadId.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const reason =
    typeof b.reason === "string" && b.reason.trim().length > 0
      ? b.reason.trim().slice(0, 500)
      : undefined;

  if (!leadId || !phone) {
    return NextResponse.json({ error: "leadId_y_phone_requeridos" }, { status: 400 });
  }
  if (phone.length > 30 || leadId.length > 100) {
    return NextResponse.json({ error: "campo_muy_largo" }, { status: 400 });
  }

  // 3. Notificar a HI — llamamos primero porque es el que tiene más valor
  //    (si falla Firestore al final, HI ya quedó seguro).
  const HI_BASE = (process.env.HI_API_BASE_URL ?? "https://historias-infinitas.com").replace(/\/$/, "");
  const HI_KEY = process.env.HI_INDEXA_API_KEY ?? "";
  if (!HI_KEY || HI_KEY.length < 16) {
    return NextResponse.json({ error: "hi_api_key_no_configurada" }, { status: 500 });
  }

  let hiOk = false;
  let hiErrorMsg: string | undefined;
  try {
    const res = await fetch(`${HI_BASE}/api/leads/funeraria/optout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Indexa-Key": HI_KEY,
      },
      body: JSON.stringify({ phone, reason }),
      // timeout corto: si HI no responde, seguimos con Firestore
      signal: AbortSignal.timeout(10_000),
    });
    hiOk = res.ok;
    if (!res.ok) {
      hiErrorMsg = `HI respondió ${res.status}`;
      console.error("[funerarias/baja] HI optout no OK:", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[funerarias/baja] HI fetch error:", e);
    hiErrorMsg = e instanceof Error ? e.message : "error_red_hi";
  }

  // 4. Firestore update
  try {
    const update: Record<string, unknown> = {
      status: "baja",
      optedOutAt: new Date().toISOString(),
    };
    if (reason) update.optOutReason = reason;
    await getAdminDb().collection("funeraria_leads").doc(leadId).update(update);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "firestore_error";
    console.error("[funerarias/baja] Firestore update falló:", msg);
    return NextResponse.json(
      { error: "firestore_update_fallido", hi_ok: hiOk, hi_error: hiErrorMsg },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, hi_ok: hiOk, hi_error: hiErrorMsg });
}
