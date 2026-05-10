import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildAgenciaPageGraph, SITE_URL } from "@/lib/agenciaSeoSchemas";

const PAGE_PATH = "/agencia-de-seo";

export const metadata: Metadata = {
  title: "Agencia de SEO en México | INDEXA — Posiciona tu Negocio en Google",
  description:
    "INDEXA es la agencia de SEO para PYMES en México. Posicionamiento en Google, SEO local en Maps, schema, link building y reportes en tiempo real. Desde $299 MXN/mes.",
  keywords: [
    "agencia de seo",
    "agencia seo",
    "agencia seo México",
    "agencia de posicionamiento seo",
    "agencia posicionamiento seo",
    "empresas de seo",
    "agencia seo local",
    "consultor seo México",
    "experto seo México",
    "agencia seo cdmx",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Agencia de SEO en México — INDEXA",
    description:
      "Posicionamiento en Google y Maps con IA. SEO local, schema y reportes en tiempo real desde $299 MXN/mes.",
    url: `${SITE_URL}${PAGE_PATH}`,
    locale: "es_MX",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faq = [
  {
    pregunta: "¿Qué hace una agencia de SEO?",
    respuesta:
      "Una agencia de SEO (Search Engine Optimization) ayuda a un negocio a aparecer arriba en Google de forma orgánica, sin pagar por clic. Las áreas típicas son: (1) SEO técnico — velocidad del sitio, indexabilidad, schema.org, sitemap; (2) SEO on-page — títulos, meta descripciones, contenido optimizado por keyword; (3) SEO local — Google Business Profile, reseñas, citaciones locales; (4) link building — conseguir backlinks de calidad; (5) contenido — blogs y guías que respondan preguntas reales. INDEXA es una agencia de SEO con IA: automatiza el SEO técnico y on-page desde el día 1.",
  },
  {
    pregunta: "¿Cuánto cuesta una agencia de SEO en México?",
    respuesta:
      "El fee típico de una agencia de SEO en México va de $5,000 a $40,000 MXN/mes según el alcance. Auditorías one-shot cuestan $10,000–$50,000 MXN. SEO local (Google Maps + GBP) suele costar $5,000–$15,000 MXN/mes. SEO orgánico nacional con link building cuesta $20,000+ MXN/mes. INDEXA incluye SEO local automático en todos los planes ($299 MXN/mes Starter), SEO local avanzado en Profesional ($599 MXN/mes) y SEO en 5 ciudades en Dominio Local ($1,997 MXN/mes para mercado USA-Hispano).",
  },
  {
    pregunta: "¿Cuánto tarda en dar resultados el SEO?",
    respuesta:
      "El SEO orgánico típicamente tarda 3-6 meses en mostrar tracción real, y 6-12 meses para llegar a posiciones top 3 en keywords competitivos. El SEO local (Google Maps) es más rápido: 30-90 días para aparecer en el top 3 del Map Pack si tu Google Business Profile está bien optimizado y tienes 20+ reseñas. INDEXA ataca primero el SEO local (resultados en 1-3 meses) mientras construye el SEO orgánico (3-6 meses para keywords más amplios). En el camino, las campañas pagadas de Google Ads y Meta Ads cubren el flujo de leads.",
  },
  {
    pregunta: "¿Qué incluye el servicio de SEO de INDEXA?",
    respuesta:
      "INDEXA incluye en todos los planes: (1) SEO técnico automático — schema.org JSON-LD, sitemap, robots.txt, meta tags optimizados; (2) SEO local — Google Business Profile, citaciones, schema LocalBusiness; (3) optimización on-page por keyword principal y secundarias; (4) sitio web con velocidad optimizada (Core Web Vitals). En Profesional se agrega SEO local avanzado y reportes mensuales. En Dominio Local se agrega SEO en múltiples ciudades, sistema automatizado de reseñas, link building y publicación de contenido en blog.",
  },
  {
    pregunta: "¿INDEXA hace SEO local para Google Maps?",
    respuesta:
      "Sí. El SEO local (Google Maps + Map Pack) es uno de los servicios principales de INDEXA. Configuramos tu Google Business Profile completo: nombre, categoría, horarios, fotos, descripción, atributos, productos y servicios. Implementamos schema LocalBusiness en tu sitio web con coordenadas GPS exactas. Generamos citaciones en directorios mexicanos (Sección Amarilla, Doplim, OLX, etc.) y un sistema automatizado para pedir reseñas a tus clientes vía SMS/WhatsApp después de cada servicio.",
  },
  {
    pregunta: "¿Cuál es la diferencia entre SEO y Google Ads?",
    respuesta:
      "Google Ads = anuncios pagados. Pagas cada clic, los resultados son inmediatos (3-7 días) pero se acaban cuando dejas de pagar. SEO = posicionamiento orgánico. No pagas por clic, los resultados tardan 3-6 meses pero son sostenibles a largo plazo y el tráfico se acumula con el tiempo. Lo ideal para una PYME es combinar ambos: Google Ads para resultados inmediatos mientras el SEO crece. INDEXA cubre los dos frentes en una sola plataforma.",
  },
  {
    pregunta: "¿Cómo aparezco en el Map Pack (top 3 de Google Maps)?",
    respuesta:
      "Aparecer en el Map Pack requiere tres cosas: (1) un Google Business Profile completo y verificado con tu dirección física en la ciudad objetivo; (2) consistencia de NAP (nombre, dirección, teléfono) en todos los directorios de internet; (3) reseñas — mínimo 20-30 reseñas con rating 4.5+ y respuestas activas a todas. INDEXA configura los tres frentes durante el onboarding y monitorea tu posición en el Map Pack semanalmente para queries clave de tu industria + ciudad.",
  },
  {
    pregunta: "¿Qué keywords debería atacar mi negocio?",
    respuesta:
      "Las mejores keywords combinan tres criterios: (1) volumen de búsqueda mensual relevante para tu zona; (2) intención comercial alta (la persona que busca quiere comprar/contratar); (3) competencia que tu sitio puede vencer. Para PYMES locales recomendamos: keywords de servicio + ciudad ('plomero CDMX', 'dentista guadalajara'), keywords con 'cerca de mí' (geo-intent automático), y keywords long-tail de problema ('mi carro hace ruido al frenar'). INDEXA hace research de keywords automáticamente al onboarding según tu industria y zona.",
  },
];

const fasesSeo = [
  {
    titulo: "1. Auditoría",
    desc: "Analizamos tu sitio actual: velocidad, schema, indexación, keywords, competencia y oportunidades.",
  },
  {
    titulo: "2. SEO técnico",
    desc: "Schema.org, sitemap, robots.txt, Core Web Vitals, mobile-first, indexación. Todo automático con IA.",
  },
  {
    titulo: "3. SEO local",
    desc: "Google Business Profile + citaciones + schema LocalBusiness + reseñas. Aparecer en Map Pack.",
  },
  {
    titulo: "4. SEO on-page",
    desc: "Títulos, meta descriptions, headings, contenido optimizado por keyword principal y secundarias.",
  },
  {
    titulo: "5. Contenido y link building",
    desc: "Blog mensual con keywords long-tail. Outreach para conseguir backlinks de calidad.",
  },
  {
    titulo: "6. Reportes mensuales",
    desc: "Tracking de posiciones, tráfico orgánico, conversiones y comparativa contra competidores.",
  },
];

export default function AgenciaSeoPage() {
  const graph = buildAgenciaPageGraph({
    name: "Agencia de SEO en México — INDEXA",
    serviceType: "SEO técnico, SEO local, posicionamiento Google Maps, link building y contenido",
    pagePath: PAGE_PATH,
    description:
      "INDEXA es la agencia de SEO con IA para PYMES en México. SEO técnico, SEO local en Google Maps, schema.org, link building y reportes en tiempo real desde $299 MXN/mes.",
    audienceType: "PYMES y negocios locales en México que necesitan aparecer arriba en Google",
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
                  "linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[120px]" />

          <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 text-center lg:pt-32">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
              <span>📍</span>
              Agencia de SEO con IA · Para PYMES en México
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Agencia de SEO{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300 bg-clip-text text-transparent">
                que sí posiciona
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
              SEO técnico, SEO local en Google Maps, schema.org, link building y reportes en tiempo real — todo
              automatizado por IA, desde <span className="font-semibold text-white">$299 MXN al mes</span>. Aparece
              arriba en Google sin esperar 12 meses.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis
              </a>
              <a
                href="#fases"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Ver proceso
              </a>
            </div>
            <p className="mt-3 text-sm text-white/40">14 días gratis · Sin tarjeta · Cancela cuando quieras</p>
          </div>
        </section>

        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Qué es</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">¿Qué hace una agencia de SEO?</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Una <strong>agencia de SEO</strong> (Search Engine Optimization) ayuda a un negocio a aparecer arriba en
              Google de forma orgánica, sin pagar por clic. Las áreas típicas son: SEO técnico (velocidad,
              indexabilidad, schema), SEO on-page (títulos, contenido), SEO local (Google Business Profile, reseñas),
              link building y contenido (blogs y guías).
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              <strong>INDEXA</strong> automatiza el SEO técnico, on-page y local desde el día 1 usando IA. Tu sitio web
              ya nace con schema.org perfecto, velocidad optimizada y citaciones locales. Pagás desde{" "}
              <strong>$299 MXN/mes</strong> y empiezas a aparecer en Google Maps en 30-90 días, mientras el SEO
              orgánico gana posiciones más amplias en 3-6 meses.
            </p>
          </div>
        </section>

        <section id="fases" className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Proceso</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">6 fases del SEO con INDEXA</h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fasesSeo.map((f) => (
                <div
                  key={f.titulo}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <h3 className="text-lg font-bold text-emerald-400">{f.titulo}</h3>
                  <p className="mt-3 text-sm text-white/70">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-[#070b1f] py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Lo que más nos preguntan sobre SEO</h2>
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

            <div className="mt-14 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-lime-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">¿Listo para aparecer arriba en Google?</h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Empezamos con SEO local — verás resultados en Google Maps en los primeros 60-90 días.
              </p>
              <a
                href="/registro"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
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
