import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Cuánto cuesta la página web de un dentista en México (2026)",
  description:
    "Precios reales en MXN para crear el sitio web de un consultorio dental en México: planes mensuales, qué debe incluir y cómo aparecer en Google Maps siendo dentista.",
  alternates: { canonical: "/guia/pagina-web-dentista-mexico-cuanto-cuesta" },
  openGraph: {
    title: "Cuánto cuesta la página web de un dentista en México (2026)",
    description: "Tabla de precios en MXN, checklist de qué debe tener y cómo dominar 'dentista cerca de mí' en CDMX, GDL y MTY.",
    url: `${SITE_URL}/guia/pagina-web-dentista-mexico-cuanto-cuesta`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cuánto cuesta la página web de un dentista en México (2026)",
  description:
    "Precios reales en pesos mexicanos para el sitio web de un consultorio dental, qué características son críticas y cómo aparecer en Google Maps en búsquedas locales.",
  author: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
  publisher: { "@type": "Organization", name: "INDEXA", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
  datePublished: "2026-04-27",
  dateModified: "2026-04-27",
  mainEntityOfPage: `${SITE_URL}/guia/pagina-web-dentista-mexico-cuanto-cuesta`,
  inLanguage: "es-MX",
  audience: { "@type": "Audience", audienceType: "Dentistas y consultorios dentales en México" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "Cuánto cuesta la página web de un dentista en México" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta la página web de un dentista en México al mes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El sitio web de un consultorio dental en México cuesta entre $299 MXN y $1,299 MXN al mes en 2026, dependiendo de las funciones que se incluyan. Plan Starter de INDEXA: $299 MXN/mes (sitio con IA, WhatsApp, SEO local básico, SSL). Plan Profesional: $599 MXN/mes (agrega Schema.org Dentist, citas en línea, estadísticas, soporte prioritario). Plan Enterprise: $1,299 MXN/mes (agrega dominio propio tipo dentistadrgomez.com, anuncios Facebook/Instagram/TikTok integrados y asesor dedicado). Un desarrollador freelance cobra entre $5,000 y $20,000 MXN por un sitio similar sin SEO ni mantenimiento incluidos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué debe tener la página web de un consultorio dental para atraer pacientes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Una página web efectiva para un consultorio dental en México debe incluir: 1) Botón de WhatsApp directo con mensaje pre-armado para agendar cita; 2) Sección de servicios con precios o rangos (limpieza, blanqueamiento, ortodoncia, implantes, endodoncia); 3) Ubicación con Google Maps embebido y dirección exacta; 4) Horarios de atención y si aceptan urgencias; 5) Schema.org Dentist + LocalBusiness con coordenadas GPS; 6) Fotos del consultorio y del equipo; 7) Reseñas o testimonios de pacientes; 8) Sección de seguros aceptados (si aplica); 9) Formulario de cita en línea o link a calendario; 10) Certificado SSL y carga rápida en celular.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo aparezco en Google Maps siendo dentista en CDMX, Guadalajara o Monterrey?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para aparecer en Google Maps como dentista en CDMX, Guadalajara, Monterrey o cualquier ciudad mexicana, necesitas tres cosas combinadas: 1) Google Business Profile completo (verificado, con horarios, fotos, servicios, categoría 'Dentista'); 2) Sitio web con Schema.org Dentist y LocalBusiness con coordenadas GPS exactas; 3) Reseñas reales de pacientes (mínimo 10 con foto y respuesta del consultorio). INDEXA implementa el Schema automáticamente. Tiempo estimado para empezar a salir en búsquedas locales tipo 'dentista cerca de mí' o 'ortodoncia en Polanco': de 2 a 6 semanas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Necesito una página web si ya tengo Facebook, Instagram y Google Business Profile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Facebook e Instagram funcionan como vitrina pero no permiten aparecer en búsquedas de Google fuera de la red social. Google Business Profile te muestra en Google Maps pero no controla tu narrativa: las descripciones, fotos y reseñas las gestiona Google. Una página web propia te da control total: SEO específico para los servicios que más te dejan margen (ej: implantes), capturar correos de pacientes potenciales, integrar agendamiento y aparecer cuando alguien busca 'dentista honesto en [tu ciudad]'.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué Schema.org necesita la página web de un dentista?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El sitio web de un consultorio dental debe implementar Schema.org Dentist (subtipo de MedicalBusiness) y LocalBusiness en formato JSON-LD. Esto incluye: name, address, telephone, openingHours, geo (coordenadas GPS), medicalSpecialty (Dentistry, Orthodontics, Endodontics según corresponda), priceRange, aggregateRating si tienes reseñas. INDEXA lo implementa automáticamente desde el plan Profesional ($599 MXN/mes).",
      },
    },
    {
      "@type": "Question",
      name: "¿Vale la pena pagar anuncios de Facebook o Google Ads siendo dentista?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, especialmente para servicios de alto margen como ortodoncia, implantes y blanqueamiento. Inversión mínima recomendada: $50 a $150 MXN por día (≈ $1,500 a $4,500 MXN/mes) en Facebook Ads o Instagram Ads, segmentando por código postal en radio de 5 km del consultorio y por edad/intereses. Costo por consulta agendada típico en México: $80 a $250 MXN. INDEXA Enterprise incluye el panel para correr estas campañas sin contratar agencia.",
      },
    },
  ],
};

