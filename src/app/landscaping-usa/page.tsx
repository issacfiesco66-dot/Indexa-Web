import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildUsaHispanicServiceSchema, INDEXA_SITE_URL } from "@/lib/seoSchemas";

export const metadata: Metadata = {
  title: "Más clientes para tu negocio de landscaping en USA — INDEXA",
  description:
    "Llena tu agenda de landscaping de clientes hispanos y americanos en USA. Anuncios en Facebook, Google y TikTok que traen contratos mensuales y trabajos grandes. Para Houston, Dallas, Miami, LA, Phoenix y todo USA.",
  keywords: [
    "publicidad para landscaping USA",
    "marketing para landscapers hispanos",
    "más clientes para mi negocio de jardinería",
    "anuncios landscaping Houston Dallas Miami",
    "lawn care advertising hispanic",
    "facebook ads landscaping español",
  ],
  alternates: { canonical: "/landscaping-usa" },
  openGraph: {
    title: "Llena tu agenda de landscaping — INDEXA USA",
    description:
      "Contratos mensuales y trabajos grandes para landscapers hispanos en USA. Anuncios en español + WhatsApp leads. Garantía 30 días.",
    url: `${INDEXA_SITE_URL}/landscaping-usa`,
    locale: "es_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqLandscaping = [
  {
    pregunta: "¿Funciona INDEXA para negocios de landscaping pequeños (1-3 personas)?",
    respuesta:
      "Sí. La mayoría de nuestros clientes de landscaping empezaron con 1-2 personas y un truck. INDEXA es ideal porque no necesitas equipo de ventas: los leads llegan directo a tu WhatsApp con la dirección, ZIP y servicio que buscan, y tú vas a cotizar. Crece a tu ritmo.",
  },
  {
    pregunta: "¿Qué tipo de clientes atrae INDEXA — residenciales o comerciales?",
    respuesta:
      "Ambos. Residencial (mantenimiento mensual de yarda, mulch, sod, podar árboles, drenaje) y comercial (HOA, oficinas, propiedades comerciales, apartments). Tú nos dices qué tipo prefieres y segmentamos las campañas — los anuncios para HOA son distintos a los de mantenimiento residencial.",
  },
  {
    pregunta: "Trabajamos por temporadas, ¿conviene pausar en invierno?",
    respuesta:
      "No. En invierno cambiamos la estrategia: pre-venta de contratos para primavera, leaf removal, limpieza de drenajes, instalación de luces de Navidad, snow removal en zonas frías. Los meses 'lentos' son los mejores para llenar tu agenda de marzo-mayo. Los clientes que firman en enero-febrero son los más leales.",
  },
  {
    pregunta: "¿Qué presupuesto de anuncios necesito?",
    respuesta:
      "Recomendamos $250-500/mes en presupuesto de anuncios para empezar (Facebook + Google). Eso normalmente trae 15-40 cotizaciones al mes. El landscaping tiene tickets altos ($60-200/visita en residencial, $500-5000 en proyectos), así que con 2-3 cierres ya pagaste el plan + los anuncios + ganancia.",
  },
  {
    pregunta: "¿Cómo se diferencia INDEXA de Thumbtack, Angi o Yelp?",
    respuesta:
      "Thumbtack y Angi te cobran por cada lead $15-50 USD aunque sea basura, y compites con 5-10 landscapers más por el mismo cliente. Con INDEXA los leads son exclusivos tuyos, vienen de búsquedas y anuncios donde solo apareces tú, y construyes tu propia marca y reseñas en Google. A 6 meses, el cliente vuelve a ti, no a la plataforma.",
  },
  {
    pregunta: "¿Necesito hablar inglés para atender los leads?",
    respuesta:
      "No es obligatorio. Las campañas se pueden hacer 100% en español si tu cliente ideal es la comunidad hispana. Si quieres también atender clientes americanos en zonas premium (mejores tickets), hacemos campañas duales y la página web bilingüe. Tú decides hasta dónde llegar.",
  },
];

const serviciosLandscaping = [
  { nombre: "Mantenimiento mensual de yarda", icono: "🌱" },
  { nombre: "Mulch e instalación", icono: "🪵" },
  { nombre: "Sod / pasto nuevo", icono: "🟩" },
  { nombre: "Poda de árboles", icono: "🌳" },
  { nombre: "Limpieza de drenajes", icono: "💧" },
  { nombre: "Diseño de jardines", icono: "🌷" },
  { nombre: "Sprinklers / riego", icono: "💦" },
  { nombre: "Leaf removal", icono: "🍂" },
  { nombre: "Sistemas de iluminación", icono: "💡" },
];

const ciudadesLandscaping = [
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
  "Los Ángeles",
];

export default function LandscapingUsaPage() {
  const serviceJsonLd = buildUsaHispanicServiceSchema({
    serviceTitle: "Publicidad y captación de clientes para negocios de landscaping hispanos en USA",
    serviceType: "Marketing digital y publicidad para empresas de landscaping y mantenimiento de jardines",
    pagePath: "/landscaping-usa",
    description:
      "INDEXA llena agendas de landscaping con clientes residenciales y comerciales en USA. Campañas en Meta y Google, página web optimizada y leads directos a WhatsApp. Para landscapers en Houston, Dallas, Miami, Atlanta, Phoenix y todo Estados Unidos.",
    audienceType: "Negocios de landscaping y jardinería hispanos en Estados Unidos",
    faq: faqLandscaping,
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
        name: "Landscaping en USA",
        item: `${INDEXA_SITE_URL}/landscaping-usa`,
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
        {/* HERO */}
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

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-32">
            <div>
              <Link
                href="/usa"
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indexa-orange hover:text-orange-300"
              >
                ← Negocios hispanos en USA
              </Link>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
                <span>🌿</span>
                Para landscapers y jardineros hispanos en USA
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Llena tu agenda de landscaping.{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300 bg-clip-text text-transparent">
                  Toda la temporada.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Anuncios en Facebook, Instagram y Google que traen clientes residenciales y comerciales con yardas
                grandes, contratos mensuales y proyectos de mulch, sod, sprinklers y diseño. Directo a tu WhatsApp.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-green-400/10 px-5 py-3 backdrop-blur-sm">
                <span className="text-2xl">⚡</span>
                <p className="text-sm font-semibold sm:text-base">
                  Si en 30 días no llenas la agenda, el siguiente mes va por nuestra cuenta.
                </p>
              </div>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row">
                <a
                  href="https://wa.me/525622042820?text=Hola%2C%20tengo%20un%20negocio%20de%20landscaping%20y%20quiero%20m%C3%A1s%20clientes"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-7 py-3.5 text-base font-bold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
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
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Lead que te llega al WhatsApp
                </p>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="font-semibold text-white">Patricia López</p>
                    <p className="text-white/60">ZIP 77024 (Houston) · Casa 4500 sqft</p>
                    <p className="mt-2 text-white/85">
                      &quot;Quiero servicio mensual y plantar pasto nuevo en el front yard. ¿Cuándo pueden venir a
                      cotizar?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 5 minutos · vino de Facebook</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="font-semibold text-white">HOA Cypress Pointe</p>
                    <p className="text-white/60">ZIP 77433 · Comercial · 12 propiedades</p>
                    <p className="mt-2 text-white/85">
                      &quot;Buscamos contrato mensual de mantenimiento para 12 propiedades. Necesitamos cotización para
                      board meeting.&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 18 min · vino de Google</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="font-semibold text-white">Roberto García</p>
                    <p className="text-white/60">ZIP 77084 · Backyard remodel</p>
                    <p className="mt-2 text-white/85">
                      &quot;Quiero rediseñar mi backyard con sod nuevo, mulch y un par de árboles. Presupuesto $3-4k.&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 42 min · vino de Instagram</p>
                  </div>
                </div>
                <p className="mt-5 text-center text-xs text-white/40">
                  Ejemplo basado en clientes reales · Datos modificados por privacidad
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Servicios que llenamos</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Atraemos clientes para cada servicio que ofreces
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/65">
                Tú nos dices qué quieres llenar — mantenimiento mensual, proyectos grandes o cuentas comerciales — y
                armamos campañas específicas.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {serviciosLandscaping.map((s) => (
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

        {/* RESULTADO ESPERADO */}
        <section className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Qué esperar</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que un landscaper hispano típico ve con INDEXA
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  num: "15-40",
                  label: "Cotizaciones al mes",
                  detalle: "Mezcla de mantenimiento residencial, proyectos grandes y cuentas comerciales.",
                },
                {
                  num: "$25-60",
                  label: "Costo por lead",
                  detalle: "Comparado con $40-80/lead en Thumbtack o Angi y compitiendo con 10 más.",
                },
                {
                  num: "$3-15k",
                  label: "Ticket promedio",
                  detalle: "Proyectos de sod, mulch, sprinklers y diseño cierran arriba de $3k.",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-sm"
                >
                  <p className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                    {m.num}
                  </p>
                  <p className="mt-2 text-base font-bold text-white">{m.label}</p>
                  <p className="mt-3 text-sm text-white/60">{m.detalle}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
              Rangos basados en landscapers clientes en Houston, Dallas, Atlanta y Miami. Resultados varían por zona y
              presupuesto.
            </p>
          </div>
        </section>

        {/* CIUDADES */}
        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Cobertura</p>
            <h2 className="mt-3 text-3xl font-extrabold">Landscapers hispanos que ya trabajan con nosotros</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {ciudadesLandscaping.map((c) => (
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

        {/* FAQ */}
        <section className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Lo que más nos preguntan los landscapers</h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqLandscaping.map((q) => (
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
              <h3 className="text-2xl font-extrabold sm:text-3xl">¿Listo para llenar tu agenda toda la temporada?</h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Auditoría gratis: te decimos cuántos contratos está perdiendo tu negocio cada mes y cómo los recuperamos
                con anuncios en español.
              </p>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20tengo%20un%20negocio%20de%20landscaping%20y%20quiero%20la%20auditor%C3%ADa%20gratis"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
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
