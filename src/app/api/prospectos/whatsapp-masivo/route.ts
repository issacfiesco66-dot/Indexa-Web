import { NextRequest, NextResponse } from "next/server";
import { sendTemplateMessage, buildBodyParams, normalizePhoneMx } from "@/lib/whatsapp";
import { verifyAdmin } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// 3 lotes/min por IP. Cada lote envía hasta MAX_BATCH mensajes con throttle interno.
const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });

const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "promo_clientes_aviso";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es_MX";
const MAX_BATCH = 25;
// Throttle entre mensajes para no quemar el tier (Meta es estricto al inicio)
const DELAY_MS = 800;

interface ProspectoInput {
  id: string;
  nombre: string;
  telefono: string;
  /** Variables {{1}}..{{N}} de la plantilla. Si se omite, default = [nombre]. */
  bodyVars?: string[];
}

interface BulkBody {
  prospectos: ProspectoInput[];
  authToken: string;
  templateName?: string;
}

interface ResultItem {
  id: string;
  nombre: string;
  telefonoNormalizado?: string;
  sent: boolean;
  messageId?: string;
  error?: string;
  skipped?: "no_phone" | "opted_out";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    const body: BulkBody = await request.json();
    const { prospectos, authToken, templateName } = body;

    if (!prospectos?.length || !authToken) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros." },
        { status: 400 }
      );
    }

    const tokenUser = await verifyAdmin(authToken);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 403 }
      );
    }

    if (prospectos.length > MAX_BATCH) {
      return NextResponse.json(
        { success: false, message: `Máximo ${MAX_BATCH} prospectos por lote.` },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const tplName = templateName || TEMPLATE_NAME;
    const results: ResultItem[] = [];

    for (const p of prospectos) {
      const item: ResultItem = { id: p.id, nombre: p.nombre, sent: false };

      const phone = normalizePhoneMx(p.telefono);
      if (!phone) {
        item.skipped = "no_phone";
        results.push(item);
        continue;
      }
      item.telefonoNormalizado = phone;

      // Verifica opt-out en Firestore antes de mandar
      const ref = db.collection("prospectos_frios").doc(p.id);
      const snap = await ref.get();
      if (snap.exists && snap.data()?.wa_opted_out === true) {
        item.skipped = "opted_out";
        results.push(item);
        continue;
      }

      const vars = p.bodyVars && p.bodyVars.length ? p.bodyVars : [p.nombre];

      const r = await sendTemplateMessage({
        to: phone,
        templateName: tplName,
        languageCode: TEMPLATE_LANG,
        bodyParams: buildBodyParams(vars),
      });

      if (r.success) {
        item.sent = true;
        item.messageId = r.messageId;
        await ref.set(
          {
            wa_status: "sent",
            wa_message_id: r.messageId || "",
            wa_last_sent_at: FieldValue.serverTimestamp(),
            wa_last_error: FieldValue.delete(),
            telefono: p.telefono,
            nombre: p.nombre,
          },
          { merge: true }
        );
      } else {
        item.error = r.error;
        await ref.set(
          {
            wa_status: "failed",
            wa_last_error: r.error || "unknown",
            wa_last_attempt_at: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      }

      results.push(item);
      await sleep(DELAY_MS);
    }

    const sent = results.filter((r) => r.sent).length;
    const failed = results.filter((r) => r.error).length;
    const skipped = results.filter((r) => r.skipped).length;

    return NextResponse.json({
      success: true,
      message: `WhatsApp masivo: ${sent} enviados, ${failed} fallidos, ${skipped} omitidos.`,
      results,
    });
  } catch (err) {
    console.error("Bulk WhatsApp error:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
