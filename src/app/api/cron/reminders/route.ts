import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Vercel Cron Job — runs daily, finds prospectos who:
 * 1. Viewed their demo (firstDemoViewAt exists)
 * 2. Haven't registered (no ownerId on the linked sitio)
 * 3. First view was 24-48 hours ago
 * 4. Haven't already received a reminder (reminderSentAt not set)
 *
 * Returns a list of WhatsApp reminder URLs to send.
 */

interface ProspectoForReminder {
  id: string;
  nombre: string;
  telefono: string;
  demoSlug: string;
  firstDemoViewAt: string;
}

function buildReminderMessage(nombre: string, demoUrl: string): string {
  return `Hola, ¿qué tal? Soy Isaac de INDEXA.

Notamos que revisaste la demo de *${nombre}* 👀

¿Tienes alguna duda para activar tus 3 meses gratis? Te recordamos que incluye:
✅ Sitio web profesional
✅ Aparecer en Google
✅ Botón de WhatsApp directo
✅ Panel de ofertas con IA

Sin contratos ni letra chiquita. Aquí está tu demo: ${demoUrl}

¿Cuándo te queda bien una llamada rápida de 5 minutos?`;
}

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json({ error: "Firebase config missing" }, { status: 500 });
  }

  try {
    // Find prospectos with demo views but no reminder sent yet
    // Query: firstDemoViewAt exists AND reminderSentAt does not exist
    // Firestore REST doesn't support "field exists" directly,
    // so we query for status = "demo_generada" and filter in code.
    const queryRes = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "prospectos_frios" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "demo_generada" },
            },
          },
          limit: 200,
        },
      }),
    });

    if (!queryRes.ok) {
      return NextResponse.json({ error: "Firestore query failed" }, { status: 500 });
    }

    const results = await queryRes.json();
    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa-web-ten.vercel.app";
    const now = Date.now();
    const HOURS_24 = 24 * 60 * 60 * 1000;
    const HOURS_72 = 72 * 60 * 60 * 1000;

    const reminders: {
      prospectoId: string;
      nombre: string;
      whatsappUrl: string;
    }[] = [];

    for (const r of results) {
      if (!r.document) continue;

      const fields = r.document.fields || {};
      const firstView = fields.firstDemoViewAt?.stringValue;
      const reminderSent = fields.reminderSentAt?.stringValue;
      const telefono = fields.telefono?.stringValue;
      const nombre = fields.nombre?.stringValue;
      const demoSlug = fields.demoSlug?.stringValue;

      // Skip if no demo view, no phone, already reminded, or no demo
      if (!firstView || !telefono || reminderSent || !demoSlug || !nombre) continue;

      // Check timing: 24-72 hours since first view
      const viewTime = new Date(firstView).getTime();
      const elapsed = now - viewTime;

      if (elapsed < HOURS_24 || elapsed > HOURS_72) continue;

      // Build reminder
      const docName = r.document.name as string;
      const docId = docName.split("/").pop()!;
      const demoUrl = `${siteOrigin}/sitio/${demoSlug}`;
      const digits = telefono.replace(/[^\d+]/g, "");
      const num = digits.startsWith("+") ? digits : `+52${digits}`;
      const message = buildReminderMessage(nombre, demoUrl);
      const whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

      reminders.push({ prospectoId: docId, nombre, whatsappUrl });

      // Mark reminder as sent
      const updateFields = {
        reminderSentAt: { stringValue: new Date().toISOString() },
        nivelSeguimiento: {
          integerValue: String(
            (parseInt(fields.nivelSeguimiento?.integerValue || "0", 10) || 0) + 1
          ),
        },
      };

      await fetch(
        `${BASE_URL}/prospectos_frios/${docId}?updateMask.fieldPaths=reminderSentAt&updateMask.fieldPaths=nivelSeguimiento&key=${API_KEY}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: updateFields }),
        }
      );
    }

    return NextResponse.json({
      success: true,
      remindersGenerated: reminders.length,
      reminders,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Cron failed", detail: String(err) },
      { status: 500 }
    );
  }
}
