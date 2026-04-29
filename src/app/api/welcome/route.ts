import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || "INDEXA <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";

// One welcome email per IP per minute — prevents accidental double-sends
const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ success: false, message: "Too many requests." }, { status: 429 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ success: false, message: "Email service not configured." }, { status: 500 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const authToken = typeof body?.authToken === "string" ? body.authToken : "";
    const displayName = typeof body?.displayName === "string" ? body.displayName : "";

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Missing auth token." }, { status: 400 });
    }

    const tokenUser = await verifyIdToken(authToken);
    if (!tokenUser || !tokenUser.email) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const safeName = escapeHtml(displayName || "");
    const dashboardUrl = `${SITE_URL}/dashboard`;
    const guiaUrl = `${SITE_URL}/guia/que-incluye-indexa`;

    const { error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: tokenUser.email,
      subject: "Bienvenido a INDEXA — tu prueba de 14 días ya está activa",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="background-color: #002366; padding: 32px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">INDEXA</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Presencia Digital con IA</p>
          </div>
          <div style="padding: 32px; background-color: #FFFFFF;">
            <h2 style="color: #002366; margin-top: 0;">¡Bienvenido, ${safeName || "emprendedor"}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Tu prueba de <strong>14 días gratis</strong> acaba de comenzar. Tienes acceso completo a:
            </p>
            <ul style="font-size: 15px; line-height: 1.8; color: #444;">
              <li>Generación de sitio web con IA en minutos</li>
              <li>SEO local automático (Schema.org, Google Maps)</li>
              <li>Botón de WhatsApp con tracking de conversiones</li>
              <li>Panel de edición visual sin código</li>
              <li>Analíticas en tiempo real</li>
            </ul>

            <div style="margin: 24px 0; padding: 16px 20px; background-color: #F0F9FF; border-radius: 12px; border: 1px solid #BAE6FD;">
              <p style="margin: 0; font-size: 14px; color: #075985;">
                <strong>Sin tarjeta, sin sorpresas.</strong> Al terminar los 14 días eliges si activas un plan o no. Tu sitio queda pausado sin penalización si decides no continuar.
              </p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer"
                style="display: inline-block; background-color: #FF6600; color: #FFFFFF; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 17px;">
                Ir a mi dashboard →
              </a>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #555;">
              <strong>Siguiente paso:</strong> configura el nombre de tu negocio, tu categoría y tu número de WhatsApp desde el dashboard. La IA generará tu sitio al instante.
            </p>

            <p style="font-size: 14px; color: #666; margin-top: 24px;">
              ¿Dudas sobre qué incluye cada plan?{" "}
              <a href="${guiaUrl}" style="color: #FF6600; font-weight: 600;">Revisa la guía completa</a>
              {" "}o responde este correo — nuestro equipo te ayuda.
            </p>
          </div>
          <div style="background-color: #002366; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} INDEXA
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Welcome email error:", error);
      return NextResponse.json({ success: false, message: "Email send failed." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Welcome route error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, message: "Internal error." }, { status: 500 });
  }
}
