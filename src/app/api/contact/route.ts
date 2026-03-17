import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { addDocument } from "@/lib/firestoreRest";
import { createRateLimiter } from "@/lib/rateLimit";
import type { LeadFormData, ContactApiResponse } from "@/types/lead";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@indexa.com.mx";
const FROM_EMAIL = process.env.FROM_EMAIL || "INDEXA <onboarding@resend.dev>";

// Rate limit: 5 contact form submissions per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

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

const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: NextRequest) {
  // ── Rate limit check ──────────────────────────────────────────
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json<ContactApiResponse>(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    // ── 0. Payload size guard ────────────────────────────────────
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

    const { contactName, businessName, phone, email, mensaje } = body;

    // ── 1. Guardar lead en Firestore ──────────────────────────────
    try {
      await addDocument("leads", {
        contactName: contactName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        mensaje: (mensaje || "").trim(),
        status: "nuevo",
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error("Firestore save error:", dbError);
    }

    // ── 2. Correo de confirmación al cliente ──────────────────────
    const clientEmailPromise = resend.emails.send({
      from: FROM_EMAIL,
      to: email.trim(),
      subject: "¡Gracias por contactar a INDEXA!",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="background-color: #002366; padding: 32px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">INDEXA</h1>
          </div>
          <div style="padding: 32px; background-color: #F8F9FA;">
            <h2 style="color: #002366; margin-top: 0;">¡Hola, ${contactName.trim()}!</h2>
            <p style="font-size: 16px; line-height: 1.6;">
              Gracias por contactar a <strong>INDEXA</strong>. Hemos recibido tu solicitud para
              <strong>${businessName.trim()}</strong>.
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Un consultor se pondrá en contacto contigo <strong>en menos de 24 horas</strong> para ayudarte a llevar tu negocio al mundo digital.
            </p>
            <div style="margin-top: 24px; padding: 20px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Nombre:</strong> ${contactName.trim()}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Negocio:</strong> ${businessName.trim()}</p>
              <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Teléfono:</strong> ${phone.trim()}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Email:</strong> ${email.trim()}</p>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 24px;">
              Si no solicitaste esta cotización, puedes ignorar este correo.
            </p>
          </div>
          <div style="background-color: #002366; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} INDEXA | www.indexa.com.mx
            </p>
          </div>
        </div>
      `,
    });

    // ── 3. Correo de alerta al administrador ──────────────────────
    const mensajeRow = (mensaje || "").trim()
      ? `<tr>
           <td style="padding: 12px; font-weight: 600;">Mensaje</td>
           <td style="padding: 12px;">${(mensaje || "").trim()}</td>
         </tr>`
      : "";

    const adminEmailPromise = resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🟠 ¡Nuevo prospecto en INDEXA! — ${contactName.trim()} de ${businessName.trim()}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="background-color: #FF6600; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">🚀 ¡Nuevo prospecto en INDEXA!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">
              ${contactName.trim()} de <strong>${businessName.trim()}</strong> quiere una cotización
            </p>
          </div>
          <div style="padding: 32px; background-color: #FFFFFF;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 140px;">Nombre</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${contactName.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">Negocio</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${businessName.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">Teléfono</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  <a href="tel:${phone.trim()}" style="color: #002366; text-decoration: none; font-weight: 600;">${phone.trim()}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  <a href="mailto:${email.trim()}" style="color: #002366; text-decoration: none;">${email.trim()}</a>
                </td>
              </tr>
              ${mensajeRow}
            </table>
            <div style="margin-top: 28px; text-align: center;">
              <a href="https://wa.me/+52${phone.trim().replace(/[^\d]/g, "")}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 8px;">
                WhatsApp
              </a>
              <a href="mailto:${email.trim()}" style="display: inline-block; background-color: #002366; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Responder por Email
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
      console.error("Resend errors:", { client: clientResult.error, admin: adminResult.error });
      return NextResponse.json<ContactApiResponse>(
        { success: false, message: "Error al enviar los correos. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json<ContactApiResponse>(
      { success: true, message: "¡Gracias! Un consultor de Indexa te contactará en menos de 24 horas." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json<ContactApiResponse>(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
