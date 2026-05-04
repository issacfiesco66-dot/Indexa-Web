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
  return `${businessName}: así se vería su sitio si lo buscara un cliente desde el celular`;
}

export function getProspectEmailHtml({ businessName, city, demoUrl }: ProspectEmailData): string {
  const waUrl = `https://wa.me/${INDEXA_WHATSAPP}?text=${encodeURIComponent(`Hola, vi la propuesta de INDEXA para ${businessName} y quiero ver los detalles.`)}`;
  const optOutUrl = `${INDEXA_ORIGIN}/baja?email=`;
  const ciudad = city || "su zona";

  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; background-color: #F8F9FA;">
      <!-- Header -->
      <div style="background-color: #002366; padding: 32px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">INDEXA</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Que sus clientes los encuentren primero — y entren directo a su WhatsApp</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px; background-color: #FFFFFF;">
        <h2 style="color: #002366; margin-top: 0; font-size: 22px;">
          Buen día, ${businessName}
        </h2>

        <p style="font-size: 16px; line-height: 1.7; color: #333333;">
          Soy Isaac, fundador de <strong>INDEXA</strong>. Antes de escribirles, abrí Google en el celular y busqué su negocio
          desde la perspectiva de un cliente nuevo en <strong>${ciudad}</strong>. Salieron varios negocios parecidos al suyo
          arriba — esa lista es la que recibe las primeras llamadas todos los días.
        </p>

        <p style="font-size: 16px; line-height: 1.7; color: #333333;">
          Para que se den una idea de cómo se vería <strong>${businessName}</strong> ya posicionado, les armé esta vista previa:
        </p>

        <!-- Demo CTA -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${demoUrl}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; background-color: #002366; color: #FFFFFF; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
            Ver cómo se vería su sitio
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.7; color: #333333;">
          Lo que arma INDEXA, en palabras llanas:
        </p>

        <!-- Benefits -->
        <div style="margin: 20px 0; padding: 20px; background-color: #F8F9FA; border-radius: 12px; border: 1px solid #e5e7eb;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Una página que se ve bien en celular — que es donde el 90% de la gente los va a buscar</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Que aparezcan cuando alguien teclee su giro + "${ciudad}" en Google, no escondidos en la página 4</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Botón verde de WhatsApp en la página: el cliente toca y ya está escribiéndoles</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Anuncios en Facebook, Instagram y TikTok que ustedes prenden y apagan desde el celular</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Tablero simple que muestra cuánta gente entró y cuántos escribieron</td></tr>
            <tr><td style="padding: 8px 12px; font-size: 15px; color: #333;">• Hablan directo conmigo, no con un call center</td></tr>
          </table>
        </div>

        <p style="font-size: 15px; line-height: 1.7; color: #555; text-align: center; margin-top: 28px;">
          ¿Le hace sentido? Escríbame por WhatsApp y le paso precios y plazos sin rodeos:
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
