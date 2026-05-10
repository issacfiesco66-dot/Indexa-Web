import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildAgenciaPageGraph, SITE_URL } from "@/lib/agenciaSeoSchemas";

const PAGE_PATH = "/agencia-de-publicidad";

export const metadata: Metadata = {
  title: "Agencia de Publicidad en México | INDEXA — Anuncios que Sí Venden",
  description:
    "INDEXA es la agencia de publicidad para PYMES en México: Google Ads, Meta Ads, TikTok Ads y publicidad digital con IA. Sin contratos, leads directos a WhatsApp, desde $299 MXN/mes.",
  keywords: [
    "agencia de publicidad",
    "agencia publicidad",
    "agencia de publicidad México",
    "agencia de publicidad y marketing",
    "agencia de publicidad digital",
    "agencia de publicidad cerca de mi",
    "empresas de publicidad",
    "agencia publicidad cdmx",
    "mejor agencia de publicidad México",
    "agencia de anuncios",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Agencia de Publicidad en México — INDEXA",
    description:
      "Google Ads, Meta Ads, TikTok Ads y publicidad digital con IA. Leads directos a WhatsApp desde $299 MXN/mes.",
    url: `${SITE_URL}${PAGE_PATH}`,
    locale: "es_MX",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faq = [
  {
    pregunta: "¿Qué hace una agencia de publicidad?",
    respuesta:
      "Una agencia de publicidad diseña, ejecuta y optimiza campañas de anuncios para que un negocio gane más clientes. Las áreas típicas son: publicidad pagada en Google (Search, Maps y Display), publicidad en Meta (Facebook e Instagram), TikTok Ads, YouTube Ads, publicidad programática, diseño creativo de anuncios, copywriting persuasivo y reportes de resultados. INDEXA es una agencia de publicidad con IA especializada en PYMES de México: combina los frentes anteriores en una plataforma con planes desde $299 MXN/mes y leads directos a WhatsApp.",
  },
  {
    pregunta: "¿Cuánto cobra una agencia de publicidad en México?",
    respuesta:
      "El costo se divide en dos partes: el fee de la agencia y el presupuesto de anuncios. Fee típico de agencia: $5,000–$50,000 MXN/mes según tamaño. Presupuesto recomendado de anuncios: $3,000–$20,000 MXN/mes para PYMES. INDEXA cobra fee desde $299 MXN/mes (incluye plataforma + setup + optimización con IA) y el presupuesto de anuncios va directo a Meta o Google — tú lo controlas. Total mensual realista para una PYME: $5,000–$15,000 MXN/mes incluyendo INDEXA + presupuesto de ads.",
  },
  {
    pregunta: "¿En qué plataformas hace publicidad INDEXA?",
    respuesta:
      "INDEXA opera publicidad en las principales plataformas digitales: Google Ads (búsqueda, Maps, Display y YouTube), Meta Ads (Facebook e Instagram), TikTok Ads para alcance joven, y publicidad en WhatsApp Business para retargeting. Los planes Profesional y Enterprise también incluyen automatizaciones cross-platform: el mismo prospecto que clickeó tu anuncio de Facebook recibe un email, un SMS y aparece en tus retargeting lists de Google.",
  },
  {
    pregunta: "¿Cuánto tarda en dar resultados la publicidad digital?",
    respuesta:
      "Los anuncios pagados son la forma más rápida de generar clientes: típicamente verás los primeros leads en 7–14 días después de lanzar campañas. La publicidad de Meta (Facebook + Instagram) suele dar tracción en 5–10 días con $200–500 MXN/día de presupuesto. Google Ads de búsqueda local da resultados en 3–7 días para queries con alta intención (ej. 'plomero urgente CDMX'). El primer mes es de aprendizaje del algoritmo; del segundo mes en adelante el costo por lead baja 30–50%.",
  },
  {
    pregunta: "¿Qué presupuesto de publicidad necesita un negocio pequeño?",
    respuesta:
      "Para una PYME local que arranca recomendamos empezar con $200–500 MXN/día (entre $6,000–$15,000 MXN/mes) repartidos entre Meta Ads y Google. Con ese presupuesto un negocio típico recibe 30–80 leads cualificados al mes en una zona urbana de México. Si tu ticket promedio es alto ($5,000+ por venta), conviene subir el presupuesto a $1,000–2,000 MXN/día para escalar más rápido. Negocios con tickets bajos ($100–500) pueden empezar con $100 MXN/día.",
  },
  {
    pregunta: "¿INDEXA hace creatividades (imágenes y videos) para los anuncios?",
    respuesta:
      "Sí. La IA de INDEXA genera variantes de creatividades a partir de tu información y fotos: copies en español, banners en formatos de Meta y Google, ad copy A/B y videos cortos para TikTok/Reels. En el plan Profesional incluye 4 reels y 8 posts al mes; en Enterprise incluye creatividades ilimitadas. Si ya tienes tu propio diseñador, INDEXA acepta tus archivos y los carga directo a las campañas.",
  },
  {
    pregunta: "¿Es mejor publicidad en Google o en Facebook?",
    respuesta:
      "Depende del comportamiento de tu cliente. Google Ads funciona mejor cuando la gente ya sabe que necesita tu servicio y lo busca activamente (ej. 'plomero urgente', 'dentista cerca'). Meta Ads (Facebook/Instagram) funciona mejor para crear demanda donde no la había, mostrar productos visuales y atacar audiencias por intereses (ej. restaurantes, ecommerce, salones). Para la mayoría de PYMES en México el mix óptimo es 60% Meta + 40% Google. INDEXA recomienda y ajusta el mix automáticamente según tu industria.",
  },
  {
    pregunta: "¿Cuál es la diferencia entre agencia de publicidad y agencia de marketing digital?",
    respuesta:
      "Una agencia de publicidad se enfoca en anuncios pagados (PPC) — pagas por clic o impresión y los resultados son inmediatos. Una agencia de marketing digital es más amplia: incluye publicidad pagada + SEO orgánico + redes sociales + email marketing + sitios web + estrategia. INDEXA es una agencia de marketing digital completa pero también funciona como agencia de publicidad pura si solo quieres campañas pagadas — se ajusta a lo que tu negocio necesita en cada momento.",
  },
  {
    pregunta: "¿Trabajan con publicidad para mi industria específica?",
    respuesta:
      "Sí. INDEXA tiene plantillas de campañas pre-optimizadas y casos comprobados en: restaurantes, dentistas y consultorios médicos, talleres mecánicos, abogados, contadores, ecommerce, salones de belleza, gimnasios, inmobiliarias, escuelas, agencias de viajes y servicios para el hogar (plomeros, electricistas, cleaning). Si tu industria no aparece, igual funciona — la IA aprende de tu cuenta y optimiza desde la primera semana.",
  },
  {
    pregunta: "¿Manejan publicidad para empresas en CDMX, Guadalajara y Monterrey?",
    respuesta:
      "Sí, atendemos toda México y especialmente CDMX, Guadalajara, Monterrey, Puebla, Querétaro, Tijuana, Mérida, León y otras ciudades principales. Cada campaña se segmenta por código postal y radio (ej. 'mecánicos en Roma Norte CDMX' o 'restaurantes en Providencia GDL'). El servicio es 100% online con soporte por WhatsApp en español, así que no importa dónde esté tu negocio: las campañas se afinan para tu zona específica.",
  },
];

const servicios = [
  {
    titulo: "Google Ads (Search + Maps)",
    desc: "Aparece arriba cuando alguien busca tu servicio en Google. Pagas solo por clic.",
    href: "/agencia-google-ads",
    emoji: "🎯",
  },
  {
    titulo: "Meta Ads (FB + IG)",
    desc: "Anuncios en Facebook e Instagram segmentados por edad, ZIP e intereses.",
    href: "/servicios/marketing-automatizado",
    emoji: "📱",
  },
  {
    titulo: "TikTok Ads",
    desc: "Captura el público joven con creatividades nativas que no parecen anuncios.",
    href: "/servicios/marketing-automatizado",
    emoji: "🎬",
  },
  {
    titulo: "Display + Retargeting",
    desc: "Persigue a quien visitó tu web y no compró. Banners en YouTube y la red Display.",
    href: "/servicios/marketing-automatizado",
    emoji: "🔁",
  },
  {
    titulo: "Creatividades con IA",
    desc: "Banners, copies y videos generados a tu marca. Variantes A/B automáticas.",
    href: "/servicios/sitios-web-ia",
    emoji: "🎨",
  },
  {
    titulo: "Reportes en tiempo real",
    desc: "Dashboard con costo por lead, CTR, conversión y ROAS. Sin Excel.",
    href: "/servicios/analiticas-tiempo-real",
    emoji: "📊",
  },
];

const ciudades = [
  { nombre: "CDMX", href: "/pagina-web-cdmx" },
  { nombre: "Guadalajara", href: "/pagina-web-guadalajara" },
  { nombre: "Monterrey", href: "/pagina-web-monterrey" },
  { nombre: "Puebla", href: "/pagina-web-puebla" },
  { nombre: "Querétaro", href: "/pagina-web-queretaro" },
  { nombre: "Tijuana", href: "/pagina-web-tijuana" },
  { nombre: "Mérida", href: "/pagina-web-merida" },
  { nombre: "León", href: "/pagina-web-leon" },
];

export default function AgenciaPublicidadPage() {
  const graph = buildAgenciaPageGraph({
    name: "Agencia de Publicidad en México — INDEXA",
    serviceType: "Publicidad pagada en Google Ads, Meta Ads, TikTok y plataformas digitales",
    pagePath: PAGE_PATH,
    description:
      "INDEXA es la agencia de publicidad con IA para PYMES en México. Google Ads, Meta Ads, TikTok Ads y publicidad programática desde $299 MXN/mes con leads directos a WhatsApp.",
    audienceType: "PYMES, emprendedores y negocios locales en México que necesitan publicidad pagada",
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
          <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-indexa-orange/20 blur-[120px]" />

          <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 text-center lg:pt-32">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
              <span>🎯</span>
              Agencia de publicidad con IA · Para PYMES en México
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Agencia de publicidad{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                que sí trae llamadas
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Google Ads, Meta Ads, TikTok Ads y publicidad digital optimizada por IA. Leads directos a tu WhatsApp.
              Desde <span className="font-semibold text-white">$299 MXN al mes</span>, sin contratos anuales.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Ver servicios
              </a>
            </div>
            <p className="mt-3 text-sm text-white/40">14 días gratis · Sin tarjeta · Cancela cuando quieras</p>
          </div>
        </section>

        {/* QUÉ ES — AI citable */}
        <section className="relative bg-[#070b1f] py-20" id="que-es">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Qué es</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">¿Qué hace una agencia de publicidad?</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Una <strong>agencia de publicidad</strong> diseña, ejecuta y optimiza campañas de anuncios para que un
              negocio gane más clientes. Las áreas típicas son: publicidad pagada en Google (Search, Maps y Display),
              publicidad en Meta (Facebook e Instagram), TikTok Ads, YouTube Ads, diseño creativo, copywriting
              persuasivo y reportes de resultados.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              <strong>INDEXA</strong> es una agencia de publicidad con IA para PYMES en México que combina los frentes
              anteriores en una sola plataforma. Pagás desde <strong>$299 MXN/mes</strong> y los leads llegan directo a
              tu WhatsApp con nombre y servicio que buscan — sin emails fríos, sin reuniones de 1 hora, sin contratos
              anuales.
            </p>
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Plataformas</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">Anunciamos donde está tu cliente</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/65">
                Multi-plataforma cross-channel optimizada por IA. La misma audiencia te ve en Google, Facebook,
                Instagram y TikTok hasta que decide comprar.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicios.map((s) => (
                <Link
                  key={s.titulo}
                  href={s.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="mb-4 text-3xl">{s.emoji}</div>
                  <h3 className="text-lg font-bold">{s.titulo}</h3>
                  <p className="mt-2 text-sm text-white/65">{s.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-indexa-orange">Ver más →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PRESUPUESTO */}
        <section className="relative bg-[#070b1f] py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Presupuesto</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                ¿Cuánto presupuesto necesito para anuncios?
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                {
                  rango: "$100-300 MXN/día",
                  perfil: "Negocio que arranca",
                  resultado: "10-25 leads/mes",
                },
                {
                  rango: "$300-700 MXN/día",
                  perfil: "PYME en crecimiento",
                  resultado: "30-80 leads/mes",
                },
                {
                  rango: "$700-2,000 MXN/día",
                  perfil: "Negocio establecido escalando",
                  resultado: "100-300 leads/mes",
                },
              ].map((p) => (
                <div
                  key={p.rango}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
                >
                  <p className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-2xl font-extrabold text-transparent">
                    {p.rango}
                  </p>
                  <p className="mt-3 text-sm font-bold text-white">{p.perfil}</p>
                  <p className="mt-2 text-sm text-white/60">{p.resultado}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-white/45">
              Estimaciones basadas en zonas urbanas de México con demanda local moderada-alta. El presupuesto va directo
              a Google y Meta — tú lo controlas y lo ajustas cuando ya viste tracción.
            </p>
          </div>
        </section>

        {/* CIUDADES */}
        <section className="relative bg-[#050816] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Cobertura</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Publicidad digital en toda México</h2>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ciudades.map((c) => (
                <Link
                  key={c.nombre}
                  href={c.href}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-white/85 transition-all hover:border-indexa-orange/40 hover:bg-white/10"
                >
                  {c.nombre}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative bg-[#070b1f] py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que más nos preguntan sobre publicidad digital
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

            <div className="mt-14 rounded-3xl border border-indexa-orange/30 bg-gradient-to-br from-indexa-orange/10 via-orange-500/5 to-amber-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">¿Listo para que la publicidad sí te traiga clientes?</h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Activamos tus campañas de Google y Meta en menos de 24 horas. Pagas mes a mes y cancelas cuando quieras.
              </p>
              <a
                href="/registro"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5"
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
