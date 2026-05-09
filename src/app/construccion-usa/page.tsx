import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildUsaHispanicServiceSchema, INDEXA_SITE_URL } from "@/lib/seoSchemas";

export const metadata: Metadata = {
  title: "Más clientes para tu negocio de construcción y remodelación en USA — INDEXA",
  description:
    "Cotizaciones de remodelación, techos, drywall, pintura y pisos para contractors hispanos en USA. Anuncios en español, página web optimizada y leads directos a WhatsApp. Garantía 30 días.",
  keywords: [
    "publicidad para contractor hispano USA",
    "marketing para construcción y remodelación",
    "más clientes para mi negocio de construcción",
    "anuncios remodelación Houston Dallas Miami",
    "general contractor advertising hispanic",
    "facebook ads construcción español",
  ],
  alternates: { canonical: "/construccion-usa" },
  openGraph: {
    title: "Llena tu agenda de remodelaciones — INDEXA USA",
    description:
      "Proyectos de remodelación, techos, drywall, pintura y pisos para contractors hispanos en USA. Anuncios en español + WhatsApp leads.",
    url: `${INDEXA_SITE_URL}/construccion-usa`,
    locale: "es_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqConstruccion = [
  {
    pregunta: "¿Sirve INDEXA si trabajo solo o con un equipo pequeño?",
    respuesta:
      "Sí — la mayoría de contractors hispanos empiezan así. INDEXA te ayuda a presentarte como negocio profesional sin parecer 'pequeño': página web con galería de trabajos, Google Business con reseñas y campañas de anuncios. Los clientes residenciales prefieren contratistas pequeños y confiables que cadenas grandes y caras.",
  },
  {
    pregunta: "¿Qué tipo de proyectos atrae INDEXA — pequeños o grandes?",
    respuesta:
      "Tú decides. Los rangos típicos son: pintura interior $500-3k, drywall reparaciones $300-1.5k, remodelación de baño $5-15k, remodelación de cocina $15-50k, techo nuevo $7-20k. Si quieres enfocarte solo en proyectos arriba de cierto monto, segmentamos los anuncios para atraer ese ticket.",
  },
  {
    pregunta: "¿Cómo me ayudan a competir con generales más grandes?",
    respuesta:
      "Tres cosas: (1) Reseñas en Google — captamos cada cliente satisfecho con un sistema automatizado, en 6 meses tienes 50-100 reseñas reales. (2) Galería de antes/después en tu página y redes — los clientes deciden por fotos. (3) Tiempo de respuesta — los leads llegan a tu WhatsApp y respondes en minutos, mientras los generales grandes tardan 2-3 días.",
  },
  {
    pregunta: "¿Necesito licencia de contractor para anunciarme?",
    respuesta:
      "Depende del estado y del trabajo. En Texas, Florida y muchos estados, no necesitas licencia para handyman/remodelación residencial menor. Para trabajos eléctricos, plomería, HVAC, sí. Si tienes licencia la destacamos en los anuncios; si no, enfocamos las campañas en servicios que no la requieran. En la primera llamada lo aclaramos.",
  },
  {
    pregunta: "¿Qué presupuesto de anuncios necesito?",
    respuesta:
      "$300-600/mes en presupuesto de anuncios para empezar. En construcción los tickets son más altos pero el costo por lead también — esperamos $30-80/lead. Con cerrar 1-2 proyectos al mes ya pagaste todo el plan + anuncios + ganancia. Una sola remodelación de $15k cubre 6 meses de servicio INDEXA.",
  },
  {
    pregunta: "¿Cómo se diferencia INDEXA de Angi, HomeAdvisor o Thumbtack?",
    respuesta:
      "Esas plataformas te cobran $20-100 por cada lead aunque sea basura, y compites con 5-15 contractors por el mismo cliente. Con INDEXA los leads son exclusivos tuyos, y a 12 meses ya construyes tu propia marca: clientes recurrentes y referidos. Las plataformas se quedan con el cliente; INDEXA te lo da a ti.",
  },
];

const serviciosConstruccion = [
  { nombre: "Remodelación de baños", icono: "🛁" },
  { nombre: "Remodelación de cocinas", icono: "🍳" },
  { nombre: "Pintura interior y exterior", icono: "🎨" },
  { nombre: "Drywall e instalación", icono: "🧱" },
  { nombre: "Pisos: laminado, vinyl, tile", icono: "🟫" },
  { nombre: "Techos / roofing", icono: "🏠" },
  { nombre: "Decks y patios", icono: "🪵" },
  { nombre: "Concrete / concreto", icono: "🏗️" },
  { nombre: "Trabajos de carpintería", icono: "🔨" },
];

const ciudadesConstruccion = [
  "Houston",
  "Dallas",
  "Austin",
  "San Antonio",
  "Miami",
  "Orlando",
  "Tampa",
  "Atlanta",
  "Charlotte",
  "Phoenix",
  "Las Vegas",
  "Denver",
];

export default function ConstruccionUsaPage() {
  const serviceJsonLd = buildUsaHispanicServiceSchema({
    serviceTitle: "Publicidad y captación de clientes para contractors hispanos en USA",
    serviceType: "Marketing digital y publicidad para construcción, remodelación, techos y handyman",
    pagePath: "/construccion-usa",
    description:
      "INDEXA llena agendas de contractors hispanos con proyectos de remodelación, techos, drywall, pintura y pisos en USA. Campañas en Meta y Google, página web optimizada y leads directos a WhatsApp.",
    audienceType: "Contractors, remodeladores y handymen hispanos en Estados Unidos",
    faq: faqConstruccion,
  });

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "INDEXA", item: INDEXA_SITE_URL },
      { "@type": "ListItem", position: 2, name: "USA Hispanos", item: `${INDEXA_SITE_URL}/usa` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Construcción en USA",
        item: `${INDEXA_SITE_URL}/construccion-usa`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Header />
      <main className="bg-[#050816] text-white">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-amber-500/15 blur-[120px]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-32">
            <div>
              <Link
                href="/usa"
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indexa-orange hover:text-orange-300"
              >
                ← Negocios hispanos en USA
              </Link>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
                <span>🏗️</span>
                Para contractors y remodeladores hispanos en USA
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Llena tu agenda de proyectos.{" "}
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Cotizaciones reales.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Anuncios en Facebook, Google e Instagram que traen clientes con remodelaciones, pintura, drywall, pisos y
                techos. Cotizaciones serias, no curiosos. Directo a tu WhatsApp.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-yellow-400/10 px-5 py-3 backdrop-blur-sm">
                <span className="text-2xl">⚡</span>
                <p className="text-sm font-semibold sm:text-base">
                  Si en 30 días no tienes proyectos cotizados, el siguiente mes va por nuestra cuenta.
                </p>
              </div>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row">
                <a
                  href="https://wa.me/525622042820?text=Hola%2C%20soy%20contractor%20y%20quiero%20m%C3%A1s%20proyectos"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3.5 text-base font-bold text-white shadow-2xl shadow-amber-500/25 transition-all hover:-translate-y-0.5"
                >
                  Pedir auditoría gratis
                </a>
                <a
                  href="/usa#planes"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-bold backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Ver precios
                </a>
              </div>
              <p className="mt-3 text-sm text-white/40">14 días gratis · Setup incluido · Sin contrato anual</p>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-amber-400">
                  Lead que te llega al WhatsApp
                </p>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-amber-500/10 p-4">
                    <p className="font-semibold text-white">Maria & Tom Walker</p>
                    <p className="text-white/60">ZIP 77024 (Houston) · Master bath remodel</p>
                    <p className="mt-2 text-white/85">
                      &quot;Queremos remodelar el baño principal. Tile nuevo, vanidad doble, ducha walk-in. Budget $12-15k.
                      ¿Cuándo pueden ir a ver?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 8 minutos · vino de Facebook</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-4">
                    <p className="font-semibold text-white">Mr. Patel</p>
                    <p className="text-white/60">ZIP 77084 · Roof replacement</p>
                    <p className="mt-2 text-white/85">
                      &quot;Insurance approved my claim for a new roof after the storm. Need an estimate this week.&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 17 min · vino de Google</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-4">
                    <p className="font-semibold text-white">Daniela Sánchez</p>
                    <p className="text-white/60">ZIP 77036 · Pintura interior + drywall</p>
                    <p className="mt-2 text-white/85">
                      &quot;Necesito pintar 3 cuartos y reparar drywall del techo donde tuvimos leak. ¿Cuándo pueden venir?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 35 min · vino de Instagram</p>
                  </div>
                </div>
                <p className="mt-5 text-center text-xs text-white/40">
                  Ejemplo basado en clientes reales · Datos modificados por privacidad
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-amber-400">Servicios que llenamos</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Atraemos clientes para cada tipo de proyecto
              </h2>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {serviciosConstruccion.map((s) => (
                <div
                  key={s.nombre}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
                >
                  <span className="text-2xl">{s.icono}</span>
                  <span className="font-semibold text-white/90">{s.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-amber-400">Qué esperar</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que un contractor hispano típico ve con INDEXA
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  num: "10-25",
                  label: "Cotizaciones serias / mes",
                  detalle: "Filtramos curiosos: solo gente con proyecto real y presupuesto.",
                },
                {
                  num: "$30-80",
                  label: "Costo por lead",
                  detalle: "Más caro que en otras industrias pero ticket promedio mucho mayor.",
                },
                {
                  num: "$5-50k",
                  label: "Ticket promedio",
                  detalle: "Pintura $500-3k · Drywall $300-1.5k · Baño $8-15k · Cocina $15-50k.",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-sm"
                >
                  <p className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                    {m.num}
                  </p>
                  <p className="mt-2 text-base font-bold text-white">{m.label}</p>
                  <p className="mt-3 text-sm text-white/60">{m.detalle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-amber-400">Cobertura</p>
            <h2 className="mt-3 text-3xl font-extrabold">Contractors hispanos en estas ciudades</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {ciudadesConstruccion.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-amber-400">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que más nos preguntan los contractors
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqConstruccion.map((q) => (
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

            <div className="mt-14 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">¿Listo para cotizar más proyectos cada mes?</h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Auditoría gratis: te decimos cuántos proyectos está perdiendo tu negocio cada mes y cómo los recuperamos.
              </p>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20soy%20contractor%20y%20quiero%20la%20auditor%C3%ADa%20gratis"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-amber-500/25 transition-all hover:-translate-y-0.5"
              >
                Pedir auditoría gratis por WhatsApp
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
