import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// Nota: cambiamos de runtime "edge" a "nodejs" porque firebase-admin requiere
// el runtime Node (usa módulos como crypto, fs). El cron antes estaba "edge"
// pero la query Firestore se hacía REST anónimo y siempre fallaba con 403
// (las reglas de prospectos_frios exigen isAdmin()). Bug pre-existente.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  return `${nombre} — vi que abrieron la demo hace un par de días. ¿Quedó alguna duda?

Los 3 meses gratis siguen reservados, pero solo para esta semana. La demo: ${demoUrl}

¿Lo activamos hoy?`;
}

export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let db;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error("CRON reminders: Firebase Admin no inicializado:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Firebase Admin no inicializado" }, { status: 500 });
  }

  try {
    // Buscar prospectos con demo_generada (Admin SDK bypassa rules — antes
    // se hacía REST anónimo y siempre fallaba 403)
    const snap = await db
      .collection("prospectos_frios")
      .where("status", "==", "demo_generada")
      .limit(200)
      .get();

    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa-web-ten.vercel.app";
    const now = Date.now();
    const HOURS_24 = 24 * 60 * 60 * 1000;
    const HOURS_72 = 72 * 60 * 60 * 1000;

    const reminders: {
      prospectoId: string;
      nombre: string;
      whatsappUrl: string;
    }[] = [];

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const firstView = typeof data.firstDemoViewAt === "string" ? data.firstDemoViewAt : "";
      const reminderSent = typeof data.reminderSentAt === "string" ? data.reminderSentAt : "";
      const telefono = typeof data.telefono === "string" ? data.telefono : "";
      const nombre = typeof data.nombre === "string" ? data.nombre : "";
      const demoSlug = typeof data.demoSlug === "string" ? data.demoSlug : "";

      // Skip si falta info, ya se recordó, o no hay demo
      if (!firstView || !telefono || reminderSent || !demoSlug || !nombre) continue;

      // Ventana 24-72h desde la primera vista
      const viewTime = new Date(firstView).getTime();
      if (Number.isNaN(viewTime)) continue;
      const elapsed = now - viewTime;
      if (elapsed < HOURS_24 || elapsed > HOURS_72) continue;

      const demoUrl = `${siteOrigin}/sitio/${demoSlug}`;
      const digits = telefono.replace(/[^\d+]/g, "");
      const num = digits.startsWith("+") ? digits : `+52${digits}`;
      const message = buildReminderMessage(nombre, demoUrl);
      const whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

      reminders.push({ prospectoId: docSnap.id, nombre, whatsappUrl });

      // Marcar recordatorio enviado
      const currentNivel = typeof data.nivelSeguimiento === "number" ? data.nivelSeguimiento : 0;
      try {
        await docSnap.ref.update({
          reminderSentAt: Timestamp.now().toDate().toISOString(),
          nivelSeguimiento: currentNivel + 1,
        });
      } catch (updateErr) {
        console.error("CRON reminders: error actualizando", docSnap.id, updateErr instanceof Error ? updateErr.message : updateErr);
      }
    }

    return NextResponse.json({
      success: true,
      remindersGenerated: reminders.length,
      reminders,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("CRON reminders error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Cron failed." },
      { status: 500 }
    );
  }
}
