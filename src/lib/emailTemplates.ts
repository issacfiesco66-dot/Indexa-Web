/**
 * Email templates for INDEXA prospecting and marketing.
 */

const INDEXA_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5215512345678";
const INDEXA_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://www.indexa.com.mx";

interface ProspectEmailData {
  businessName: string;
  city: string;
  demoUrl: string;
}

export function getProspectEmailSubject(businessName: string): string {
  return `${businessName}: su sitio web profesional está listo para activarse`;
}

export function getProspectEmailHtml({ businessName, city, demoUrl }: ProspectEmailData): string {
  const signupUrl = `${INDEXA_ORIGIN}/registro`;
  const waUrl = `https://wa.me/${INDEXA_WHATSAPP}?text=${encodeURIComponent(`Hola, vi la propuesta de INDEXA para ${businessName} y quiero activar mi sitio web.`)}`;

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; background-color: #F8F9FA;">
      <!-- Header -->
      <div style="background-color: #002366; padding: 32px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">INDEXA</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Sistema Digital Todo-en-Uno para PYMES</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px; background-color: #FFFFFF;">
        <h2 style="color: #002366; margin-top: 0; font-size: 22px;">
          Propuesta exclusiva para ${businessName}
        </h2>

        <p style="font-size: 16px; line-height: 1.7; color: #333333;">
          Hola, notamos que <strong>${businessName}</strong> aún no cuenta con un sistema digital completo.
          En <strong>INDEXA</strong> creamos una propuesta exclusiva para ustedes:
        </p>

        <!-- Demo CTA -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${demoUrl}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; background-color: #002366; color: #FFFFFF; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
            👁 Ver Propuesta Digital
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.7; color: #333333;">
          Queremos ayudarles a captar más clientes en <strong>${city || "su zona"}</strong>.
          Con INDEXA, su negocio obtiene:
        </p>

        <!-- Benefits -->
        <div style="margin: 20px 0; padding: 20px; background-color: #F8F9FA; border-radius: 12px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">✅ Sitio web profesional optimizado para celular y computadora</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">✅ Aparecer en Google cuando busquen negocios como el suyo</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">✅ Recibir clientes directo a WhatsApp desde su página</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">✅ Panel de marketing: campañas en Facebook, Instagram y TikTok Ads</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">✅ Estadísticas en tiempo real de visitas, clics y conversiones</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">✅ Todo listo sin que usted haga nada técnico</td></tr>
          </table>
        </div>

        <!-- Urgency -->
        <div style="margin: 24px 0; padding: 16px 20px; background-color: #FFF7ED; border-radius: 12px; border: 1px solid #FDBA74; text-align: center;">
          <p style="margin: 0; font-size: 15px; color: #9A3412; font-weight: 600;">
            🔥 Los primeros 3 meses van por nuestra cuenta — solo este mes.
          </p>
        </div>

        <!-- Primary CTA: Signup -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${signupUrl}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; background-color: #FF6600; color: #FFFFFF; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 18px; letter-spacing: 0.3px;">
            Activar Mi Sitio Web Gratis →
          </a>
          <p style="margin: 10px 0 0; font-size: 13px; color: #666;">Sin tarjeta de crédito · Listo en 2 minutos</p>
        </div>

        <p style="font-size: 15px; line-height: 1.7; color: #555; text-align: center;">
          ¿Prefiere que le expliquemos primero? Escríbanos:
        </p>

        <!-- WhatsApp CTA -->
        <div style="text-align: center; margin: 16px 0 24px;">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; background-color: #25D366; color: #FFFFFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
            💬 Escribir por WhatsApp
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #002366; padding: 24px; text-align: center;">
        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} INDEXA | www.indexa.com.mx
        </p>
        <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0;">
          Si no desea recibir más correos de este tipo, simplemente responda con "NO".
        </p>
      </div>
    </div>
  `;
}
