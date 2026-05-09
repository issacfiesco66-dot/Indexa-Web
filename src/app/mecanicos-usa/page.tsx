import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildUsaHispanicServiceSchema, INDEXA_SITE_URL } from "@/lib/seoSchemas";

export const metadata: Metadata = {
  title: "Más clientes para tu taller mecánico en USA — INDEXA",
  description:
    "Llena tu taller mecánico de clientes hispanos en USA. Anuncios en español en Facebook, Google y TikTok, página web optimizada y leads directos a WhatsApp. Para Houston, Dallas, Miami, LA, Phoenix y todo USA. Garantía 30 días.",
  keywords: [
    "publicidad para taller mecánico USA",
    "marketing para mecánicos hispanos",
    "más clientes para mi taller mecánico",
    "anuncios mecánico Houston Dallas Miami",
    "google ads taller automotriz USA",
    "facebook ads para mecánicos",
  ],
  alternates: { canonical: "/mecanicos-usa" },
  openGraph: {
    title: "Llena tu taller mecánico de clientes — INDEXA USA",
    description:
      "Anuncios en español + página web + leads a WhatsApp para talleres mecánicos hispanos en USA. Garantía de resultados en 30 días.",
    url: `${INDEXA_SITE_URL}/mecanicos-usa`,
    locale: "es_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqMecanicos = [
  {
    pregunta: "Soy mecánico nuevo en USA, ¿me sirve INDEXA?",
    respuesta:
      "Sí. INDEXA es ideal para talleres nuevos porque construye tu presencia digital desde cero: Google Business Profile, página web profesional en español, perfil de Facebook e Instagram, y los primeros anuncios. En 30-60 días apareces cuando alguien busca 'mecánico cerca de mí' o 'taller en [tu ciudad]' en español o inglés.",
  },
  {
    pregunta: "¿Qué tipo de servicios atrae mejor con anuncios?",
    respuesta:
      "Los servicios con mejor retorno son: afinación, frenos, transmisión, aire acondicionado, diagnóstico computarizado y servicios pre-inspección estatal. También funcionan muy bien las campañas de 'check engine' y 'cambio de aceite' como puerta de entrada para clientes nuevos. Adaptamos los anuncios al servicio que más quieras llenar.",
  },
  {
    pregunta: "¿Cómo sé que los leads son reales y no perdidos de tiempo?",
    respuesta:
      "Cada lead llega con: nombre, número de teléfono, marca y modelo del carro y el problema o servicio que necesita. Filtramos por ZIP code para que solo te lleguen clientes de tu zona. Si un lead es claramente falso o spam, lo reportas y no cuenta — te lo reemplazamos.",
  },
  {
    pregunta: "¿Qué pasa con clientes que solo hablan inglés?",
    respuesta:
      "Por defecto los anuncios y la página están en español, pero si tu zona tiene mucho cliente bilingüe, hacemos campañas duales (español + inglés) con landing bilingüe. Tú decides el balance según tu base de clientes actuales.",
  },
  {
    pregunta: "¿Puedo competir contra cadenas grandes como Firestone o Pep Boys?",
    respuesta:
      "Sí, y de hecho ahí está la oportunidad. La comunidad hispana prefiere talleres independientes que hablan su idioma, dan trato familiar y precios honestos. Con INDEXA aparecemos en Google Maps con tus reseñas, mostramos tu trato cercano en los anuncios y compites por el cliente que las cadenas no entienden.",
  },
  {
    pregunta: "¿Cuánto debo invertir en anuncios además del fee mensual?",
    respuesta:
      "Recomendamos empezar con $300-500 USD/mes en presupuesto de anuncios (Facebook + Google). Eso normalmente trae 20-50 leads cualificados al mes en una zona con buena densidad hispana. El presupuesto va directo a Meta y Google, no a nosotros — tú lo controlas y lo subes cuando ya viste resultados.",
  },
];

const serviciosTaller = [
  { nombre: "Afinación / tune-up", icono: "🔧" },
  { nombre: "Frenos", icono: "🛑" },
  { nombre: "Transmisión", icono: "⚙️" },
  { nombre: "Aire acondicionado", icono: "❄️" },
  { nombre: "Diagnóstico computarizado", icono: "💻" },
  { nombre: "Cambio de aceite", icono: "🛢️" },
  { nombre: "Suspensión y dirección", icono: "🚗" },
  { nombre: "Hojalatería y pintura", icono: "🎨" },
  { nombre: "State inspection", icono: "✅" },
];

const ciudadesTaller = [
  "Houston",
  "Dallas",
  "San Antonio",
  "Austin",
  "Miami",
  "Orlando",
  "Tampa",
  "Los Ángeles",
  "Phoenix",
  "Las Vegas",
  "Chicago",
  "Atlanta",
];

export default function MecanicosUsaPage() {
  const serviceJsonLd = buildUsaHispanicServiceSchema({
    serviceTitle: "Publicidad y captación de clientes para talleres mecánicos hispanos en USA",
    serviceType: "Marketing digital y publicidad para talleres mecánicos automotrices",
    pagePath: "/mecanicos-usa",
    description:
      "INDEXA llena talleres mecánicos hispanos en USA con clientes locales. Campañas en Meta y Google, página web optimizada, Google Business Profile y leads directos a WhatsApp. Para mecánicos en Houston, Dallas, Miami, LA, Phoenix y toda Estados Unidos.",
    audienceType: "Talleres mecánicos automotrices hispanos en Estados Unidos",
    faq: faqMecanicos,
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
        name: "Mecánicos en USA",
        item: `${INDEXA_SITE_URL}/mecanicos-usa`,
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
                  "linear-gradient(rgba(255,102,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-orange-500/15 blur-[120px]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-32">
            <div>
              <Link
                href="/usa"
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indexa-orange hover:text-orange-300"
              >
                ← Negocios hispanos en USA
              </Link>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
                <span>🔧</span>
                Para talleres mecánicos hispanos en USA
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Llena tu taller de clientes.{" "}
                <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  En español. Garantizado.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Anuncios en Facebook, Instagram y Google que traen dueños de carros con problemas reales — afinación,
                frenos, transmisión, aire acondicionado — directo a tu WhatsApp. Sin perder llamadas, sin volantes en el
                parabrisas.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-indexa-orange/30 bg-gradient-to-r from-indexa-orange/10 to-amber-400/10 px-5 py-3 backdrop-blur-sm">
                <span className="text-2xl">⚡</span>
                <p className="text-sm font-semibold sm:text-base">
                  Si en 30 días no llenas la agenda, el siguiente mes va por nuestra cuenta.
                </p>
              </div>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row">
                <a
                  href="https://wa.me/525622042820?text=Hola%2C%20tengo%20un%20taller%20mec%C3%A1nico%20y%20quiero%20m%C3%A1s%20clientes"
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
                    <p className="font-semibold text-white">Carlos Méndez</p>
                    <p className="text-white/60">Honda Accord 2015 · ZIP 77036 (Houston)</p>
                    <p className="mt-2 text-white/85">
                      &quot;Buenas, mi carro está vibrando al frenar. ¿Cuánto me cobran por checar los frenos?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 2 minutos · vino de Facebook Ads</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="font-semibold text-white">María Hernández</p>
                    <p className="text-white/60">Toyota Camry 2018 · ZIP 77063</p>
                    <p className="mt-2 text-white/85">
                      &quot;Necesito state inspection y cambio de aceite. ¿A qué hora puedo pasar mañana?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 11 minutos · vino de Google</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="font-semibold text-white">José Ramírez</p>
                    <p className="text-white/60">Ford F-150 2012 · ZIP 77084</p>
                    <p className="mt-2 text-white/85">
                      &quot;Se prendió el check engine, ¿pueden hacer diagnóstico hoy?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 27 minutos · vino de Instagram</p>
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
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Servicios que llenamos</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Atraemos clientes para cada servicio de tu taller</h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/65">
                Tú nos dices qué servicio quieres llenar más esta temporada y armamos campañas específicas.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {serviciosTaller.map((s) => (
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
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Qué esperar</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que un taller hispano típico ve con INDEXA
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  num: "20-50",
                  label: "Leads al mes",
                  detalle: "Con $300-500 de presupuesto de anuncios en zona con buena densidad hispana.",
                },
                {
                  num: "$15-40",
                  label: "Costo por lead",
                  detalle: "Mucho más barato que volantes, magnets de carro o ads en revistas locales.",
                },
                {
                  num: "30-50%",
                  label: "Tasa de cierre",
                  detalle: "De los que llegan al WhatsApp y reciben buena atención, normalmente la mitad agenda.",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-sm"
                >
                  <p className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                    {m.num}
                  </p>
                  <p className="mt-2 text-base font-bold text-white">{m.label}</p>
                  <p className="mt-3 text-sm text-white/60">{m.detalle}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-white/40">
              Rangos basados en talleres clientes en Houston, Dallas, Miami y Phoenix. Resultados varían por zona,
              competencia local y presupuesto de anuncios.
            </p>
          </div>
        </section>

        {/* CIUDADES */}
        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Cobertura</p>
            <h2 className="mt-3 text-3xl font-extrabold">Talleres hispanos que ya trabajan con nosotros</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {ciudadesTaller.map((c) => (
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
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Lo que más nos preguntan los mecánicos</h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqMecanicos.map((q) => (
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

            <div className="mt-14 rounded-3xl border border-indexa-orange/30 bg-gradient-to-br from-indexa-orange/10 via-orange-500/5 to-amber-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">
                ¿Listo para tener tu taller lleno todos los días?
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Auditoría gratis: te decimos cuántos clientes está perdiendo tu taller cada mes y cómo los recuperamos
                con anuncios en español.
              </p>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20tengo%20un%20taller%20mec%C3%A1nico%20y%20quiero%20la%20auditor%C3%ADa%20gratis"
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
