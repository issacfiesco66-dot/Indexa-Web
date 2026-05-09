import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildUsaHispanicServiceSchema, INDEXA_SITE_URL } from "@/lib/seoSchemas";

export const metadata: Metadata = {
  title: "Más clientes para tu negocio de limpieza en USA — INDEXA",
  description:
    "Llena tu agenda de limpieza residencial y comercial en USA con clientes recurrentes. Anuncios en español, página web optimizada y leads directos a WhatsApp. Para Houston, Dallas, Miami, LA, Phoenix y todo USA. Garantía 30 días.",
  keywords: [
    "publicidad para limpieza USA",
    "marketing para cleaning service hispano",
    "más clientes para mi negocio de limpieza",
    "anuncios cleaning Houston Dallas Miami",
    "house cleaning advertising hispanic",
    "facebook ads limpieza español",
  ],
  alternates: { canonical: "/limpieza-usa" },
  openGraph: {
    title: "Llena tu agenda de limpieza — INDEXA USA",
    description:
      "Clientes recurrentes residenciales y comerciales para negocios de limpieza hispanos en USA. Anuncios en español + leads a WhatsApp. Garantía 30 días.",
    url: `${INDEXA_SITE_URL}/limpieza-usa`,
    locale: "es_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqLimpieza = [
  {
    pregunta: "¿Funciona INDEXA para mi cleaning service nuevo?",
    respuesta:
      "Sí. La mayoría de cleaning services hispanos empiezan con 1-3 personas y un carro. INDEXA te construye Google Business Profile, página web, perfiles sociales y los primeros anuncios. En 7-14 días empiezan a entrar las primeras solicitudes — muchas para clientes recurrentes (semanal o quincenal).",
  },
  {
    pregunta: "¿Qué tipo de clientes traen los anuncios — casas, oficinas, Airbnb?",
    respuesta:
      "Todos. Tú decides el mix. Lo más común es: 60% residencial recurrente (casa semanal/quincenal), 20% deep cleaning + move-in/move-out (ticket más alto), 15% Airbnb turnovers (volumen recurrente), 5% comercial (oficinas, restaurantes pequeños). Si quieres enfocarte solo en uno, segmentamos las campañas.",
  },
  {
    pregunta: "¿Y si no quiero competir con cleaning services baratos en mi zona?",
    respuesta:
      "Justamente por eso INDEXA funciona. En vez de pelear por precio en Facebook Marketplace o Nextdoor, te posicionamos como negocio profesional: página web, reviews en Google, fotos antes/después. Captamos clientes que valoran trato profesional y pagan $30-50/hora en lugar de los $15/hora del mercado informal.",
  },
  {
    pregunta: "¿Qué pasa con clientes que solo hablan inglés?",
    respuesta:
      "En limpieza ese mercado paga 30-50% más que el mercado hispano. Hacemos campañas duales (español para captar clientes hispanos referidos + inglés para zonas suburbanas premium) con landing bilingüe. Los anuncios en inglés enfatizan 'family-owned, Spanish-speaking team' lo cual es atractivo para muchos clientes americanos.",
  },
  {
    pregunta: "¿Cuánto presupuesto de anuncios necesito?",
    respuesta:
      "$200-400/mes en presupuesto de anuncios para empezar. Eso normalmente trae 25-60 leads/mes en zonas con buena densidad. Como cada cliente recurrente vale $200-500/mes en revenue (servicio quincenal), con 2-3 clientes nuevos al mes ya recuperaste el plan + los anuncios + márgenes saludables.",
  },
  {
    pregunta: "¿Cómo me ayuda con las reseñas en Google?",
    respuesta:
      "Limpieza es uno de los servicios donde más cuentan las reseñas (la gente busca confianza para meter desconocidos a su casa). Setup-eamos un sistema automatizado: cuando terminas un servicio, mandamos un SMS al cliente con link directo a tu Google Business pidiendo review. Talleres llegan a 4.8★ con 80+ reseñas en 6 meses.",
  },
];

const serviciosLimpieza = [
  { nombre: "Limpieza residencial recurrente", icono: "🏠" },
  { nombre: "Deep cleaning", icono: "✨" },
  { nombre: "Move-in / Move-out", icono: "📦" },
  { nombre: "Limpieza de oficinas", icono: "🏢" },
  { nombre: "Airbnb turnovers", icono: "🛏️" },
  { nombre: "Post-construcción", icono: "🚧" },
  { nombre: "Limpieza de alfombras", icono: "🧼" },
  { nombre: "Lavado de ventanas", icono: "🪟" },
  { nombre: "Limpieza comercial", icono: "🧴" },
];

const ciudadesLimpieza = [
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

export default function LimpiezaUsaPage() {
  const serviceJsonLd = buildUsaHispanicServiceSchema({
    serviceTitle: "Publicidad y captación de clientes para cleaning services hispanos en USA",
    serviceType: "Marketing digital y publicidad para empresas de limpieza residencial y comercial",
    pagePath: "/limpieza-usa",
    description:
      "INDEXA llena agendas de cleaning services con clientes residenciales recurrentes y comerciales en USA. Campañas en Meta y Google, página web optimizada y leads directos a WhatsApp. Para limpiezas en Houston, Dallas, Miami, Atlanta, Phoenix y todo Estados Unidos.",
    audienceType: "Cleaning services y limpieza residencial/comercial hispanos en Estados Unidos",
    faq: faqLimpieza,
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
        name: "Limpieza en USA",
        item: `${INDEXA_SITE_URL}/limpieza-usa`,
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
                  "linear-gradient(rgba(56,189,248,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-28 pb-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-32">
            <div>
              <Link
                href="/usa"
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-indexa-orange hover:text-orange-300"
              >
                ← Negocios hispanos en USA
              </Link>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
                <span>🧹</span>
                Para cleaning services hispanos en USA
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Llena tu agenda de limpieza.{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-300 bg-clip-text text-transparent">
                  Con clientes que vuelven.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Anuncios en Facebook, Google y TikTok que traen clientes residenciales recurrentes (casas semanales y
                quincenales), Airbnb turnovers, deep cleanings y oficinas. Directo a tu WhatsApp.
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-sky-400/10 px-5 py-3 backdrop-blur-sm">
                <span className="text-2xl">⚡</span>
                <p className="text-sm font-semibold sm:text-base">
                  Si en 30 días no llenas la agenda, el siguiente mes va por nuestra cuenta.
                </p>
              </div>

              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row">
                <a
                  href="https://wa.me/525622042820?text=Hola%2C%20tengo%20un%20cleaning%20service%20y%20quiero%20m%C3%A1s%20clientes"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-7 py-3.5 text-base font-bold text-white shadow-2xl shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
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
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Lead que te llega al WhatsApp
                </p>
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl bg-cyan-500/10 p-4">
                    <p className="font-semibold text-white">Sarah Mitchell</p>
                    <p className="text-white/60">ZIP 77024 (Houston) · 3500 sqft, 4 bdrm</p>
                    <p className="mt-2 text-white/85">
                      &quot;Looking for biweekly cleaning. Need someone reliable & Spanish-speaking ok. Quote please.&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 6 minutos · vino de Google</p>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 p-4">
                    <p className="font-semibold text-white">Lucía Hernández</p>
                    <p className="text-white/60">ZIP 77036 · Apartment 2 bdrm</p>
                    <p className="mt-2 text-white/85">
                      &quot;Necesito move-out cleaning para el viernes, tengo que entregar el apartamento. ¿Cuánto cobran?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 22 min · vino de Facebook</p>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 p-4">
                    <p className="font-semibold text-white">Airbnb Host — Daniel R.</p>
                    <p className="text-white/60">ZIP 77002 · 2 propiedades · turnovers entre huéspedes</p>
                    <p className="mt-2 text-white/85">
                      &quot;Tengo 2 Airbnbs en downtown, necesito turnover service confiable. ¿Pueden agendar mañana?&quot;
                    </p>
                    <p className="mt-2 text-xs text-white/40">Hace 41 min · vino de Instagram</p>
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
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-400">Servicios que llenamos</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Atraemos clientes para cada servicio que ofreces
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/65">
                Tú nos dices qué llenar — recurrentes residenciales, Airbnb, comercial — y armamos campañas específicas.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {serviciosLimpieza.map((s) => (
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
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-400">Qué esperar</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que un cleaning service hispano típico ve con INDEXA
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  num: "25-60",
                  label: "Solicitudes/mes",
                  detalle: "Mezcla de recurrentes, deep cleaning, move-out y comercial.",
                },
                {
                  num: "$10-25",
                  label: "Costo por lead",
                  detalle: "Mucho más barato que pagar Yelp Ads o competir en HomeAdvisor.",
                },
                {
                  num: "$200-500",
                  label: "Revenue por cliente recurrente / mes",
                  detalle: "Cliente quincenal a $100-200/visita = $200-400 mensuales.",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-sm"
                >
                  <p className="bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
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
            <p className="text-sm font-bold uppercase tracking-wider text-cyan-400">Cobertura</p>
            <h2 className="mt-3 text-3xl font-extrabold">Cleaning services hispanos en estas ciudades</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {ciudadesLimpieza.map((c) => (
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
              <p className="text-sm font-bold uppercase tracking-wider text-cyan-400">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que más nos preguntan los cleaning services
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqLimpieza.map((q) => (
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

            <div className="mt-14 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-blue-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">
                ¿Listo para llenar tu agenda con clientes que vuelven?
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Auditoría gratis: te decimos cuántos clientes está perdiendo tu cleaning service y cómo los recuperamos.
              </p>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20tengo%20un%20cleaning%20service%20y%20quiero%20la%20auditor%C3%ADa%20gratis"
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
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
