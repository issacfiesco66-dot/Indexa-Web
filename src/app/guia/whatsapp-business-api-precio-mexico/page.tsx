import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
const PAGE_PATH = "/guia/whatsapp-business-api-precio-mexico";

export const metadata: Metadata = {
  title: "WhatsApp Business API Precio México 2026: Cuánto Cuesta y Cómo Activarla",
  description:
    "Guía completa de precios de WhatsApp Business API en México 2026: costo por conversación, comparativa proveedores (Twilio, 360dialog, Meta Cloud), requisitos y pasos para activarla en tu PYME.",
  keywords: [
    "whatsapp business api precio mexico",
    "cuanto cuesta whatsapp business api",
    "whatsapp business api mexico 2026",
    "activar whatsapp business api pyme",
    "whatsapp cloud api precio",
    "twilio whatsapp precio mexico",
    "meta whatsapp business api costo",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "WhatsApp Business API Precio México 2026 — INDEXA",
    description:
      "Cuánto cuesta WhatsApp Business API en México y cómo activarla en tu PYME sin pagarle a un developer.",
    url: `${SITE_URL}${PAGE_PATH}`,
    type: "article",
    locale: "es_MX",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  other: {
    "geo.region": "MX",
    "geo.placename": "México",
    language: "es-MX",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "WhatsApp Business API Precio México 2026: Cuánto Cuesta y Cómo Activarla",
  description:
    "Guía detallada del costo de WhatsApp Business API en México en 2026. Tarifas oficiales de Meta, comparativa de proveedores y pasos para activarla.",
  author: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
  publisher: {
    "@type": "Organization",
    name: "INDEXA",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  },
  datePublished: "2026-04-15",
  dateModified: "2026-05-01",
  mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
  inLanguage: "es-MX",
  about: {
    "@type": "Thing",
    name: "WhatsApp Business API",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "WhatsApp Business API Precio México" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta WhatsApp Business API en México en 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "El costo en México (zona MX) varía según el tipo de conversación: Marketing $0.0822 USD por conversación de 24h, Utilidad (notificaciones de orden) $0.0080 USD, Autenticación $0.0344 USD y Servicio (responder al cliente) $0.0044 USD. Las primeras 1,000 conversaciones de servicio al mes son gratis cuando inicias desde el botón de chat en tu sitio. Estas son tarifas oficiales de Meta a abril 2026.",
      },
    },
    {
      "@type": "Question",
      name: "¿Es lo mismo WhatsApp Business y WhatsApp Business API?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "No. WhatsApp Business es la app gratuita para celular con catálogo, etiquetas y respuestas rápidas, limitada a 1 dispositivo. WhatsApp Business API es la solución corporativa que permite múltiples agentes simultáneos, integración con CRM, chatbots, automatizaciones y envío masivo de plantillas aprobadas. La API es la única forma de conectar el chat a un sistema de ventas o IA conversacional.",
      },
    },
    {
      "@type": "Question",
      name: "¿Necesito un developer para activar WhatsApp Business API?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Antes sí, ahora no. Plataformas como INDEXA, Twilio, 360dialog y Meta Cloud API permiten conectarla en menos de 30 minutos sin tocar código. INDEXA además entrena un chatbot con la información de tu negocio y conecta tu WhatsApp a tu sitio web, todo desde un panel visual.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo migrar mi número actual de WhatsApp a la API?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Sí, pero perderás el acceso a la app móvil para ese número. Por eso muchos negocios usan un número distinto para la API y mantienen el original como personal. La migración tarda 24-48 horas hábiles.",
      },
    },
    {
      "@type": "Question",
      name: "¿Hay un mínimo de conversaciones para usar la API?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "No hay mínimo de Meta. Algunos proveedores cobran una mensualidad fija aparte de las conversaciones (Twilio cobra ~$5 USD/mes por número, INDEXA lo incluye en el plan). Si recibes menos de 50 mensajes al mes, probablemente WhatsApp Business gratis sea suficiente. La API tiene sentido cuando quieres automatización, varios agentes o integración con sistemas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuántos clientes nuevos puede atraer un chatbot en WhatsApp?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Depende del tráfico del sitio y el tipo de negocio. PYMES mexicanas con 1,000 visitas mensuales y un chatbot bien configurado típicamente convierten 8-15% en conversaciones, y de ahí cierran 25-40% en clientes. Esto se traduce en 20-60 clientes nuevos al mes adicionales sin contratar más personal.",
      },
    },
  ],
};

