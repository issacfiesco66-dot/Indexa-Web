/**
 * Email templates for INDEXA prospecting and marketing.
 */

const INDEXA_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5215512345678";
const INDEXA_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";

interface ProspectEmailData {
  businessName: string;
  city: string;
  demoUrl: string;
}

export function getProspectEmailSubject(businessName: string): string {
  return `${businessName}: propuesta de sitio web — vista previa lista`;
}

export function getProspectEmailHtml({ businessName, city, demoUrl }: ProspectEmailData): string {
  const waUrl = `https://wa.me/${INDEXA_WHATSAPP}?text=${encodeURIComponent(`Hola, vi la propuesta de INDEXA para ${businessName} y quiero ver los detalles.`)}`;
  const optOutUrl = `${INDEXA_ORIGIN}/baja?email=`;

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; background-color: #F8F9FA;">
      <!-- Header -->
      <div style="background-color: #002366; padding: 32px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">INDEXA</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Sitios web y captación de clientes para PYMES</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px; background-color: #FFFFFF;">
        <h2 style="color: #002366; margin-top: 0; font-size: 22px;">
          Propuesta para ${businessName}
        </h2>

        <p style="font-size: 16px; line-height: 1.7; color: #333333;">
          Buen día. Soy Isaac, fundador de <strong>INDEXA</strong>. Busqué a <strong>${businessName}</strong> en Google
          para mandarles cotización y la presencia digital que encontré tiene espacio para mejorar — por eso les armé
          una vista previa de cómo se vería su sitio.
        </p>

        <!-- Demo CTA -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${demoUrl}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; background-color: #002366; color: #FFFFFF; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
            Ver la propuesta
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.7; color: #333333;">
          Pensada para captar más clientes en <strong>${city || "su zona"}</strong>. Lo que incluye:
        </p>

        <!-- Benefits -->
        <div style="margin: 20px 0; padding: 20px; background-color: #F8F9FA; border-radius: 12px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Sitio web profesional optimizado para celular y computadora</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Posicionamiento para aparecer cuando los busquen en Google</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Botón de WhatsApp directo desde la página</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Panel de campañas en Facebook, Instagram y TikTok Ads</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Estadísticas en tiempo real de visitas, clics y contactos</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Soporte directo conmigo, sin agencias intermedias</td></tr>
          </table>
        </div>

        <p style="font-size: 15px; line-height: 1.7; color: #555; text-align: center; margin-top: 28px;">
          ¿Le hace sentido? Escríbame y le paso precios y plazos:
        </p>

        <!-- WhatsApp CTA -->
        <div style="text-align: center; margin: 16px 0 8px;">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; background-color: #25D366; color: #FFFFFF; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Escribir por WhatsApp
          </a>
        </div>

        <p style="font-size: 13px; line-height: 1.6; color: #888; text-align: center; margin-top: 20px;">
          Si no es para ustedes, respondan este correo con "no aplica" y los saco de la lista. Sin presión.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #002366; padding: 24px; text-align: center;">
        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} INDEXA | indexaia.com
        </p>
        <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0;">
          Para no recibir más correos de este tipo,
          <a href="${optOutUrl}" style="color: rgba(255,255,255,0.6); text-decoration: underline;">dese de baja aquí</a>.
        </p>
      </div>
    </div>
  `;
}
