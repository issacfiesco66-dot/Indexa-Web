/**
 * POST /api/prospectos/outreach-usa
 *
 * Endpoint dedicado al outbound USA-Hispano. Resuelve dos problemas que el
 * bulk WhatsApp masivo no resuelve fuera de la caja:
 *   1. Renderiza un preset de `outreachPresetsUsa.ts` con los datos del
 *      prospecto (sustituye {{nombre}}, {{negocio}}, {{ciudad}}, etc.)
 *   2. Construye la URL `wa.me/<phone>?text=...` para que el operador haga
 *      click-to-WhatsApp con el mensaje pre-cargado, en vez de copy/paste.
 *      Esto es ESPECIALMENTE útil para mensajes de audio: el operador abre
 *      el chat con el guión visible para grabar.
 *
 * Modos de operación:
 *   - mode="link": devuelve el link wa.me con texto encoded. Sin cargo Meta.
 *   - mode="template": envía vía sendTemplateMessage (Meta Cloud API).
 *     Solo funciona con templates aprobados por Meta.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  sendTemplateMessage,
  buildBodyParams,
  normalizePhoneByCountry,
} from "@/lib/whatsapp";
import {
  OUTREACH_PRESETS_USA,
  presetToBodyVars,
  renderPreset,
  type OutreachPreset,
} from "@/lib/outreachPresetsUsa";
import { verifyAdmin } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

interface OutreachBody {
  authToken: string;
  presetId: string;
  prospectoId: string;
  /** Modo de envío. "link" arma URL wa.me. "template" envía vía Meta. */
  mode: "link" | "template";
  /** Datos para sustituir variables del preset. */
  vars: {
    nombre?: string;
    negocio?: string;
    ciudad?: string;
    [key: string]: string | undefined;
  };
  /** Teléfono del prospecto en formato cualquiera. Se normaliza acá. */
  telefono: string;
  /** Solo si mode="template": nombre del template aprobado en Meta. */
  templateName?: string;
  /** Solo si mode="template": idioma del template. Default "es". */
  templateLang?: string;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes." },
      { status: 429 }
    );
  }

  try {
    const body: OutreachBody = await request.json();
    const { authToken, presetId, prospectoId, mode, vars, telefono, templateName, templateLang } = body;

    if (!authToken || !presetId || !prospectoId || !mode || !telefono) {
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

    const preset: OutreachPreset | undefined = OUTREACH_PRESETS_USA.find((p) => p.id === presetId);
    if (!preset) {
      return NextResponse.json(
        { success: false, message: `Preset no encontrado: ${presetId}` },
        { status: 404 }
      );
    }

    const { phone, country } = normalizePhoneByCountry(telefono, {
      ciudad: vars.ciudad,
      pais: "US",
    });
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Teléfono inválido para USA." },
        { status: 400 }
      );
    }

    const renderedText = renderPreset(preset, vars);
    const db = getAdminDb();
    const ref = db.collection("prospectos_frios").doc(prospectoId);

    if (mode === "link") {
      const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(renderedText)}`;

      await ref.set(
        {
          wa_country: country,
          wa_last_outreach_preset: presetId,
          wa_last_outreach_stage: preset.stage,
          wa_last_outreach_at: FieldValue.serverTimestamp(),
          wa_last_outreach_mode: "link",
          telefono,
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        mode: "link",
        link: waLink,
        text: renderedText,
        delivery: preset.delivery,
        country,
        prospectoId,
        message:
          preset.delivery === "audio"
            ? "Link listo. El texto es el GUION para grabar el audio — no lo envíes como texto."
            : "Link listo. Click para abrir WhatsApp con el mensaje pre-cargado.",
      });
    }

    // mode === "template"
    const bodyVars = presetToBodyVars(preset, vars);
    const tplName = templateName || `usa_${preset.stage}`;
    const tplLang = templateLang || "es";

    const r = await sendTemplateMessage({
      to: phone,
      templateName: tplName,
      languageCode: tplLang,
      bodyParams: buildBodyParams(bodyVars),
    });

    if (r.success) {
      await ref.set(
        {
          wa_status: "sent",
          wa_message_id: r.messageId || "",
          wa_country: country,
          wa_template: tplName,
          wa_last_outreach_preset: presetId,
          wa_last_outreach_stage: preset.stage,
          wa_last_outreach_at: FieldValue.serverTimestamp(),
          wa_last_outreach_mode: "template",
          telefono,
        },
        { merge: true }
      );
      return NextResponse.json({
        success: true,
        mode: "template",
        messageId: r.messageId,
        country,
        prospectoId,
      });
    }

    await ref.set(
      {
        wa_status: "failed",
        wa_last_error: r.error || "unknown",
        wa_last_attempt_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return NextResponse.json(
      { success: false, message: r.error || "Error enviando template", errorCode: r.errorCode },
      { status: 500 }
    );
  } catch (err) {
    console.error("Outreach USA error:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
