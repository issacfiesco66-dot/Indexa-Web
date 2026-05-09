import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildUsaHispanicServiceSchema, INDEXA_SITE_URL } from "@/lib/seoSchemas";

export const metadata: Metadata = {
  title: "Más clientes para tu negocio de plomería en USA — INDEXA",
  description:
    "Llamadas de emergencia y trabajos residenciales para plomeros y electricistas hispanos en USA. Anuncios en español y Google que aparecen cuando alguien necesita ayuda urgente. Garantía 30 días.",
  keywords: [
    "publicidad para plomero hispano USA",
    "marketing para plumber latino",
    "más clientes para mi negocio de plomería",
    "anuncios plomero electricista USA",
    "plumber advertising hispanic spanish",
    "google ads plomería español",
  ],
  alternates: { canonical: "/plomeros-usa" },
  openGraph: {
    title: "Llena tu agenda de trabajos de plomería — INDEXA USA",
    description:
      "Llamadas de emergencia y trabajos residenciales para plomeros hispanos en USA. Anuncios en Google + leads a WhatsApp 24/7.",
    url: `${INDEXA_SITE_URL}/plomeros-usa`,
    locale: "es_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqPlomeros = [
  {
    pregunta: "¿Funciona INDEXA para plomeros que trabajan solos o en equipo pequeño?",
    respuesta:
      "Sí — es ideal. Plomería tiene demanda urgente: cuando algo se rompe, la gente busca en Google AHORA. Con INDEXA apareces en los primeros resultados con anuncios + Google Maps. Los leads llegan a tu WhatsApp en segundos. Mucho más efectivo que poner un letrero o esperar referidos.",
  },
  {
    pregunta: "¿Qué tipo de trabajos atrae INDEXA — emergencias o programados?",
    respuesta:
      "Ambos. Emergencias (fuga de agua, drenaje tapado, water heater no funciona) tienen alto costo por lead pero ticket muy alto y conversión casi 100%. Trabajos programados (instalar grifería, remodelación de baño, reparaciones menores) son más baratos de captar y se agendan mejor. Mezclamos según tu capacidad.",
  },
  {
    pregunta: "¿Necesito licencia y seguro para anunciarme?",
    respuesta:
      "Sí en plomería casi todos los estados requieren licencia para trabajo residencial mayor. Si tienes Master Plumber license, lo destacamos en anuncios y página (genera mucha confianza). Si trabajas como helper o en sub-contratos, enfocamos campañas en handyman/repair menor que no requiere licencia. Lo aclaramos en la primera llamada.",
  },
  {
    pregunta: "¿Cómo aparezco cuando alguien busca 'plomero cerca de mí'?",
    respuesta:
      "Tres frentes: (1) Google Business Profile optimizado para que aparezcas en Maps, (2) Google Ads con keywords como 'plomero 24 horas', 'fuga de agua urgente', 'drenaje tapado en [zip]', y (3) SEO local de la página web por servicio + ciudad. En 30-60 días sales en top 3 de Maps en tu zona.",
  },
  {
    pregunta: "¿Qué presupuesto de Google Ads necesito?",
    respuesta:
      "$400-700/mes en Google Ads para empezar. Plomería es competitiva (clicks de $5-12 cada uno) pero el ROI es altísimo: una llamada de emergencia de water heater ($800-1500) cubre 1-2 meses de ads. La mayoría de nuestros plomeros recuperan el budget en la primera semana.",
  },
  {
    pregunta: "¿Y si no quiero ir a emergencias en la madrugada?",
    respuesta:
      "Configuramos los anuncios para que solo se muestren en tus horas de trabajo. También podemos enfocar en trabajos programados (instalación, remodelación, reparaciones no urgentes) que son menos estresantes y se agendan con tiempo. Tú decides el tipo de trabajo y nosotros segmentamos.",
  },
];

const serviciosPlomeros = [
  { nombre: "Drenajes / desazolves", icono: "🚰" },
  { nombre: "Water heater / boilers", icono: "♨️" },
  { nombre: "Reparación de fugas", icono: "💧" },
  { nombre: "Instalación de grifería", icono: "🚿" },
  { nombre: "Toilet & sink install", icono: "🚽" },
  { nombre: "Plomería de remodelación", icono: "🔧" },
  { nombre: "Detección de fugas", icono: "🔍" },
  { nombre: "Servicio 24/7 emergencias", icono: "🚨" },
  { nombre: "Plomería comercial", icono: "🏢" },
];

const ciudadesPlomeros = [
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

export default function PlomerosUsaPage() {
  const serviceJsonLd = buildUsaHispanicServiceSchema({
    serviceTitle: "Publicidad y captación de clientes para plomeros hispanos en USA",
    serviceType: "Marketing digital y publicidad para plomería residencial y comercial",
    pagePath: "/plomeros-usa",
    description:
      "INDEXA llena agendas de plomeros hispanos con llamadas de emergencia y trabajos residenciales en USA. Google Ads optimizados, Google Business Profile y leads directos a WhatsApp 24/7.",
    audienceType: "Plomeros y plumbing services hispanos en Estados Unidos",
    faq: faqPlomeros,
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
        name: "Plomeros en USA",
        item: `${INDEXA_SITE_URL}/plomeros-usa`,
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
                  "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[120px]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-32">
            <div>
              <Link
                href="/usa"
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indexa-orange hover:text-orange-300"
              >
                ← Negocios hispanos en USA
              </Link>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
                <span>🔌</span>
                Para plomeros hispanos en USA
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Llamadas de emergencia.{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-300 bg-clip-text text-transparent">
                  Cuando se rompe, te llaman a ti.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Apareces en Google y Maps cuando alguien busca &quot;plomero cerca de mí&quot;, &quot;fuga de agua urgente&quot;
                o &quot;water heater roto&quot;. Anuncios en español e inglés. Leads directos a tu WhatsApp.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-violet-400/10 px-5 py-3 backdrop-blur-sm">
                <span className="text-2xl">⚡</span>
                <p className="text-sm font-semibold sm:text-base">
                  Si en 30 días no te llegan llamadas, el siguiente mes va por nuestra cuenta.
                </p>
              </div>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row">
                <a
                  href="https://wa.me/525622042820?text=Hola%2C%20soy%20plomero%20y%20quiero%20m%C3%A1s%20clientes"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3.5 text-base font-bold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
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
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Lead que te llega al WhatsApp
                </p>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-indigo-500/10 p-4">
                    <p className="font-semibold text-white">🚨 Jennifer Romero</p>
                    <p className="text-white/60">ZIP 77036 (Houston) · EMERGENCIA</p>
                    <p className="mt-2 text-white/85">
                      &quot;Tengo agua saliendo del techo del baño. Help! ¿Pueden venir hoy?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 1 minuto · vino de Google &quot;plomero urgente&quot;</p>
                  </div>
                  <div className="rounded-xl bg-indigo-500/10 p-4">
                    <p className="font-semibold text-white">Robert Chen</p>
                    <p className="text-white/60">ZIP 77024 · Water heater installation</p>
                    <p className="mt-2 text-white/85">
                      &quot;My water heater is dead. Need replacement. 50-gal gas. What's your price?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 14 min · vino de Google Maps</p>
                  </div>
                  <div className="rounded-xl bg-indigo-500/10 p-4">
                    <p className="font-semibold text-white">Carlos Méndez</p>
                    <p className="text-white/60">ZIP 77084 · Drenaje tapado</p>
                    <p className="mt-2 text-white/85">
                      &quot;Se tapó el drenaje de la cocina, ya probé Drano y nada. ¿Cuánto cobran por destaparlo?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 28 min · vino de Facebook</p>
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
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-400">Servicios que llenamos</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Atraemos clientes para cada tipo de trabajo de plomería
              </h2>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {serviciosPlomeros.map((s) => (
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
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-400">Qué esperar</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que un plomero hispano típico ve con INDEXA
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  num: "20-50",
                  label: "Llamadas / mes",
                  detalle: "Mezcla de emergencias urgentes y trabajos programados según tu capacidad.",
                },
                {
                  num: "$25-60",
                  label: "Costo por lead",
                  detalle: "Más caro en Google Ads pero ticket promedio mucho mayor compensa fácil.",
                },
                {
                  num: "$200-2k",
                  label: "Ticket promedio",
                  detalle: "Drenaje $200-400 · Water heater $800-1500 · Remodelación baño $2-5k.",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-sm"
                >
                  <p className="bg-gradient-to-r from-indigo-400 to-blue-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
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
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-400">Cobertura</p>
            <h2 className="mt-3 text-3xl font-extrabold">Plomeros hispanos en estas ciudades</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {ciudadesPlomeros.map((c) => (
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
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-400">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que más nos preguntan los plomeros
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqPlomeros.map((q) => (
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

            <div className="mt-14 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-blue-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">¿Listo para que te llamen cuando se rompe algo?</h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Auditoría gratis: te decimos cuántas llamadas está perdiendo tu negocio cada mes y cómo las recuperamos.
              </p>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20soy%20plomero%20y%20quiero%20la%20auditor%C3%ADa%20gratis"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
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
