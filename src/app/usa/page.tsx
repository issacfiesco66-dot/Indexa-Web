import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildUsaHispanicServiceSchema, INDEXA_SITE_URL } from "@/lib/seoSchemas";

export const metadata: Metadata = {
  title: "Más clientes para tu negocio hispano en USA — INDEXA",
  description:
    "INDEXA llena tu agenda de clientes en USA. Anuncios en Facebook, Google y TikTok hechos en español, página web que vende y WhatsApp con leads. Para mecánicos, landscaping, limpieza, restaurantes y todo negocio hispano. Garantía de resultados o no pagas el siguiente mes.",
  keywords: [
    "publicidad para negocios hispanos USA",
    "marketing para latinos en Estados Unidos",
    "anuncios en español USA",
    "más clientes para mi negocio Houston Miami Dallas",
    "agencia de marketing latino USA",
    "publicidad mecánico landscaping limpieza USA",
  ],
  alternates: { canonical: "/usa" },
  openGraph: {
    title: "Más clientes para tu negocio hispano en USA — INDEXA",
    description:
      "Anuncios en español, página web que vende y leads directos a tu WhatsApp. Para mecánicos, landscaping, limpieza, restaurantes y más negocios hispanos en USA.",
    url: `${INDEXA_SITE_URL}/usa`,
    locale: "es_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqUsa = [
  {
    pregunta: "¿Para qué tipo de negocios hispanos en USA funciona INDEXA?",
    respuesta:
      "Funciona para cualquier negocio hispano que necesite más clientes locales: mecánicos, landscaping, limpieza residencial y comercial, construcción, plomería, electricidad, restaurantes, food trucks, salones de belleza, barberías, dentistas, abogados de inmigración, fotógrafos, panaderías, fleteros y mudanzas. Si tu cliente está cerca y te puede llamar, INDEXA te lo trae.",
  },
  {
    pregunta: "¿En qué ciudades de Estados Unidos tienen clientes?",
    respuesta:
      "Trabajamos en toda USA, con especial enfoque en mercados con alta densidad hispana: Houston, Dallas, San Antonio, Austin, Miami, Orlando, Tampa, Los Ángeles, San Diego, Phoenix, Las Vegas, Denver, Chicago, Atlanta, Charlotte, Nueva York, Newark y New Jersey. Las campañas se segmentan por ZIP code y radio de servicio para que solo te llegue tráfico de tu zona.",
  },
  {
    pregunta: "¿Cuánto cuesta y cuándo veo resultados?",
    respuesta:
      "Los planes empiezan en $497 USD/mes. La mayoría de clientes ven sus primeros leads en WhatsApp en los primeros 7 días después de prender los anuncios. Si en 30 días no ves resultados claros, el siguiente mes va por nuestra cuenta. No firmas contrato anual.",
  },
  {
    pregunta: "¿Necesito tener página web o cuenta de Facebook ya hecha?",
    respuesta:
      "No. Nosotros te creamos la página web optimizada para vender (en español o bilingüe), conectamos tu Facebook, Instagram y Google Business, y configuramos WhatsApp Business para que los leads te lleguen directo. Si ya tienes algo, lo aprovechamos. Si no, lo armamos por ti en 48-72 horas.",
  },
  {
    pregunta: "¿Hablan español? ¿Y quién maneja mis anuncios?",
    respuesta:
      "Todo el equipo es hispano. Te atendemos por WhatsApp en español, los anuncios los redactamos en español (o bilingües según tu zona), y el reporte mensual lo recibes en video explicado en español. Tienes un asesor dedicado, no un bot.",
  },
  {
    pregunta: "¿Cómo me llegan los clientes?",
    respuesta:
      "Directo a tu WhatsApp. Cuando alguien hace clic en tu anuncio o llena el formulario de tu página, te llega una notificación con su nombre, teléfono, ZIP code y qué servicio busca. Tú contestas y cierras. Nosotros ponemos los leads — tú cierras la venta como ya sabes hacerlo.",
  },
  {
    pregunta: "¿Qué pasa si soy nuevo y aún no tengo reseñas?",
    respuesta:
      "Te ayudamos a montar tu Google Business Profile, pedir reseñas a clientes anteriores y crear pruebas sociales (videos cortos, antes/después). En 60-90 días tu negocio aparece en Google Maps cuando alguien busca 'mecánico cerca de mí' o 'landscaping en [tu ciudad]'.",
  },
];

const planesUsa = [
  {
    nombre: "Arranque",
    precio: "$497",
    sufijo: "/mes",
    descripcion: "Para empezar a recibir leads esta semana.",
    incluye: [
      "Página web profesional en español",
      "Google Business Profile optimizado",
      "1 campaña de anuncios en Meta (FB + Instagram)",
      "WhatsApp Business con leads automáticos",
      "Reporte mensual en video",
      "Soporte por WhatsApp en español",
    ],
    destacado: false,
    cta: "Empezar ahora",
  },
  {
    nombre: "Crecimiento",
    precio: "$997",
    sufijo: "/mes",
    descripcion: "Cuando ya quieres llenar la agenda.",
    incluye: [
      "Todo lo de Arranque",
      "Anuncios en Google Ads (búsqueda + Maps)",
      "Landing page por servicio (3 incluidas)",
      "Campañas en TikTok local",
      "Optimización semanal por especialista",
      "Asesor dedicado vía WhatsApp",
    ],
    destacado: true,
    cta: "Quiero crecer",
  },
  {
    nombre: "Dominio Local",
    precio: "$1,997",
    sufijo: "/mes",
    descripcion: "Para ser el #1 de tu zona.",
    incluye: [
      "Todo lo de Crecimiento",
      "SEO local en 5 ciudades/ZIPs",
      "Contenido en redes (4 reels + 8 posts/mes)",
      "Sistema de reseñas automatizado",
      "Email + SMS marketing",
      "Llamadas semanales de estrategia",
    ],
    destacado: false,
    cta: "Dominar mi zona",
  },
];

const verticales = [
  {
    titulo: "Mecánicos y talleres",
    desc: "Llena tu taller con servicios de afinación, frenos, transmisión y más.",
    href: "/mecanicos-usa",
    emoji: "🔧",
    accent: "from-orange-500 to-red-500",
  },
  {
    titulo: "Landscaping y jardinería",
    desc: "Contratos mensuales y trabajos grandes durante toda la temporada.",
    href: "/landscaping-usa",
    emoji: "🌿",
    accent: "from-green-500 to-emerald-500",
  },
  {
    titulo: "Limpieza residencial y comercial",
    desc: "Casas, oficinas y move-in/move-out. Clientes recurrentes.",
    href: "/limpieza-usa",
    emoji: "🧹",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    titulo: "Construcción y remodelación",
    desc: "Cotizaciones de remodelaciones, techos, pintura, drywall y pisos.",
    href: "/construccion-usa",
    emoji: "🏗️",
    accent: "from-amber-500 to-yellow-500",
  },
  {
    titulo: "Restaurantes y food trucks",
    desc: "Más reservas, pedidos por WhatsApp y catering corporativo.",
    href: "/usa#contacto",
    emoji: "🌮",
    accent: "from-rose-500 to-pink-500",
  },
  {
    titulo: "Plomeros y electricistas",
    desc: "Llamadas de emergencia y trabajos residenciales programados.",
    href: "/plomeros-usa",
    emoji: "🔌",
    accent: "from-indigo-500 to-violet-500",
  },
];

const ciudades = [
  "Houston",
  "Dallas",
  "San Antonio",
  "Austin",
  "Miami",
  "Orlando",
  "Tampa",
  "Los Ángeles",
  "San Diego",
  "Phoenix",
  "Las Vegas",
  "Denver",
  "Chicago",
  "Atlanta",
  "Charlotte",
  "New York",
  "Newark",
  "Nashville",
];

const pasos = [
  {
    n: "1",
    titulo: "Llamada de 15 min por WhatsApp",
    desc: "Nos cuentas de tu negocio, tu zona y tu cliente ideal. Decidimos juntos qué plan tiene sentido.",
  },
  {
    n: "2",
    titulo: "Configuramos todo en 48-72 horas",
    desc: "Página web, Google Business, Facebook, Instagram, WhatsApp Business y los primeros anuncios listos.",
  },
  {
    n: "3",
    titulo: "Llegan leads a tu WhatsApp",
    desc: "Cada cliente potencial te llega con nombre, teléfono y servicio que busca. Tú cierras la venta.",
  },
  {
    n: "4",
    titulo: "Reporte mensual en video",
    desc: "Cada mes recibes un video corto en español: cuántos leads entraron, cuánto costó cada uno y qué se viene.",
  },
];

export default function UsaPage() {
  const serviceJsonLd = buildUsaHispanicServiceSchema({
    serviceTitle: "Publicidad y captación de clientes para negocios hispanos en USA",
    serviceType: "Marketing digital y publicidad para pequeños negocios hispanos en Estados Unidos",
    pagePath: "/usa",
    description:
      "INDEXA es la plataforma de publicidad y captación de clientes para negocios hispanos en USA. Anuncios en Meta, Google y TikTok en español, página web que vende y leads directos a WhatsApp. Para mecánicos, landscaping, limpieza, restaurantes, construcción y todo dueño de negocio que quiera más ventas.",
    audienceType: "Negocios hispanos y latinos en Estados Unidos",
    faq: faqUsa,
  });

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "INDEXA",
        item: INDEXA_SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Publicidad para negocios hispanos en USA",
        item: `${INDEXA_SITE_URL}/usa`,
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
        <section className="relative min-h-[92vh] overflow-hidden">
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
          <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px]" />

          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
              <span className="text-base">🇺🇸</span>
              Especialistas en negocios hispanos en USA
            </div>

            <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Más clientes para tu negocio.{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                Hablamos tu idioma.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Anuncios en español en Facebook, Google y TikTok. Página web que convierte. Leads directos a tu WhatsApp.
              Para mecánicos, landscaping, limpieza, restaurantes y todo dueño de negocio hispano que quiera{" "}
              <span className="font-semibold text-white">llenar su agenda en 30 días</span>.
            </p>

            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-indexa-orange/30 bg-gradient-to-r from-indexa-orange/10 to-amber-400/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl">⚡</span>
              <p className="text-sm font-semibold sm:text-base">
                Garantía de resultados: si no ves leads en 30 días, el siguiente mes va por nuestra cuenta.
              </p>
            </div>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20vi%20Indexa%20y%20quiero%20m%C3%A1s%20clientes%20para%20mi%20negocio"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.825 9.825 0 0 0 1.595 5.36l-.999 3.648 3.893-1.707zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
                </svg>
                Hablar por WhatsApp ahora
              </a>
              <a
                href="#planes"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                Ver precios
              </a>
            </div>
            <p className="mt-3 text-sm text-white/40">Auditoría gratis · Sin contrato anual · Pagas mes a mes</p>

            <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-4">
              {[
                { value: "7 días", label: "Para tus primeros leads" },
                { value: "$15-40", label: "Costo promedio por lead" },
                { value: "100%", label: "En español" },
                { value: "30 días", label: "Garantía de resultados" },
              ].map((s) => (
                <div key={s.label} className="bg-[#0a0e27]/60 px-5 py-5 text-center">
                  <p className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-white/70 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DOLOR + PROMESA */}
        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">El problema</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                  Trabajas duro pero los clientes no llegan parejos.
                </h2>
                <ul className="mt-6 space-y-4 text-white/75">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-red-400">✗</span>
                    <span>Pagas por flyers, magnets de carro y volantes que casi nadie llama.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-red-400">✗</span>
                    <span>Dependes 100% del boca a boca y los meses lentos te matan.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-red-400">✗</span>
                    <span>Probaste un sobrino haciendo Facebook Ads y solo gastó dinero.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-red-400">✗</span>
                    <span>Las agencias gringas son caras, en inglés y no entienden tu cliente.</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">La solución</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                  Un equipo hispano que te trae clientes todos los días.
                </h2>
                <ul className="mt-6 space-y-4 text-white/85">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-400">✓</span>
                    <span>Anuncios en español hechos por gente que entiende a tu cliente.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-400">✓</span>
                    <span>Leads directos a tu WhatsApp con nombre, teléfono y servicio que buscan.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-400">✓</span>
                    <span>Reportes mensuales por video — sabes exactamente qué pagaste y qué ganaste.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-400">✓</span>
                    <span>Garantía: si no funciona en 30 días, no pagas el siguiente mes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* VERTICALES */}
        <section className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Por industria</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">
                Sabemos cómo conseguir clientes para tu industria
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/65">
                Cada negocio es distinto. Tenemos campañas y mensajes que ya funcionan en cada vertical.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {verticales.map((v) => (
                <Link
                  key={v.titulo}
                  href={v.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${v.accent} text-2xl shadow-lg`}
                  >
                    {v.emoji}
                  </div>
                  <h3 className="text-lg font-bold">{v.titulo}</h3>
                  <p className="mt-2 text-sm text-white/65">{v.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-indexa-orange">
                    Ver detalles →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="relative bg-[#070b1f] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Cómo funciona</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">De cero a leads en menos de una semana</h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {pasos.map((p) => (
                <div
                  key={p.n}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indexa-orange to-orange-500 text-xl font-extrabold shadow-lg">
                    {p.n}
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{p.titulo}</h3>
                  <p className="mt-2 text-sm text-white/65">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section id="planes" className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Planes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">Precios claros, sin sorpresas</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/65">
                Pagas mes a mes. Cancelas cuando quieras. Garantía de resultados en 30 días.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {planesUsa.map((plan) => (
                <div
                  key={plan.nombre}
                  className={`relative rounded-2xl border p-7 backdrop-blur-sm transition-all ${
                    plan.destacado
                      ? "border-indexa-orange/50 bg-gradient-to-b from-indexa-orange/10 to-white/[0.02] shadow-2xl shadow-indexa-orange/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {plan.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                      Más elegido
                    </div>
                  )}
                  <h3 className="text-xl font-extrabold">{plan.nombre}</h3>
                  <p className="mt-1 text-sm text-white/55">{plan.descripcion}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold">{plan.precio}</span>
                    <span className="text-white/55">{plan.sufijo}</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {plan.incluye.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-white/80">
                        <span className="mt-0.5 text-emerald-400">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://wa.me/525622042820"
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-7 block rounded-xl px-5 py-3 text-center text-sm font-bold transition-all ${
                      plan.destacado
                        ? "bg-gradient-to-r from-indexa-orange to-orange-500 text-white shadow-lg shadow-indexa-orange/25 hover:-translate-y-0.5"
                        : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-white/45">
              Todos los planes incluyen setup gratis · Configuración en 48-72 horas · Soporte en español
            </p>
          </div>
        </section>

        {/* CIUDADES */}
        <section className="relative bg-[#070b1f] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Cobertura</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Trabajamos con negocios hispanos en toda USA
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/60">
              Campañas segmentadas por ZIP code y radio de servicio. Estos son los mercados con más densidad hispana donde
              ya tenemos campañas activas:
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {ciudades.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-8 text-sm text-white/45">
              ¿No ves tu ciudad? Trabajamos en toda USA. Escríbenos por WhatsApp.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="contacto" className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Preguntas</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Lo que más nos preguntan</h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqUsa.map((q) => (
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
                ¿Listo para llenar tu agenda?
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Auditoría gratis de tu negocio. Te decimos cuántos clientes estás perdiendo y cómo los recuperamos.
                Llamada de 15 min por WhatsApp.
              </p>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20quiero%20una%20auditor%C3%ADa%20gratis%20para%20mi%20negocio"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                Pedir auditoría gratis
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