const checklist = [
  { titulo: "WhatsApp con mensaje pre-armado", desc: "'Hola, vi su consultorio en internet, quiero agendar consulta para [servicio]'." },
  { titulo: "Lista de servicios con rango de precio", desc: "Limpieza, blanqueamiento, ortodoncia, implantes, endodoncia. Aunque sea 'desde $X', le da confianza al paciente." },
  { titulo: "Google Maps embebido y dirección", desc: "Tu paciente decide en 5 segundos si te va a visitar según qué tan fácil es llegar." },
  { titulo: "Horarios + urgencias", desc: "Si atiendes sábados, domingos o urgencias dentales, déjalo arriba del fold." },
  { titulo: "Schema.org Dentist + LocalBusiness", desc: "Datos estructurados para Google Maps y resultados locales. Crítico." },
  { titulo: "Fotos del consultorio + equipo", desc: "Mínimo 6 fotos: fachada, sala de espera, sillón, cuarto de rayos X, equipo, antes/después." },
  { titulo: "Reseñas embebidas", desc: "Pull desde Google Business Profile. Si tienes menos de 10 reseñas, pide a los pacientes recientes." },
  { titulo: "Seguros y financiamiento", desc: "Si aceptas Seguros Monterrey, MetLife, MAPFRE o financiamiento Kueski/Atrato, déjalo claro." },
  { titulo: "Agendamiento en línea o link a calendario", desc: "Calendly o Google Calendar embebido funciona bien." },
  { titulo: "Velocidad en celular", desc: "Google penaliza sitios lentos. INDEXA optimiza imágenes a AVIF/WebP automáticamente." },
];

