import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "INDEXA <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.indexa.com.mx";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function buildReminderEmail(nombre: string, daysLeft: number): { subject: string; html: string } {
  const safeName = escapeHtml(nombre || "");
  const urgent = daysLeft <= 1;
  const plural = daysLeft === 1 ? "día" : "días";
  const subject = urgent
    ? `⚠ Tu prueba en INDEXA termina mañana — activa tu plan`
    : `Te quedan ${daysLeft} ${plural} de prueba gratis en INDEXA`;

  const headline = urgent
    ? `Mañana termina tu prueba gratis`
    : `Te quedan ${daysLeft} ${plural} de prueba`;

  const body = urgent
    ? `Tu periodo de 14 días gratis está por terminar. Si activas tu plan hoy, tu sitio sigue publicado sin interrupción y mantienes todos los leads, configuraciones y analíticas acumuladas.`
    : `Estás aprovechando tu prueba gratis de 14 días. Para evitar que tu sitio se pause, activa tu plan antes de que expire el periodo.`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
      <div style="background-color: #002366; padding: 32px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">INDEXA</h1>
      </div>
      <div style="padding: 32px; background-color: #FFFFFF;">
        <h2 style="color: #002366; margin-top: 0;">Hola, ${safeName}</h2>
        <div style="margin: 16px 0 24px; padding: 16px 20px; background-color: ${urgent ? "#FEF3C7" : "#FFF7ED"}; border-radius: 12px; border: 1px solid ${urgent ? "#FCD34D" : "#FDBA74"}; text-align: center;">
          <p style="margin: 0; font-size: 18px; color: ${urgent ? "#92400E" : "#9A3412"}; font-weight: 700;">
            ${headline}
          </p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">
          ${body}
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${SITE_URL}/dashboard" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; background-color: #FF6600; color: #FFFFFF; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 17px; letter-spacing: 0.3px;">
            Activar mi plan →
          </a>
          <p style="margin: 10px 0 0; font-size: 13px; color: #666;">Desde $299 MXN/mes · Cancela cuando quieras</p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 24px;">
          Si decides no continuar, no te preocupes: no se te cobra nada y tu sitio queda pausado sin penalización. Puedes reactivarlo cuando quieras.
        </p>
      </div>
      <div style="background-color: #002366; padding: 20px; text-align: center;">
        <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} INDEXA
        </p>
      </div>
    </div>
  `;

  return { subject, html };
}

interface UserWithTrial {
  uid: string;
  email: string;
  displayName: string;
  trialEndsAt: string;
  daysLeft: number;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  try {
    const db = getAdminDb();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Query active trials ending in the next 3 days, where reminder hasn't been sent yet
    const snap = await db
      .collection("usuarios")
      .where("trialStatus", "==", "active")
      .where("trialEndsAt", "<=", threeDaysFromNow.toISOString())
      .where("trialEndsAt", ">=", now.toISOString())
      .limit(200)
      .get();

    const candidates: UserWithTrial[] = [];

    snap.forEach((doc) => {
      const data = doc.data();
      if (data.trialReminderSentAt) return; // already reminded
      if (!data.email || !data.trialEndsAt) return;
      const endsAt = new Date(data.trialEndsAt);
      if (isNaN(endsAt.getTime())) return;
      const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
      candidates.push({
        uid: doc.id,
        email: data.email,
        displayName: data.displayName || "",
        trialEndsAt: data.trialEndsAt,
        daysLeft,
      });
    });

    const results: Array<{ uid: string; email: string; ok: boolean; error?: string }> = [];

    for (const user of candidates) {
      const { subject, html } = buildReminderEmail(user.displayName, user.daysLeft);
      try {
        const res = await getResend().emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject,
          html,
        });
        if (res.error) {
          results.push({ uid: user.uid, email: user.email, ok: false, error: String(res.error) });
          continue;
        }
        await db.collection("usuarios").doc(user.uid).update({
          trialReminderSentAt: new Date().toISOString(),
          trialReminderDaysLeft: user.daysLeft,
        });
        results.push({ uid: user.uid, email: user.email, ok: true });
      } catch (err) {
        results.push({
          uid: user.uid,
          email: user.email,
          ok: false,
          error: err instanceof Error ? err.message : "unknown",
        });
      }
    }

    return NextResponse.json({
      success: true,
      checkedAt: now.toISOString(),
      candidates: candidates.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (err) {
    console.error("CRON trial-reminders error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Cron failed." }, { status: 500 });
  }
}
