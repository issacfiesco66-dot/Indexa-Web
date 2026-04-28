import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";
import { sendHotProspectAlert } from "@/lib/hotAlert";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Rate limit: 20 demo views per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

// "Hot prospect" = al cruzar este número de vistas se dispara alerta al admin.
// 3 = un retorno + una sesión nueva = señal clara de interés.
const HOT_VIEW_THRESHOLD = 3;
// Cooldown entre alertas para el mismo prospecto (no spamear al admin).
const ALERT_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12h

/**
 * POST /api/prospectos/track-demo
 * Called from the client site when a demo page is viewed.
 * Links the view back to the corresponding prospecto_frio by demoSlug.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
  }
  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const { slug } = await request.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ ok: false, message: "Missing slug" }, { status: 400 });
    }

    // Find the prospecto with this demoSlug
    const queryRes = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "prospectos_frios" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "demoSlug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          limit: 1,
        },
      }),
    });

    if (!queryRes.ok) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const results = await queryRes.json();
    const docResult = results.find((r: Record<string, unknown>) => r.document);
    if (!docResult?.document) {
      // No matching prospecto — that's fine, just a regular sitio view
      return NextResponse.json({ ok: true, matched: false });
    }

    // Extract doc ID
    const docName = docResult.document.name as string;
    const docId = docName.split("/").pop() as string;

    // Update the prospecto: increment vistasDemo + set firstDemoViewAt if not set
    const existingFields = docResult.document.fields || {};
    const hasFirstView = !!existingFields.firstDemoViewAt;
    const previousViews = parseInt(existingFields.vistasDemo?.integerValue || "0", 10) || 0;
    const newViews = previousViews + 1;

    const updateFields: Record<string, unknown> = {
      vistasDemo: { integerValue: String(newViews) },
      ultimaDemoViewAt: { stringValue: new Date().toISOString() },
    };

    if (!hasFirstView) {
      updateFields.firstDemoViewAt = { stringValue: new Date().toISOString() };
    }

    // ── Hot prospect alert ──────────────────────────────────────────
    // Disparamos al admin si:
    // 1. Cruzó el umbral con esta vista (previousViews < threshold <= newViews), Y
    // 2. No mandamos alerta en las últimas 12h
    const lastAlertIso = existingFields.alertHotAt?.stringValue || existingFields.alertHotAt?.timestampValue;
    const lastAlertMs = lastAlertIso ? new Date(lastAlertIso).getTime() : 0;
    const justCrossed = previousViews < HOT_VIEW_THRESHOLD && newViews >= HOT_VIEW_THRESHOLD;
    const cooledDown = Date.now() - lastAlertMs > ALERT_COOLDOWN_MS;
    // Trigger especial: vista de retorno (≥2 vistas) si la última fue hace <30 min — engagement activo
    const lastViewIso = existingFields.ultimaDemoViewAt?.stringValue;
    const lastViewMs = lastViewIso ? new Date(lastViewIso).getTime() : 0;
    const isReturnVisit = newViews >= 2 && lastViewMs > 0 && Date.now() - lastViewMs < 30 * 60 * 1000;

    const shouldAlert = (justCrossed || (isReturnVisit && newViews >= 2)) && cooledDown;

    if (shouldAlert) {
      updateFields.alertHotAt = { stringValue: new Date().toISOString() };
      // Fire-and-forget: nunca esperamos al envío para responder al cliente.
      sendHotProspectAlert({
        prospectoId: docId,
        nombre: existingFields.nombre?.stringValue || "(sin nombre)",
        ciudad: existingFields.ciudad?.stringValue,
        categoria: existingFields.categoria?.stringValue,
        telefono: existingFields.telefono?.stringValue,
        email: existingFields.email?.stringValue,
        demoSlug: existingFields.demoSlug?.stringValue || slug,
        vistasDemo: newViews,
        trigger: justCrossed ? "demo_views" : "return_visit",
      }).catch((err) => console.error("[track-demo] hotAlert error:", err));
    }

    const fieldPaths = Object.keys(updateFields)
      .map((k) => `updateMask.fieldPaths=${k}`)
      .join("&");

    await fetch(`${BASE_URL}/prospectos_frios/${docId}?${fieldPaths}&key=${API_KEY}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: updateFields }),
    });

    return NextResponse.json({
      ok: true,
      matched: true,
      prospectoId: docId,
      hotAlerted: shouldAlert,
    });
  } catch (err) {
    console.error("track-demo error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
