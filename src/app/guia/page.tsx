import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Guías de Presencia Digital para PYMES en México — INDEXA",
  description:
    "Guías gratuitas para PYMES mexicanas: cómo crear tu página web, SEO local, Google Mi Negocio, WhatsApp Business, marketing digital y más. Todo lo que necesitas para crecer en internet.",
  alternates: { canonical: "/guia" },
  openGraph: {
    title: "Guías de Presencia Digital para PYMES — INDEXA",
    description:
      "Aprende gratis cómo posicionar tu negocio en Google, crear tu página web con IA y atraer más clientes en México.",
    url: `${SITE_URL}/guia`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const guias = [
  {
    slug: "presencia-digital-pymes",
    titulo: "Guía Completa de Presencia Digital para PYMES",
    descripcion:
      "Paso a paso para crear presencia digital profesional: sitio web con IA, SEO local, WhatsApp Business y marketing digital.",
    icono: "🚀",
    tiempoLectura: "12 min",
    categoria: "Fundamentos",
  },
  {
    slug: "seo-local-mexico",
    titulo: "SEO Local en México: Aparecer en Google y Google Maps",
    descripcion:
      "Cómo posicionar tu negocio en búsquedas locales con Schema.org, Google Business Profile y datos estructurados.",
    icono: "📍",
    tiempoLectura: "10 min",
    categoria: "SEO",
  },
  {
    slug: "google-mi-negocio",
    titulo: "Google Mi Negocio: Guía Completa para PYMES",
    descripcion:
      "Crea y optimiza tu perfil de Google Business para aparecer en Google Maps y atraer más clientes locales.",
    icono: "🗺️",
    tiempoLectura: "8 min",
    categoria: "SEO",
  },
  {
    slug: "marketing-digital-pymes",
    titulo: "Marketing Digital: Meta Ads y TikTok Ads en México",
    descripcion:
      "Aprende a invertir en publicidad digital: presupuestos, segmentación y métricas en Facebook, Instagram y TikTok.",
    icono: "📣",
    tiempoLectura: "10 min",
    categoria: "Marketing",
  },
  {
    slug: "whatsapp-business-pymes",
    titulo: "WhatsApp Business para PYMES: Guía Práctica",
    descripcion:
      "Configura WhatsApp Business para atender clientes, automatizar respuestas y convertir más ventas.",
    icono: "💬",
    tiempoLectura: "7 min",
    categoria: "Ventas",
  },
  {
    slug: "beneficios-pagina-web",
    titulo: "¿Por qué tu Negocio Necesita una Página Web?",
    descripcion:
      "Descubre cómo una página web profesional genera más ventas, credibilidad y clientes para tu PYME.",
    icono: "💡",
    tiempoLectura: "6 min",
    categoria: "Fundamentos",
  },
  {
    slug: "como-elegir-pagina-web",
    titulo: "Cómo Elegir la Mejor Plataforma para tu Página Web",
    descripcion:
      "Comparativa: WordPress, Wix, Shopify o INDEXA. Qué opción conviene más según tu tipo de negocio.",
    icono: "⚖️",
    tiempoLectura: "8 min",
    categoria: "Fundamentos",
  },
  {
    slug: "que-incluye-indexa",
    titulo: "¿Qué Incluye INDEXA? Todo lo que Obtienes",
    descripcion:
      "Sitio web con IA, SEO automático, WhatsApp, panel CMS, estadísticas y más. Conoce todo lo que INDEXA hace por tu negocio.",
    icono: "📦",
    tiempoLectura: "5 min",
    categoria: "INDEXA",
  },
  {
    slug: "preguntas-frecuentes",
    titulo: "Preguntas Frecuentes sobre Páginas Web y SEO",
    descripcion:
      "Respuestas a las dudas más comunes de PYMES sobre páginas web, costos, SEO, dominios y WhatsApp.",
    icono: "❓",
    tiempoLectura: "6 min",
    categoria: "FAQ",
  },
];

const categorias = [...new Set(guias.map((g) => g.categoria))];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Guías de Presencia Digital para PYMES — INDEXA",
  description:
    "Guías gratuitas para PYMES mexicanas sobre presencia digital, SEO local, marketing y páginas web.",
  url: `${SITE_URL}/guia`,
  publisher: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: guias.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.titulo,
      url: `${SITE_URL}/guia/${g.slug}`,
    })),
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Guías" },
  ],
};

export default function GuiasHub() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-orange/15 blur-[100px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Guías</span>
            </nav>
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Recursos Gratuitos
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Guías para hacer crecer{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                tu negocio en internet
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Todo lo que necesitas saber sobre presencia digital, SEO local, páginas web y marketing
              para PYMES en México — explicado en lenguaje sencillo.
            </p>
          </div>
        </section>

        {/* Guides grid */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          {categorias.map((cat) => (
            <div key={cat} className="mb-16">
              <h2 className="mb-8 text-2xl font-extrabold text-indexa-gray-dark">
                {cat}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {guias
                  .filter((g) => g.categoria === cat)
                  .map((guia) => (
                    <Link
                      key={guia.slug}
                      href={`/guia/${guia.slug}`}
                      className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indexa-orange/40 hover:shadow-lg"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-3xl">{guia.icono}</span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                          {guia.tiempoLectura}
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-bold leading-tight text-indexa-gray-dark group-hover:text-indexa-orange transition-colors">
                        {guia.titulo}
                      </h3>
                      <p className="flex-1 text-sm leading-relaxed text-gray-500">
                        {guia.descripcion}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-indexa-orange">
                        Leer guía
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 transition-transform group-hover:translate-x-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="bg-[#050816] py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              ¿Listo para aplicar todo esto?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
              INDEXA crea tu sitio web profesional con SEO local en menos de 3 minutos. Sin código, sin complicaciones.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5 hover:shadow-indexa-orange/40"
              >
                Crear mi sitio gratis
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/directorio"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                Ver directorio
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
