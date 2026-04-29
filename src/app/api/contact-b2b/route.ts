import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { addDocument } from "@/lib/firestoreRest";
import { createRateLimiter } from "@/lib/rateLimit";
import type { LeadFormData, ContactApiResponse } from "@/types/lead";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Separate recipient for B2B leads (partner ops / agencies desk).
// Falls back to ADMIN_EMAIL if B2B_ADMIN_EMAIL is not configured.
const B2B_ADMIN_EMAIL =
  process.env.B2B_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "admin@indexa.com.mx";
const FROM_EMAIL = process.env.FROM_EMAIL || "INDEXA <onboarding@resend.dev>";

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function validateLead(data: unknown): data is LeadFormData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.contactName === "string" &&
    d.contactName.trim().length > 0 &&
    typeof d.businessName === "string" &&
    d.businessName.trim().length > 0 &&
    typeof d.phone === "string" &&
    /^\+?[\d\s\-()]{10,15}$/.test(d.phone.trim()) &&
    typeof d.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())
  );
}

const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json<ContactApiResponse>(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Payload demasiado grande. Máximo 2 MB." },
        { status: 413 }
      );
    }

    const rawText = await request.text();
    if (rawText.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Payload demasiado grande. Máximo 2 MB." },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "JSON inválido." },
        { status: 400 }
      );
    }

    if (!validateLead(body)) {
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Datos inválidos. Verifica todos los campos." },
        { status: 400 }
      );
    }

    // reCAPTCHA v3 verification
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaToken = (body as unknown as Record<string, unknown>).recaptchaToken;
    if (!recaptchaSecret) {
      console.error("RECAPTCHA_SECRET_KEY not configured");
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Error de configuración del servidor." },
        { status: 500 }
      );
    }
    if (!recaptchaToken || typeof recaptchaToken !== "string") {
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Verificación de seguridad requerida." },
        { status: 400 }
      );
    }
    try {
      const captchaRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success || (captchaData.score !== undefined && captchaData.score < 0.3)) {
        return NextResponse.json<ContactApiResponse>(
          { success: false, message: "Verificación de seguridad fallida. Intenta de nuevo." },
          { status: 403 }
        );
      }
    } catch (e) {
      console.error("reCAPTCHA verification error:", e);
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Error al verificar seguridad. Intenta de nuevo." },
        { status: 500 }
      );
    }

    const { contactName, businessName, phone, email, mensaje } = body;

    const safeName = escapeHtml(contactName.trim());
    const safeBusiness = escapeHtml(businessName.trim());
    const safePhone = escapeHtml(phone.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMensaje = escapeHtml((mensaje || "").trim());

    // Save to Firestore with leadType tag so admin dashboard can segment
    try {
      await addDocument("leads", {
        contactName: contactName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        mensaje: (mensaje || "").trim(),
        status: "nuevo",
        leadType: "b2b",
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error("Firestore save error:", dbError);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5215512345678";
    const agenciasUrl = `${siteUrl}/agencias`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola, soy ${contactName.trim()} de ${businessName.trim()}. Acabo de solicitar una demo B2B en INDEXA y quiero conocer los detalles para agencias.`)}`;

    // Client confirmation: B2B tone (demo, not quote)
    const clientEmailPromise = getResend().emails.send({
      from: FROM_EMAIL,
      to: email.trim(),
      subject: "Tu solicitud de demo B2B en INDEXA — siguientes pasos",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="background-color: #002366; padding: 32px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">INDEXA</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Programa para Agencias y Socios</p>
          </div>
          <div style="padding: 32px; background-color: #FFFFFF;">
            <h2 style="color: #002366; margin-top: 0;">Hola, ${safeName}</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Recibimos tu solicitud de demo B2B para <strong>${safeBusiness}</strong>.
              Un miembro del equipo comercial te contactará en menos de <strong>24 horas hábiles</strong>
              para agendar una sesión de 30 minutos donde veremos:
            </p>
            <ul style="font-size: 15px; line-height: 1.8; color: #444;">
              <li>Panel multi-cliente en vivo con un caso real</li>
              <li>Descuento por volumen aplicable a tu portafolio</li>
              <li>Opciones de white-label y modelo comercial</li>
              <li>Plan de migración si ya tienes clientes en otras plataformas</li>
            </ul>

            <div style="margin: 24px 0; padding: 16px 20px; background-color: #F0F9FF; border-radius: 12px; border: 1px solid #BAE6FD; text-align: center;">
              <p style="margin: 0; font-size: 15px; color: #075985; font-weight: 600;">
                Mientras tanto, puedes revisar la página de agencias con el detalle del programa.
              </p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${agenciasUrl}" target="_blank" rel="noopener noreferrer"
                style="display: inline-block; background-color: #FF6600; color: #FFFFFF; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
                Ver programa para agencias
              </a>
            </div>

            <div style="margin-top: 24px; padding: 20px; background-color: #F8F9FA; border-radius: 12px; border: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Datos recibidos:</strong></p>
              <p style="margin: 0 0 4px 0; font-size: 14px;">🏢 Agencia / Empresa: ${safeBusiness}</p>
              <p style="margin: 0 0 4px 0; font-size: 14px;">📞 Teléfono: ${safePhone}</p>
              <p style="margin: 0; font-size: 14px;">📧 Email: ${safeEmail}</p>
            </div>

            <p style="font-size: 15px; line-height: 1.7; color: #555; text-align: center; margin-top: 24px;">
              ¿Prefieres hablar por WhatsApp ahora mismo?
            </p>

            <div style="text-align: center; margin: 16px 0;">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer"
                style="display: inline-block; background-color: #25D366; color: #FFFFFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
                💬 Escribir por WhatsApp
              </a>
            </div>
          </div>
          <div style="background-color: #002366; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} INDEXA | Programa para Agencias
            </p>
          </div>
        </div>
      `,
    });

    // Admin alert — B2B tone, higher priority framing
    const mensajeRow = safeMensaje
      ? `<tr>
           <td style="padding: 12px; font-weight: 600;">Contexto / Portafolio</td>
           <td style="padding: 12px;">${safeMensaje}</td>
         </tr>`
      : "";

    const adminEmailPromise = getResend().emails.send({
      from: FROM_EMAIL,
      to: B2B_ADMIN_EMAIL,
      subject: `🤝 Lead B2B / Agencia — ${safeName} de ${safeBusiness}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="background-color: #002366; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">🤝 Nuevo lead B2B / Agencia</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
              ${safeName} de <strong>${safeBusiness}</strong> solicitó demo B2B
            </p>
          </div>
          <div style="padding: 32px; background-color: #FFFFFF;">
            <div style="margin: 0 0 20px; padding: 12px 16px; background-color: #FEF3C7; border-radius: 10px; border: 1px solid #FCD34D;">
              <p style="margin: 0; font-size: 13px; color: #92400E; font-weight: 600;">
                ⚡ Prioridad comercial — responder en &lt; 24h hábiles
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 160px;">Contacto</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">Agencia / Empresa</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${safeBusiness}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">Teléfono</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  <a href="tel:${safePhone}" style="color: #002366; text-decoration: none; font-weight: 600;">${safePhone}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  <a href="mailto:${safeEmail}" style="color: #002366; text-decoration: none;">${safeEmail}</a>
                </td>
              </tr>
              ${mensajeRow}
              <tr>
                <td style="padding: 12px; font-weight: 600;">Origen</td>
                <td style="padding: 12px;">Formulario B2B (/agencias o home)</td>
              </tr>
            </table>
            <div style="margin-top: 28px; text-align: center;">
              <a href="https://wa.me/+52${phone.trim().replace(/[^\d]/g, "")}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 8px;">
                WhatsApp
              </a>
              <a href="mailto:${safeEmail}" style="display: inline-block; background-color: #002366; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Agendar demo
              </a>
            </div>
          </div>
          <div style="background-color: #F8F9FA; padding: 16px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Recibido el ${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}
            </p>
          </div>
        </div>
      `,
    });

    const [clientResult, adminResult] = await Promise.all([
      clientEmailPromise,
      adminEmailPromise,
    ]);

    if (clientResult.error || adminResult.error) {
      console.error("Resend errors (B2B):", { client: clientResult.error, admin: adminResult.error });
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Error al enviar los correos. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json<ContactApiResponse>(
      {
        success: true,
        message: "¡Gracias! Un miembro del equipo comercial te contactará en menos de 24 horas hábiles.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact B2B API error:", error);
    return NextResponse.json<ContactApiResponse>(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
