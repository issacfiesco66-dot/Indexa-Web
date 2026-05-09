import { NextRequest, NextResponse } from "next/server";
import {
  sendTemplateMessage,
  buildBodyParams,
  normalizePhoneByCountry,
  type PhoneCountry,
} from "@/lib/whatsapp";
import { verifyAdmin } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// 3 lotes/min por IP. Cada lote envía hasta MAX_BATCH mensajes con throttle interno.
const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });

const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "promo_clientes_aviso";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es_MX";
const TEMPLATE_NAME_USA =
  process.env.WHATSAPP_TEMPLATE_NAME_USA || process.env.WHATSAPP_TEMPLATE_NAME || "promo_clientes_aviso";
const TEMPLATE_LANG_USA = process.env.WHATSAPP_TEMPLATE_LANG_USA || "es";
const MAX_BATCH = 25;
// Throttle entre mensajes para no quemar el tier (Meta es estricto al inicio)
const DELAY_MS = 800;

interface ProspectoInput {
  id: string;
  nombre: string;
  telefono: string;
  /** Variables {{1}}..{{N}} de la plantilla. Si se omite, default = [nombre]. */
  bodyVars?: string[];
  /** Ciudad del prospecto — usada para inferir país automáticamente si no viene `pais`. */
  ciudad?: string;
  /** País explícito. "US" o "MX". Si se omite se infiere de `ciudad`. */
  pais?: string;
}

interface BulkBody {
  prospectos: ProspectoInput[];
  authToken: string;
  templateName?: string;
  /**
   * Si está activo, fuerza usar las plantillas USA (`WHATSAPP_TEMPLATE_NAME_USA`,
   * `WHATSAPP_TEMPLATE_LANG_USA`) para todos los prospectos del lote.
   * Útil para campañas dedicadas USA-Hispano sin tener que setear pais en cada item.
   */
  forceUsa?: boolean;
}

interface ResultItem {
  id: string;
  nombre: string;
  telefonoNormalizado?: string;
  paisDetectado?: PhoneCountry;
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
    const { prospectos, authToken, templateName, forceUsa } = body;

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
    const results: ResultItem[] = [];

    for (const p of prospectos) {
      const item: ResultItem = { id: p.id, nombre: p.nombre, sent: false };

      const { phone, country } = normalizePhoneByCountry(p.telefono, {
        ciudad: p.ciudad,
        pais: forceUsa ? "US" : p.pais,
      });
      if (!phone) {
        item.skipped = "no_phone";
        results.push(item);
        continue;
      }
      item.telefonoNormalizado = phone;
      item.paisDetectado = country;

      // Selecciona plantilla por país: USA usa template y lang independiente
      // (Meta exige idioma exacto registrado al aprobar el template).
      const useUsa = country === "US";
      const tplName =
        templateName || (useUsa ? TEMPLATE_NAME_USA : TEMPLATE_NAME);
      const tplLang = useUsa ? TEMPLATE_LANG_USA : TEMPLATE_LANG;

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
        languageCode: tplLang,
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
            wa_country: country,
            wa_template: tplName,
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
