import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildAgenciaPageGraph, SITE_URL } from "@/lib/agenciaSeoSchemas";

const PAGE_PATH = "/agencia-google-ads";

export const metadata: Metadata = {
  title: "Agencia de Google Ads en México | INDEXA — Aparece Arriba en Google",
  description:
    "INDEXA es la agencia de Google Ads para PYMES en México. Campañas de búsqueda, Maps y Display optimizadas por IA. Leads directos a WhatsApp. Sin contratos, desde $299 MXN/mes.",
  keywords: [
    "agencia google ads",
    "google ads agencia",
    "agencia de google ads",
    "agencia marketing google ads",
    "agencia ppc",
    "agencia ppc México",
    "agencia google México",
    "agencia google ads cdmx",
    "consultor google ads",
    "experto google ads México",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Agencia de Google Ads en México — INDEXA",
    description:
      "Aparece primero en Google. Campañas de búsqueda, Maps y Display optimizadas por IA. Leads a tu WhatsApp.",
    url: `${SITE_URL}${PAGE_PATH}`,
    locale: "es_MX",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faq = [
  {
    pregunta: "¿Qué hace una agencia de Google Ads?",
    respuesta:
      "Una agencia de Google Ads se especializa en crear y administrar campañas de publicidad pagada dentro del ecosistema de Google: anuncios en resultados de búsqueda (Search), en Google Maps (Local), en YouTube, en la red Display (banners) y en Performance Max. Sus tareas típicas incluyen investigación de keywords, escritura de anuncios, configuración de extensiones, gestión de pujas, optimización de páginas de destino y reportes de ROAS. INDEXA es una agencia de Google Ads con IA que automatiza el 80% del trabajo y entrega leads directos a WhatsApp desde $299 MXN/mes.",
  },
  {
    pregunta: "¿Cuánto cobra una agencia de Google Ads en México?",
    respuesta:
      "El fee típico de una agencia de Google Ads en México va de $5,000 a $30,000 MXN/mes según el tamaño de la cuenta y el número de campañas. Algunas agencias cobran un porcentaje del gasto en anuncios (10–20%). INDEXA cobra fee desde $299 MXN/mes (incluye plataforma + setup + optimización con IA) en el plan Crecimiento; el presupuesto de anuncios va directo a Google Ads y tú lo controlas. Total realista para una PYME: $5,000–$15,000 MXN/mes incluyendo INDEXA + presupuesto de Google Ads.",
  },
  {
    pregunta: "¿Cuánto presupuesto necesito para hacer Google Ads?",
    respuesta:
      "Para una PYME local en México recomendamos empezar con $200–500 MXN/día ($6,000–$15,000 MXN/mes). El costo por clic en Google Ads México varía: keywords genéricos ($5–25 MXN/clic), keywords competitivos como 'abogado' o 'plomero urgente' ($30–80 MXN/clic), keywords muy nicho ($1–10 MXN/clic). Con $300 MXN/día y un nicho normal típicamente recibes 30–80 leads cualificados al mes. INDEXA ajusta automáticamente las pujas y palabras clave para minimizar el costo por lead.",
  },
  {
    pregunta: "¿Cuánto tarda en dar resultados Google Ads?",
    respuesta:
      "Google Ads es la forma más rápida de generar tráfico inmediato. Las campañas de Search activas empiezan a recibir clics en cuestión de horas y los primeros leads suelen llegar en 3–7 días. El primer mes es de aprendizaje del algoritmo (ajusta pujas, identifica horarios y demografía); del segundo mes en adelante el costo por lead baja típicamente 30–50%. Para SEO orgánico se necesitan 3–6 meses, así que Google Ads es la opción ideal para resultados inmediatos mientras tu SEO crece.",
  },
  {
    pregunta: "¿INDEXA configura las campañas o lo tengo que hacer yo?",
    respuesta:
      "INDEXA configura todo por ti. Durante el onboarding, conectas tu cuenta de Google Ads (o te ayudamos a abrirla), nos das información de tu negocio, servicios y zona, y la IA arma las primeras campañas en menos de 24 horas. Después la IA optimiza solas las pujas, palabras clave y horarios. Tú solo recibes los leads en WhatsApp y revisas el dashboard cuando quieras ver métricas (costo por lead, conversiones, ROAS).",
  },
  {
    pregunta: "¿Qué tipo de campañas de Google Ads incluye INDEXA?",
    respuesta:
      "INDEXA configura las cinco campañas principales según tu negocio: (1) Search — anuncios de texto cuando alguien busca tu servicio; (2) Maps / Local — aparece en Google Maps cuando buscan 'cerca de mí'; (3) Display — banners en sitios de la red de Google; (4) YouTube — videos cortos en pre-roll; (5) Performance Max — campaña automatizada que cubre todos los canales. El plan Crecimiento incluye Search + Maps; el plan Dominio Local incluye los 5 tipos.",
  },
  {
    pregunta: "¿Funciona Google Ads para mi industria?",
    respuesta:
      "Google Ads funciona en prácticamente todas las industrias B2C y B2B en México. Las industrias con mejor ROAS típicamente son: servicios de emergencia (plomeros, electricistas, mecánicos, cerrajeros), servicios profesionales (abogados, contadores, médicos, dentistas), servicios para el hogar (cleaning, landscaping, remodelaciones), ecommerce, y educación. Las que requieren más estrategia son productos de alto ticket B2B y servicios muy nicho. INDEXA tiene plantillas pre-optimizadas para 15+ industrias.",
  },
  {
    pregunta: "¿Puedo seguir usando mi cuenta de Google Ads existente?",
    respuesta:
      "Sí. INDEXA se conecta a tu cuenta de Google Ads existente vía API oficial. Conservas el historial, las conversiones y los datos previos. Si nunca has usado Google Ads, te ayudamos a crear la cuenta durante el onboarding (toma 15 minutos). Si ya tenías una agencia, puedes migrar a INDEXA sin perder datos — simplemente le retiras acceso a la agencia anterior y nos das acceso a nosotros.",
  },
];

const tiposCampana = [
  { titulo: "Search", desc: "Anuncios de texto cuando alguien busca tu servicio en Google.", emoji: "🔍" },
  { titulo: "Maps / Local", desc: "Aparece en Google Maps cuando buscan 'cerca de mí'.", emoji: "📍" },
  { titulo: "Display", desc: "Banners en sitios web y apps de la red de Google.", emoji: "🖼️" },
  { titulo: "YouTube", desc: "Videos cortos en pre-roll y mid-roll.", emoji: "🎬" },
  { titulo: "Performance Max", desc: "Campaña automatizada que cubre los 5 canales.", emoji: "⚡" },
  { titulo: "Shopping", desc: "Para ecommerce: tus productos arriba en Google.", emoji: "🛒" },
];

export default function AgenciaGoogleAdsPage() {
  const graph = buildAgenciaPageGraph({
    name: "Agencia de Google Ads en México — INDEXA",
    serviceType: "Google Ads, campañas de búsqueda, Maps, Display, YouTube y Performance Max",
    pagePath: PAGE_PATH,
    description:
      "INDEXA es la agencia de Google Ads con IA para PYMES en México. Campañas de Search, Maps, Display y Performance Max optimizadas automáticamente. Leads directos a WhatsApp.",
    audienceType: "PYMES y negocios en México que necesitan publicidad pagada en Google",
    faq,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <Header />
      <main className="bg-[#050816] text-white">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(66,133,244,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(66,133,244,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[120px]" />

          <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 text-center lg:pt-32">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
              <span>🔍</span>
              Agencia de Google Ads · Para PYMES en México
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Agencia de Google Ads{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
                que aparece arriba
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Cuando alguien busca tu servicio en Google, apareces tú primero. Campañas de Search, Maps, Display y
              Performance Max optimizadas por IA. Leads directos a tu WhatsApp desde{" "}
              <span className="font-semibold text-white">$299 MXN/mes</span>.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis
              </a>
              <a
                href="#tipos"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Ver tipos de campaña
              </a>
            </div>
            <p className="mt-3 text-sm text-white/40">14 días gratis · Sin tarjeta · Cancela cuando quieras</p>
          </div>
        </section>

        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-400">Qué es</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">¿Qué hace una agencia de Google Ads?</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Una <strong>agencia de Google Ads</strong> se especializa en crear y administrar campañas de publicidad
              pagada dentro del ecosistema de Google: anuncios en búsqueda (Search), Maps, YouTube, red Display y
              Performance Max. Sus tareas incluyen investigación de keywords, escritura de anuncios, gestión de pujas,
              optimización de páginas de destino y reportes de ROAS (retorno de inversión publicitaria).
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              <strong>INDEXA</strong> automatiza el 80% del trabajo de una agencia de Google Ads usando IA. La cuenta
              se configura en menos de 24 horas, las pujas se optimizan solas y los leads llegan directo a tu WhatsApp
              con nombre, servicio que buscan y zona — todo desde <strong>$299 MXN al mes</strong>, sin contrato anual.
            </p>
          </div>
        </section>

        <section id="tipos" className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-400">Tipos de campaña</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">
                6 formatos de Google Ads. Te configuramos los que necesites.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tiposCampana.map((t) => (
                <div
                  key={t.titulo}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 text-3xl">{t.emoji}</div>
                  <h3 className="text-lg font-bold">{t.titulo}</h3>
                  <p className="mt-2 text-sm text-white/65">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-[#070b1f] py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-400">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que más nos preguntan sobre Google Ads
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              {faq.map((q) => (
                <details
                  key={q.pregunta}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm open:bg-white/[0.07]"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-bold text-white">
                    {q.pregunta}
                    <span className="ml-2 mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-sm transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{q.respuesta}</p>
                </details>
              ))}
            </div>

            <div className="mt-14 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-emerald-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">¿Listo para aparecer arriba en Google?</h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Activamos tu primera campaña en menos de 24 horas. Sin contratos, pagás mes a mes.
              </p>
              <a
                href="/registro"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