interface ProviderRow {
  proveedor: string;
  setup: string;
  mensualidad: string;
  conversacion: string;
  panelEspañol: string;
  pros: string;
  contras: string;
}

const PROVIDERS: ProviderRow[] = [
  {
    proveedor: "INDEXA",
    setup: "Gratis",
    mensualidad: "Incluido en plan ($299-1,299 MXN)",
    conversacion: "Tarifa Meta directa, sin markup",
    panelEspañol: "Sí, panel completo en español",
    pros: "Chatbot IA incluido, integración con sitio web, soporte WhatsApp",
    contras: "Requiere plan INDEXA",
  },
  {
    proveedor: "Meta Cloud API (oficial)",
    setup: "Gratis",
    mensualidad: "$0",
    conversacion: "Tarifa oficial Meta",
    panelEspañol: "Limitado, panel técnico",
    pros: "100% oficial, gratis sin proveedor",
    contras: "Requiere developer, sin chatbot, sin UI",
  },
  {
    proveedor: "Twilio",
    setup: "$0",
    mensualidad: "$5 USD/número/mes",
    conversacion: "Tarifa Meta + ~$0.005 USD markup",
    panelEspañol: "Inglés",
    pros: "Estable, internacional, muchas integraciones",
    contras: "Caro a escala, soporte solo en inglés",
  },
  {
    proveedor: "360dialog",
    setup: "$0",
    mensualidad: "€19/mes (~$420 MXN)",
    conversacion: "Tarifa Meta directa",
    panelEspañol: "Inglés/alemán",
    pros: "BSP oficial, buena documentación",
    contras: "Soporte en horario europeo",
  },
  {
    proveedor: "Gupshup",
    setup: "$0",
    mensualidad: "$10-50 USD según volumen",
    conversacion: "Tarifa Meta + markup variable",
    panelEspañol: "Inglés",
    pros: "Muchas plantillas, facturación India",
    contras: "Curva de aprendizaje, sin equipo en LATAM",
  },
];

interface ConversationRate {
  tipo: string;
  descripcion: string;
  precio: string;
  ejemplo: string;
}

const CONVERSATION_RATES: ConversationRate[] = [
  {
    tipo: "Servicio",
    descripcion: "El cliente te escribe primero. Tienes 24h para responder lo que necesite.",
    precio: "$0.0044 USD (~$0.08 MXN)",
    ejemplo: "Las primeras 1,000 al mes son gratis si inician desde tu sitio web.",
  },
  {
    tipo: "Utilidad",
    descripcion: "Notificaciones transaccionales (recordatorios de cita, status de orden, factura).",
    precio: "$0.0080 USD (~$0.14 MXN)",
    ejemplo: "Recordatorio de cita 24h antes, ticket de pedido confirmado.",
  },
  {
    tipo: "Autenticación",
    descripcion: "Códigos OTP / verificación de cuenta.",
    precio: "$0.0344 USD (~$0.60 MXN)",
    ejemplo: "Código de 6 dígitos para login en tu app.",
  },
  {
    tipo: "Marketing",
    descripcion: "Ofertas, promociones, lanzamientos. Requiere plantilla aprobada.",
    precio: "$0.0822 USD (~$1.43 MXN)",
    ejemplo: "Anuncio de oferta del 10 de mayo a tu base de clientes.",
  },
];

