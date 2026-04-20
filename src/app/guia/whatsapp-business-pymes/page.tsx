import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "WhatsApp Business para PYMES: Guía para Vender Más por WhatsApp (2026)",
  description:
    "Aprende a usar WhatsApp Business para tu negocio en México: configuración, catálogo, respuestas rápidas, integración con tu página web y estrategias para convertir chats en ventas reales.",
  alternates: { canonical: "/guia/whatsapp-business-pymes" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "WhatsApp Business para PYMES: Guía Completa para Vender Más",
  description:
    "Cómo usar WhatsApp Business para vender más: configuración, catálogo, respuestas rápidas e integración web.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-02-25",
  dateModified: "2026-03-27",
  mainEntityOfPage: `${SITE_URL}/guia/whatsapp-business-pymes`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "WhatsApp Business para PYMES" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuál es la diferencia entre WhatsApp y WhatsApp Business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WhatsApp Business es una versión gratuita diseñada para negocios. Incluye perfil de empresa (dirección, horario, descripción), catálogo de productos, respuestas rápidas, etiquetas para organizar chats y estadísticas de mensajes. WhatsApp personal no tiene estas funciones comerciales.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo tener WhatsApp Business y WhatsApp personal en el mismo celular?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, siempre y cuando uses números de teléfono diferentes para cada uno. Si solo tienes un número, puedes migrar a WhatsApp Business y seguir usando el mismo número — todos tus contactos se mantienen.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo integro WhatsApp con mi página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA, el botón de WhatsApp se integra automáticamente en tu sitio web. Aparece como un botón flotante verde en todas las páginas. Los visitantes hacen clic y se abre una conversación directa contigo con un mensaje predeterminado. No necesitas instalar nada extra.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuántos clientes puedo conseguir con WhatsApp integrado en mi web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Los negocios con botón de WhatsApp en su sitio web reportan un promedio de 15-35 contactos nuevos por mes. La tasa de conversión es hasta 3 veces mayor que mostrar solo un número de teléfono, porque reduce la fricción de contacto a un solo clic.",
      },
    },
  ],
};