export default function GuiaDentistaCuantoCuesta() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <Link href="/guia" className="hover:text-white/70">Guías</Link>
              {" / "}
              <span className="text-white/60">Página web de un dentista en México</span>
            </nav>
            <span className="inline-block rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
              Guía para dentistas · 2026
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Cuánto cuesta la{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                página web de un dentista en México
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Precios reales en MXN, qué características son críticas para atraer pacientes y cómo dominar las búsquedas locales tipo &quot;dentista cerca de mí&quot;.
            </p>
          </div>
        </section>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Respuesta corta</h2>
          <p>
            La página web de un consultorio dental en México cuesta <strong>entre $299 y $1,299 MXN al mes</strong> en 2026 con plataformas SaaS como INDEXA. Un desarrollador freelance cobra de $5,000 a $20,000 MXN por hacer el sitio una vez, sin incluir mantenimiento ni SEO. Para un consultorio que quiere atraer pacientes nuevos por Google Maps y WhatsApp, el plan recomendado es el Profesional de INDEXA ($599 MXN/mes) porque incluye Schema.org Dentist (crítico para SEO local) y soporte prioritario por WhatsApp.
          </p>

          <h2>Tabla de precios (planes mensuales en México)</h2>
        </article>

        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { plan: "Starter", precio: "$299", incluye: ["Sitio generado con IA", "Botón de WhatsApp", "SEO básico automático", "Certificado SSL", "1 plantilla a elegir", "Soporte por email"], cta: "Empezar gratis" },
              { plan: "Profesional", precio: "$599", recomendado: true, incluye: ["Todo lo de Starter", "Schema.org Dentist + LocalBusiness", "Panel CMS visual", "Estadísticas de visitas y clics", "3 plantillas a elegir", "Soporte prioritario por WhatsApp", "Asesoría SEO local"], cta: "Probar 14 días gratis" },
              { plan: "Enterprise", precio: "$1,299", incluye: ["Todo lo de Profesional", "Dominio personalizado (drsmith.mx)", "Anuncios Facebook/Instagram/TikTok integrados", "Bio links para redes sociales", "Asesor dedicado", "Estrategia mensual personalizada"], cta: "Hablar con un asesor" },
            ].map((p) => (
              <div key={p.plan} className={`rounded-2xl border p-6 ${p.recomendado ? "border-indexa-orange bg-orange-50 shadow-xl" : "border-gray-200 bg-white"}`}>
                {p.recomendado && <span className="mb-3 inline-block rounded-full bg-indexa-orange px-3 py-1 text-xs font-bold uppercase text-white">Recomendado</span>}
                <h3 className="text-xl font-extrabold text-indexa-gray-dark">{p.plan}</h3>
                <p className="mt-2"><span className="text-3xl font-extrabold text-indexa-gray-dark">{p.precio}</span><span className="text-sm text-gray-500"> MXN/mes</span></p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {p.incluye.map((i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">✓</span><span>{i}</span></li>)}
                </ul>
                <Link href="/registro" className={`mt-6 inline-block w-full rounded-xl px-4 py-3 text-center text-sm font-bold transition-all ${p.recomendado ? "bg-indexa-orange text-white hover:bg-orange-600" : "bg-gray-100 text-indexa-gray-dark hover:bg-gray-200"}`}>
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Qué debe tener la página web de un consultorio dental?</h2>
          <p>
            Un sitio web efectivo para un dentista en México no es un folleto digital — es una herramienta de captación. Esta es la lista mínima de elementos que mueven la aguja en pacientes nuevos:
          </p>
        </article>

        <div className="mx-auto max-w-3xl px-4 py-2 sm:px-6">
          <ol className="space-y-4">
            {checklist.map((c, i) => (
              <li key={c.titulo} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indexa-blue/10 font-bold text-indexa-blue">{i + 1}</span>
                <div>
                  <h3 className="font-bold text-indexa-gray-dark">{c.titulo}</h3>
                  <p className="mt-1 text-sm text-gray-600">{c.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Cómo aparecer en Google Maps siendo dentista</h2>
          <p>
            Aparecer en el &quot;3-pack&quot; de Google Maps (los 3 primeros resultados que se muestran con el mapa) cuando alguien busca <em>&quot;dentista cerca de mí&quot;</em> en tu ciudad requiere tres ingredientes que actúan juntos:
          </p>
          <ol>
            <li><strong>Google Business Profile</strong> verificado, con la categoría <em>Dentista</em> o <em>Ortodoncista</em>, fotos reales recientes, horarios actualizados, descripción y todos los servicios listados.</li>
            <li><strong>Sitio web con Schema.org Dentist</strong> (subtipo de MedicalBusiness) que coincida con los datos del Business Profile: misma dirección, mismo teléfono, mismas coordenadas GPS. Si los datos divergen, Google penaliza.</li>
            <li><strong>Reseñas reales de pacientes</strong>: mínimo 10, idealmente 25+ con foto del paciente y respuesta del consultorio. Las reseñas son la señal #1 de credibilidad para Google.</li>
          </ol>
          <p>
            INDEXA configura los puntos 2 y 3 automáticamente (el Schema y la integración con Google Business Profile). El #1 (verificación) la haces tú una vez con tu CURP y dirección del consultorio.
          </p>

          <div className="not-prose my-12 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-8 text-center">
            <h3 className="text-2xl font-extrabold text-indexa-gray-dark">¿Listo para que tu consultorio aparezca en Google?</h3>
            <p className="mt-3 text-gray-600">Sitio listo en 3 minutos. 14 días gratis. Sin tarjeta de crédito.</p>
            <Link
              href="/registro"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
            >
              Crear mi sitio dental ahora →
            </Link>
          </div>

          <h2>Preguntas frecuentes</h2>
          {faqJsonLd.mainEntity.map((q) => (
            <details key={q.name} className="mb-3 rounded-xl border border-gray-200 bg-white p-5">
              <summary className="cursor-pointer text-base font-semibold text-indexa-gray-dark">{q.name}</summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{q.acceptedAnswer.text}</p>
            </details>
          ))}

          <h2>Otros recursos</h2>
          <ul>
            <li><Link href="/sitio-web-dentista">Sitio web para dentistas: características y demo</Link></li>
            <li><Link href="/guia/seo-local-mexico">SEO local en México: aparece en Google Maps</Link></li>
            <li><Link href="/guia/google-mi-negocio">Cómo configurar Google Business Profile</Link></li>
            <li><Link href="/guia/whatsapp-business-pymes">WhatsApp Business para PYMES</Link></li>
            <li><Link href="/guia/mejor-plataforma-pagina-web-pymes-mexico-2026">Comparativa de plataformas en México</Link></li>
          </ul>
        </article>
      </main>
      <Footer />
    </>
  );
}