export default function GuiaWhatsAppBusinessAPIPrecio() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/3 h-[450px] w-[450px] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-orange/10 blur-[120px]" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <Link href="/guia" className="hover:text-white/70">Guías</Link>
              {" / "}
              <span className="text-white/60">WhatsApp Business API · Precio México</span>
            </nav>
            <span className="inline-block rounded-full bg-emerald-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
              Guía oficial · Tarifas 2026
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              WhatsApp Business API{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Precio en México 2026
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
              Cuánto cuesta de verdad activar WhatsApp Business API para tu PYME mexicana, qué incluye Meta sin cobrar y cómo evitar pagar de más a un proveedor.
            </p>
            <p className="mt-4 text-xs text-white/40">
              Última actualización: 1 de mayo 2026 · Tarifas verificadas con Meta directamente.
            </p>
          </div>
        </section>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Respuesta directa</h2>
          <p>
            <strong>Activar WhatsApp Business API en México cuesta entre $0 y $1,500 MXN al mes</strong> dependiendo de cómo lo conectes:
          </p>
          <ul>
            <li><strong>Más barato (técnico):</strong> Meta Cloud API directo + un developer = $0 fijo + tarifas por conversación (~$200-800 MXN/mes para una PYME típica).</li>
            <li><strong>Más fácil (recomendado para PYMES):</strong> Una plataforma como <Link href="/servicios/chatbot-inteligente" className="font-semibold text-indexa-orange">INDEXA</Link> que incluye chatbot IA, panel en español y tarifas Meta sin markup = desde $299 MXN/mes todo incluido.</li>
            <li><strong>Internacional:</strong> Twilio o 360dialog = $5-19 USD/mes + tarifas + markup. Caro a escala y sin soporte local.</li>
          </ul>
          <p>
            La pregunta correcta no es <em>cuánto cuesta la API</em>, sino <strong>cuánto te ahorras dejando que un chatbot conteste a tus clientes 24/7 en lugar de perder ventas por no contestar a tiempo</strong>.
          </p>

          <h2>Las 4 tarifas oficiales de Meta (2026)</h2>
          <p>
            Meta cobra por &quot;conversación&quot; — que dura 24 horas desde el primer mensaje. Hay 4 categorías y México (zona MX) tiene tarifas más bajas que LATAM general:
          </p>
        </article>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Tipo</th>
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Cuándo se usa</th>
                  <th className="px-4 py-3 text-left font-bold text-emerald-600">Precio (MX)</th>
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                {CONVERSATION_RATES.map((row) => (
                  <tr key={row.tipo} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-bold text-indexa-gray-dark">{row.tipo}</td>
                    <td className="px-4 py-3 text-gray-700">{row.descripcion}</td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-emerald-700">{row.precio}</td>
                    <td className="px-4 py-3 text-gray-600">{row.ejemplo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Tarifas oficiales de Meta para zona MX, abril 2026. Pueden cambiar; revisa{" "}
            <a href="https://developers.facebook.com/docs/whatsapp/pricing" target="_blank" rel="noopener noreferrer" className="text-indexa-orange hover:underline">
              developers.facebook.com/docs/whatsapp/pricing
            </a>{" "}
            antes de presupuestar.
          </p>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Cuánto gasta de verdad una PYME mexicana al mes</h2>
          <p>
            Calculamos 3 escenarios reales basados en clientes de INDEXA en México:
          </p>

          <h3>📍 Restaurante con 800 visitas mensuales al sitio</h3>
          <ul>
            <li>Conversaciones de servicio iniciadas desde web: ~120 al mes (gratis, dentro de las 1,000 mensuales)</li>
            <li>Notificaciones de pedido confirmado: ~150 al mes a $0.14 MXN = <strong>$21 MXN</strong></li>
            <li>Recordatorios de reserva (utilidad): ~80 al mes a $0.14 MXN = <strong>$11 MXN</strong></li>
            <li>Marketing (1 envío a 200 clientes): 1×200×$1.43 = <strong>$286 MXN</strong></li>
            <li><strong>Total Meta: ~$318 MXN/mes</strong> + plan INDEXA $599 MXN = <strong>$917 MXN totales</strong></li>
          </ul>

          <h3>🦷 Consultorio dental con agenda de citas</h3>
          <ul>
            <li>Conversaciones de servicio: ~60 al mes (gratis)</li>
            <li>Recordatorios de cita 24h y 1h antes: ~400 al mes a $0.14 = <strong>$56 MXN</strong></li>
            <li>Cero campañas marketing</li>
            <li><strong>Total Meta: ~$56 MXN/mes</strong> + plan INDEXA $599 = <strong>$655 MXN totales</strong></li>
          </ul>

          <h3>🛠️ Taller mecánico con sitio web pequeño</h3>
          <ul>
            <li>Conversaciones de servicio: ~40 al mes (gratis)</li>
            <li>Notificaciones de orden lista: ~50 al mes = <strong>$7 MXN</strong></li>
            <li><strong>Total Meta: ~$7 MXN/mes</strong> + plan INDEXA $299 = <strong>$306 MXN totales</strong></li>
          </ul>

          <h2>Comparativa de proveedores en México (2026)</h2>
          <p>
            Estos son los 5 proveedores más usados para activar WhatsApp Business API si tu negocio está en México:
          </p>
        </article>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Proveedor</th>
                  <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Setup</th>
                  <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Mensualidad</th>
                  <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Por conversación</th>
                  <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Panel español</th>
                  <th className="px-3 py-3 text-left font-bold text-emerald-600">Pros</th>
                  <th className="px-3 py-3 text-left font-bold text-red-600">Contras</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDERS.map((row) => (
                  <tr key={row.proveedor} className={`border-b border-gray-100 ${row.proveedor === "INDEXA" ? "bg-indexa-orange/5" : ""}`}>
                    <td className="px-3 py-3 font-bold text-indexa-gray-dark">{row.proveedor}</td>
                    <td className="px-3 py-3 text-gray-700">{row.setup}</td>
                    <td className="px-3 py-3 text-gray-700">{row.mensualidad}</td>
                    <td className="px-3 py-3 text-gray-700">{row.conversacion}</td>
                    <td className="px-3 py-3 text-gray-700">{row.panelEspañol}</td>
                    <td className="px-3 py-3 text-gray-600">{row.pros}</td>
                    <td className="px-3 py-3 text-gray-600">{row.contras}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Cómo activar WhatsApp Business API paso a paso (sin developer)</h2>

          <h3>Paso 1 — Decide tu número</h3>
          <p>
            Recomendamos un número distinto al personal. Compra una tarjeta SIM nueva o usa un número virtual (Twilio, Telnyx). El número debe poder recibir SMS o llamadas para verificación.
          </p>

          <h3>Paso 2 — Verifica tu negocio en Meta Business Manager</h3>
          <p>
            Necesitas tener un Business Manager activo en{" "}
            <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-indexa-orange hover:underline">
              business.facebook.com
            </a>{" "}
            con tus documentos legales (RFC, comprobante de domicilio). Esta verificación tarda 1-7 días hábiles.
          </p>

          <h3>Paso 3 — Conecta con tu proveedor</h3>
          <p>
            Si vas con INDEXA, todo se hace desde un panel: pegas tu número, autorizas con Meta, y en 30 minutos tu chatbot está vivo.
            Si vas con Meta Cloud API directo, necesitarás un developer para conectar el webhook a tu servidor (~3 días de trabajo).
          </p>

          <h3>Paso 4 — Aprueba tus plantillas</h3>
          <p>
            Para mensajes de marketing y utilidad, Meta debe aprobar plantillas pre-escritas. Tarda 24-48 horas y no aceptan textos comerciales agresivos. INDEXA te las redacta y aprueba por ti.
          </p>

          <h3>Paso 5 — Conecta a tu sitio web y empieza a vender</h3>
          <p>
            Pones el botón de WhatsApp en cada sección de tu web, agendas las primeras conversaciones desde tráfico orgánico y tu chatbot las contesta. Las primeras 1,000 conversaciones del mes son gratis si llegan desde tu sitio.
          </p>

          <h2>Errores caros que las PYMES mexicanas cometen</h2>

          <h3>❌ Pagarle a una agencia $5,000 MXN/mes solo por &quot;manejar el WhatsApp&quot;</h3>
          <p>
            Hay agencias que cobran fijo por hacer setup que la plataforma de INDEXA hace automático. Si te están cobrando más de $1,500 MXN/mes solo para el chat, te están vendiendo humo.
          </p>

          <h3>❌ Usar WhatsApp Business app + 5 celulares para 5 vendedores</h3>
          <p>
            Esto pierde conversaciones, no tiene métricas y no escala. Una API con un solo número y 5 agentes en panel cuesta menos que comprar 5 celulares y se ve más profesional.
          </p>

          <h3>❌ Mandar publicidad sin plantilla aprobada</h3>
          <p>
            Meta banea cuentas que envían marketing &quot;a la libre&quot;. Si te bloquean el número, perderás todo el historial. Siempre usa plantillas aprobadas.
          </p>

          <h3>❌ No medir ROI</h3>
          <p>
            Sin tracking, no sabes si la API se paga sola. Las{" "}
            <Link href="/servicios/analiticas-tiempo-real" className="font-semibold text-indexa-orange">
              analíticas en tiempo real
            </Link>{" "}
            te dicen cuántos clicks de WhatsApp se convirtieron en venta.
          </p>

          <h2>Preguntas frecuentes</h2>
          {faqJsonLd.mainEntity.map((q) => (
            <details key={q.name} className="mb-3 rounded-xl border border-gray-200 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-indexa-gray-dark">{q.name}</summary>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{q.acceptedAnswer.text}</p>
            </details>
          ))}
        </article>

        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-cyan-600 py-20">
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Activa WhatsApp Business API hoy con cero código
            </h2>
            <p className="mt-4 text-lg text-white/85">
              INDEXA conecta tu número, entrena un chatbot con la información de tu negocio y lo deja respondiendo 24/7 — todo en menos de 30 minutos.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-emerald-600 shadow-xl transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis
              </Link>
              <Link
                href="/servicios/chatbot-inteligente"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
              >
                Ver cómo funciona el chatbot
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