export default function GuiaWhatsAppBusiness() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-green-500/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">WhatsApp Business para PYMES</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              WhatsApp Business:{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Convierte Chats
              </span>{" "}
              en Ventas Reales
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              En México, WhatsApp es el canal #1 de comunicación con clientes.
              Aprende a configurar WhatsApp Business, crear tu catálogo e integrarlo
              con tu página web para maximizar tus ventas.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Por qué WhatsApp es esencial para tu negocio en México?</h2>
          <p>
            México tiene <strong>más de 80 millones de usuarios activos de WhatsApp</strong>,
            convirtiéndolo en la aplicación de mensajería más usada del país. Para los
            clientes mexicanos, WhatsApp no es solo una app de chat — es su canal
            preferido para contactar negocios, hacer preguntas y solicitar cotizaciones.
          </p>
          <p>
            Los datos son contundentes:
          </p>
          <ul>
            <li><strong>68% de los consumidores mexicanos</strong> prefieren contactar negocios por WhatsApp antes que por teléfono</li>
            <li><strong>Las tasas de apertura de WhatsApp superan el 98%</strong>, contra 20% del email</li>
            <li><strong>El tiempo promedio de respuesta</strong> en WhatsApp es 90 segundos vs 12 horas por email</li>
            <li>Los negocios con WhatsApp integrado en su web reportan <strong>hasta 3x más contactos</strong></li>
          </ul>

          <h2>WhatsApp personal vs WhatsApp Business: diferencias clave</h2>
          <p>
            WhatsApp Business es una aplicación gratuita diseñada específicamente para
            negocios. Estas son las diferencias principales:
          </p>

          <h3>Perfil de empresa</h3>
          <p>
            WhatsApp Business te permite crear un <strong>perfil profesional</strong> con:
          </p>
          <ul>
            <li>Nombre de tu negocio</li>
            <li>Descripción de lo que ofreces</li>
            <li>Dirección física</li>
            <li>Horario de atención</li>
            <li>Email de contacto</li>
            <li>Sitio web (enlace a tu página de INDEXA)</li>
          </ul>

          <h3>Catálogo de productos/servicios</h3>
          <p>
            Puedes crear un <strong>catálogo visual</strong> con fotos, descripciones y
            precios de tus productos o servicios. Los clientes lo consultan directamente
            dentro de WhatsApp sin necesidad de abrir otra aplicación.
          </p>

          <h3>Respuestas rápidas</h3>
          <p>
            Configura <strong>atajos para mensajes frecuentes</strong>. Por ejemplo,
            escribe &quot;/precios&quot; y envía automáticamente tu lista de precios
            completa. Esto te ahorra tiempo y te permite atender más clientes.
          </p>

          <h3>Etiquetas de organización</h3>
          <p>
            Clasifica tus conversaciones con etiquetas como &quot;Nuevo cliente&quot;,
            &quot;Pendiente de pago&quot;, &quot;Pedido en proceso&quot; o &quot;Cliente frecuente&quot;.
            Esto te ayuda a dar seguimiento y no perder ninguna oportunidad.
          </p>

          <h3>Mensajes automáticos</h3>
          <p>
            Configura mensajes de:
          </p>
          <ul>
            <li><strong>Bienvenida</strong> — Saluda automáticamente cuando alguien te escribe por primera vez</li>
            <li><strong>Ausencia</strong> — Responde cuando estás fuera de horario indicando cuándo estarás disponible</li>
          </ul>

          <h2>Cómo configurar WhatsApp Business paso a paso</h2>
          <ol>
            <li>
              <strong>Descarga la app</strong> — Busca &quot;WhatsApp Business&quot; en la App Store
              o Google Play (es gratuita)
            </li>
            <li>
              <strong>Registra tu número</strong> — Puedes usar tu número actual (migra
              de WhatsApp personal) o un número nuevo
            </li>
            <li>
              <strong>Completa tu perfil</strong> — Agrega nombre del negocio, categoría,
              descripción, dirección, horario y link a tu página web
            </li>
            <li>
              <strong>Sube foto de perfil profesional</strong> — Usa tu logo o una foto
              de alta calidad de tu negocio
            </li>
            <li>
              <strong>Crea tu catálogo</strong> — Agrega fotos, nombres, descripciones y
              precios de tus productos o servicios
            </li>
            <li>
              <strong>Configura respuestas rápidas</strong> — Crea atajos para tus mensajes
              más frecuentes (precios, horarios, ubicación)
            </li>
            <li>
              <strong>Activa mensajes de bienvenida y ausencia</strong> — Para responder
              automáticamente cuando no estés disponible
            </li>
          </ol>

          <h2>Integrando WhatsApp con tu página web</h2>
          <p>
            El verdadero poder de WhatsApp para negocios se desbloquea cuando lo
            integras con tu página web. El flujo ideal es:
          </p>
          <ol>
            <li>Un cliente potencial busca tu servicio en Google</li>
            <li>Encuentra tu página web (gracias al SEO local)</li>
            <li>Ve tus servicios, galería y reseñas</li>
            <li>Hace clic en el botón de WhatsApp</li>
            <li>Te llega un mensaje directo con su consulta</li>
            <li>Cierras la venta por WhatsApp</li>
          </ol>
          <p>
            Con <Link href="/">INDEXA</Link>, este botón se integra automáticamente en tu
            sitio web. Aparece como un <strong>botón flotante verde</strong> en todas las
            páginas. No necesitas instalar plugins ni configurar código.
          </p>

          <h2>Estrategias para vender más por WhatsApp</h2>

          <h3>1. Responde rápido (máximo 5 minutos)</h3>
          <p>
            El <strong>78% de los clientes compran al negocio que responde primero</strong>.
            Si tardas horas en responder, es probable que tu cliente potencial ya haya
            contactado a tu competencia. Configura notificaciones y respuestas rápidas
            para mantener tiempos de respuesta bajos.
          </p>

          <h3>2. Usa el nombre del cliente</h3>
          <p>
            Personalizar tus respuestas con el nombre del cliente aumenta la tasa de
            conversión. En lugar de &quot;Hola, ¿en qué le puedo ayudar?&quot; escribe
            &quot;¡Hola María! Gracias por escribirnos. ¿En qué te puedo ayudar?&quot;
          </p>

          <h3>3. Envía fotos y videos de tu trabajo</h3>
          <p>
            Aprovecha que WhatsApp permite multimedia. Envía fotos de trabajos
            anteriores, videos cortos de tu proceso o testimonios en video de
            clientes satisfechos.
          </p>

          <h3>4. Haz seguimiento (sin ser invasivo)</h3>
          <p>
            Si un cliente pidió cotización y no respondió, envía un mensaje de
            seguimiento a las 24 horas: &quot;Hola Juan, ¿pudiste revisar la
            cotización que te envié? Estoy a tus órdenes para cualquier duda.&quot;
          </p>

          <h3>5. Pide reseñas después de cada trabajo</h3>
          <p>
            Cuando termines un servicio satisfactoriamente, envía un mensaje con el
            enlace a tus reseñas de Google. Las reseñas positivas mejoran tu SEO
            local y generan confianza para futuros clientes.
          </p>

          <h2>Métricas clave para medir tus resultados</h2>
          <ul>
            <li><strong>Mensajes recibidos por semana</strong> — ¿Cuántos contactos nuevos llegan?</li>
            <li><strong>Tiempo promedio de respuesta</strong> — ¿Respondes en menos de 5 minutos?</li>
            <li><strong>Tasa de conversión</strong> — De cada 10 contactos, ¿cuántos se convierten en clientes?</li>
            <li><strong>Fuente del contacto</strong> — ¿Llegaron por Google, redes sociales o recomendación?</li>
          </ul>
          <p>
            Con INDEXA, puedes ver cuántos clics recibe tu botón de WhatsApp directamente
            desde tu panel de analytics.
          </p>

          <h2>Preguntas frecuentes</h2>

          <h3>¿Puedo tener WhatsApp Business y personal en el mismo celular?</h3>
          <p>
            Sí, siempre y cuando uses números de teléfono diferentes para cada uno.
            Si solo tienes un número, puedes migrar a WhatsApp Business conservando
            todos tus contactos.
          </p>

          <h3>¿WhatsApp Business es gratuito?</h3>
          <p>
            Sí. La app WhatsApp Business es completamente gratuita. Existe una versión
            de pago (WhatsApp Business API) para empresas grandes con chatbots y
            automatización avanzada, pero la mayoría de las PYMES no la necesitan.
          </p>

          <h3>¿Cómo integro WhatsApp con mi página web?</h3>
          <p>
            Con INDEXA, la integración es automática. Solo configuras tu número de
            WhatsApp en el dashboard y el botón aparece en tu sitio. No necesitas
            tocar código ni instalar plugins.
          </p>

          <div className="not-prose mt-12 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Quieres WhatsApp integrado en tu página web?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              INDEXA incluye botón de WhatsApp flotante en todos los planes.
            </p>
            <Link
              href="/registro"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Prueba 14 días gratis
            </Link>
          </div>

          <div className="not-prose mt-12 border-t border-gray-100 pt-10">
            <h3 className="text-lg font-bold text-indexa-gray-dark">Continúa aprendiendo</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/guia/beneficios-pagina-web" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">10 Beneficios de una Página Web</p>
                <p className="mt-1 text-xs text-gray-500">Por qué tu negocio necesita presencia digital</p>
              </Link>
              <Link href="/guia/google-mi-negocio" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Google Business Profile</p>
                <p className="mt-1 text-xs text-gray-500">Aparece en Google Maps y llega a más clientes</p>
              </Link>
              <Link href="/guia/seo-local-mexico" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">SEO Local en México</p>
                <p className="mt-1 text-xs text-gray-500">Domina las búsquedas locales en Google</p>
              </Link>
              <Link href="/guia/marketing-digital-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Marketing Digital para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Meta Ads y TikTok Ads: invierte inteligentemente</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
