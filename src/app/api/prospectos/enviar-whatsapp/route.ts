import { NextRequest, NextResponse } from "next/server";
import { sendTemplateMessage, buildBodyParams, normalizePhoneMx } from "@/lib/whatsapp";
import { verifyAdmin } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "promo_clientes_aviso";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "es_MX";

interface SendBody {
  prospectoId: string;
  authToken: string;
  /** Variables para la plantilla, en orden {{1}}, {{2}}, ... */
  bodyVars?: string[];
  /** Override opcional del nombre de plantilla. */
  templateName?: string;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    const body: SendBody = await request.json();
    const { prospectoId, authToken, bodyVars, templateName } = body;

    if (!prospectoId || !authToken) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros: prospectoId y authToken." },
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

    const db = getAdminDb();
    const ref = db.collection("prospectos_frios").doc(prospectoId);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json(
        { success: false, message: "Prospecto no encontrado." },
        { status: 404 }
      );
    }
    const data = snap.data() || {};
    const telefono = (data.telefono as string) || "";
    const nombre = (data.nombre as string) || "";

    const phone = normalizePhoneMx(telefono);
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "El prospecto no tiene un teléfono válido." },
        { status: 400 }
      );
    }

    if (data.wa_opted_out === true) {
      return NextResponse.json(
        { success: false, message: "Este prospecto solicitó no recibir más mensajes." },
        { status: 409 }
      );
    }

    // Default vars: {{1}} = nombre del negocio
    const vars = bodyVars && bodyVars.length ? bodyVars : [nombre];

    const result = await sendTemplateMessage({
      to: phone,
      templateName: templateName || TEMPLATE_NAME,
      languageCode: TEMPLATE_LANG,
      bodyParams: buildBodyParams(vars),
    });

    if (!result.success) {
      await ref.update({
        wa_status: "failed",
        wa_last_error: result.error || "unknown",
        wa_last_attempt_at: FieldValue.serverTimestamp(),
      });
      return NextResponse.json(
        { success: false, message: `WhatsApp error: ${result.error}` },
        { status: 502 }
      );
    }

    await ref.update({
      wa_status: "sent",
      wa_message_id: result.messageId || "",
      wa_last_sent_at: FieldValue.serverTimestamp(),
      wa_last_error: FieldValue.delete(),
    });

    return NextResponse.json({
      success: true,
      message: `WhatsApp enviado a ${phone}.`,
      messageId: result.messageId,
    });
  } catch (err) {
    console.error("Error en enviar-whatsapp:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
