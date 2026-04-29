/**
 * Hot prospect alert system.
 *
 * Cuando un prospecto cruza el umbral de "interés caliente" (vistas a su demo),
 * mandamos una alerta al admin para que llame YA — los primeros 30 minutos
 * de calor son los que más convierten en B2B local.
 *
 * Canal: email vía Resend a ADMIN_EMAIL.
 * (Si en el futuro queremos WhatsApp, se puede extender aquí — requiere
 *  template aprobado y que el admin esté en la lista de testers/producción.)
 */

import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "INDEXA <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export interface HotProspectAlertPayload {
  prospectoId: string;
  nombre: string;
  ciudad?: string;
  categoria?: string;
  telefono?: string;
  email?: string;
  demoSlug?: string;
  vistasDemo: number;
  /** Tipo de señal que disparó la alerta. */
  trigger: "demo_views" | "wa_click" | "return_visit";
}

function buildAlertHtml(p: HotProspectAlertPayload): string {
  const demoUrl = p.demoSlug
    ? `${SITE_URL}/sitio/${encodeURIComponent(p.demoSlug)}`
    : "";
  const adminUrl = `${SITE_URL}/admin/prospectos`;
  const phoneDigits = (p.telefono || "").replace(/\D+/g, "");
  const waUrl = phoneDigits
    ? `https://wa.me/${phoneDigits.length === 10 ? "52" + phoneDigits : phoneDigits}?text=${encodeURIComponent(
        `Hola ${p.nombre}, te escribo de INDEXA. Vi que estuviste viendo tu sitio web — ¿te interesa que platiquemos?`
      )}`
    : "";
  const callUrl = phoneDigits ? `tel:+${phoneDigits.length === 10 ? "52" + phoneDigits : phoneDigits}` : "";

  const triggerLabel = {
    demo_views: `Vio su demo ${p.vistasDemo} veces`,
    wa_click: "Hizo clic en el botón de WhatsApp",
    return_visit: "Regresó al sitio en menos de 24h",
  }[p.trigger];

  return `
    <div style="font-family: -apple-system, 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; background:#fff; color:#0f172a;">
      <div style="background:linear-gradient(135deg,#dc2626 0%,#f97316 100%); padding:28px 24px; text-align:center;">
        <div style="font-size:42px; line-height:1;">🔥</div>
        <h1 style="margin:8px 0 4px; color:#fff; font-size:22px; font-weight:800;">Prospecto CALIENTE — Llama YA</h1>
        <p style="margin:0; color:rgba(255,255,255,0.85); font-size:13px;">${triggerLabel}</p>
      </div>

      <div style="padding:24px;">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:6px 0; color:#64748b; width:90px;">Negocio:</td><td style="padding:6px 0; font-weight:700;">${p.nombre}</td></tr>
          ${p.ciudad ? `<tr><td style="padding:6px 0; color:#64748b;">Ciudad:</td><td style="padding:6px 0;">${p.ciudad}</td></tr>` : ""}
          ${p.categoria ? `<tr><td style="padding:6px 0; color:#64748b;">Categoría:</td><td style="padding:6px 0;">${p.categoria}</td></tr>` : ""}
          ${p.telefono ? `<tr><td style="padding:6px 0; color:#64748b;">Teléfono:</td><td style="padding:6px 0; font-family:monospace;">${p.telefono}</td></tr>` : ""}
          <tr><td style="padding:6px 0; color:#64748b;">Vistas demo:</td><td style="padding:6px 0; font-weight:700; color:#dc2626;">${p.vistasDemo}</td></tr>
        </table>

        <div style="margin-top:20px; display:block;">
          ${callUrl ? `<a href="${callUrl}" style="display:inline-block; background:#dc2626; color:#fff; padding:12px 20px; border-radius:10px; text-decoration:none; font-weight:700; margin-right:8px; margin-bottom:8px;">📞 Llamar ahora</a>` : ""}
          ${waUrl ? `<a href="${waUrl}" style="display:inline-block; background:#10b981; color:#fff; padding:12px 20px; border-radius:10px; text-decoration:none; font-weight:700; margin-right:8px; margin-bottom:8px;">💬 WhatsApp</a>` : ""}
          ${demoUrl ? `<a href="${demoUrl}" style="display:inline-block; background:#0f172a; color:#fff; padding:12px 20px; border-radius:10px; text-decoration:none; font-weight:700; margin-bottom:8px;">Ver demo</a>` : ""}
        </div>

        <p style="margin:24px 0 8px; padding:14px; background:#fef3c7; border-left:4px solid #f59e0b; font-size:13px; color:#78350f; border-radius:6px;">
          <strong>Tip:</strong> Los prospectos que se contactan en los primeros 30 min después de ver la demo convierten 2-5x más. No esperes.
        </p>

        <p style="margin-top:18px; font-size:12px; color:#94a3b8; text-align:center;">
          <a href="${adminUrl}" style="color:#94a3b8;">Ver en panel admin →</a>
        </p>
      </div>
    </div>
  `;
}

/**
 * Manda el correo de alerta. Fire-and-forget seguro: nunca lanza,
 * para no romper el flujo principal de track-demo si Resend falla.
 */
export async function sendHotProspectAlert(p: HotProspectAlertPayload): Promise<boolean> {
  const resend = getResend();
  if (!resend || !ADMIN_EMAIL) {
    console.warn("[hotAlert] Skipping — RESEND_API_KEY o ADMIN_EMAIL no configurados");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔥 ${p.nombre} está caliente — vió su demo ${p.vistasDemo}x`,
      html: buildAlertHtml(p),
    });
    if (error) {
      console.error("[hotAlert] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[hotAlert] Error inesperado:", err);
    return false;
  }
}
