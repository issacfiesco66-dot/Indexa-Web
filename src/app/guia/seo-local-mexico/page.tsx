import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "SEO Local en México: Guía para Aparecer en Google y Google Maps (2026)",
  description:
    "Aprende cómo posicionar tu negocio en búsquedas locales de Google con Schema.org, Google Business Profile y datos estructurados. Guía paso a paso para PYMES mexicanas.",
  alternates: { canonical: "/guia/seo-local-mexico" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "SEO Local en México: Guía para Aparecer en Google y Google Maps",
  description:
    "Guía paso a paso de SEO local para PYMES mexicanas: Schema.org, Google Business Profile, datos estructurados y optimización para búsquedas locales.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-01-20",
  dateModified: "2026-03-25",
  mainEntityOfPage: `${SITE_URL}/guia/seo-local-mexico`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "SEO Local en México" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto tiempo tarda el SEO local en dar resultados?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El SEO local generalmente muestra resultados entre 2 y 8 semanas. Con datos estructurados Schema.org correctamente implementados, Google puede indexar tu negocio en los primeros 14 días. Los resultados varían según la competencia en tu ciudad y categoría.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué es Schema.org y cómo ayuda al SEO local?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Schema.org es un vocabulario de datos estructurados que ayuda a los motores de búsqueda a entender la información de tu negocio: nombre, dirección, teléfono, horarios, servicios y ubicación geográfica. Implementarlo en formato JSON-LD mejora tu aparición en Google Search, Google Maps, asistentes de voz y resultados enriquecidos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Necesito Google Business Profile si ya tengo sitio web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Google Business Profile y tu sitio web son complementarios. El perfil te da visibilidad en Google Maps y el panel de conocimiento. Tu sitio web proporciona información detallada y datos estructurados. Ambos juntos maximizan tu presencia en búsquedas locales.",
      },
    },
  ],
};

export default function GuiaSEOLocal() {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-green-500/10 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Guía: SEO Local en México</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              SEO Local en México:{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Aparece en Google
              </span>{" "}
              y Google Maps
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Guía paso a paso para que tu negocio domine las búsquedas locales
              con Schema.org, Google Business Profile y contenido optimizado.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Qué es el SEO local y por qué importa?</h2>
          <p>
            El SEO local es la optimización de tu presencia digital para que tu
            negocio aparezca cuando alguien busca servicios o productos cerca de
            su ubicación. Búsquedas como <em>&quot;plomero cerca de mí&quot;</em>,{" "}
            <em>&quot;restaurante en Polanco&quot;</em> o <em>&quot;dentista en Guadalajara&quot;</em>{" "}
            son ejemplos de búsquedas locales.
          </p>
          <p>
            Según Google, <strong>el 46% de todas las búsquedas tienen intención
            local</strong>, y el 76% de las personas que buscan algo cercano en
            su teléfono visitan un negocio en las siguientes 24 horas. Para PYMES
            en México, dominar el SEO local es la estrategia de marketing con
            mejor retorno de inversión.
          </p>

          <h2>Los 4 factores clave del SEO local</h2>

          <h3>1. Datos estructurados (Schema.org)</h3>
          <p>
            Los datos estructurados en formato JSON-LD le dicen a Google
            exactamente qué es tu negocio. El schema <code>LocalBusiness</code> incluye:
          </p>
          <ul>
            <li><strong>name</strong> — Nombre oficial de tu negocio</li>
            <li><strong>address</strong> — Dirección completa con ciudad y país</li>
            <li><strong>telephone</strong> — Número de contacto (WhatsApp)</li>
            <li><strong>geo</strong> — Coordenadas GPS (latitud y longitud)</li>
            <li><strong>openingHours</strong> — Horarios de atención</li>
            <li><strong>hasOfferCatalog</strong> — Lista de servicios ofrecidos</li>
            <li><strong>areaServed</strong> — Ciudad o zona de cobertura</li>
          </ul>
          <p>
            <Link href="/">INDEXA</Link> implementa automáticamente este marcado
            en cada sitio web que genera, incluyendo coordenadas GPS y categoría
            de negocio optimizada.
          </p>

          <h3>2. Google Business Profile (antes Google My Business)</h3>
          <p>
            Tu ficha de Google Business Profile es esencial para aparecer en el
            &quot;Local Pack&quot; (los 3 resultados con mapa que Google muestra para
            búsquedas locales). Optimiza tu perfil con:
          </p>
          <ul>
            <li>Nombre, dirección y teléfono <strong>idénticos</strong> a los de tu sitio web</li>
            <li>Categoría principal correcta (ej. &quot;Tlapalería&quot;, &quot;Salón de belleza&quot;)</li>
            <li>Fotos de alta calidad de tu negocio (mínimo 10)</li>
            <li>Horarios actualizados</li>
            <li>Respuestas a todas las reseñas (positivas y negativas)</li>
            <li>Publicaciones regulares (Google Posts)</li>
          </ul>

          <h3>3. Consistencia NAP</h3>
          <p>
            NAP significa <strong>Name, Address, Phone</strong> (Nombre, Dirección,
            Teléfono). Google verifica que estos datos sean idénticos en todas las
            plataformas donde aparece tu negocio: sitio web, Google Business
            Profile, Facebook, directorios locales y Páginas Amarillas.
          </p>
          <p>
            Cualquier inconsistencia (ej. &quot;Av.&quot; vs &quot;Avenida&quot;, o diferentes
            números telefónicos) reduce tu autoridad local y perjudica tu
            posicionamiento.
          </p>

          <h3>4. Contenido localizado</h3>
          <p>
            Tu sitio web debe mencionar explícitamente tu ciudad, colonia y zona
            de servicio. No basta con tener una dirección — el contenido de tus
            páginas debe incluir términos como &quot;servicios de plomería en
            Coyoacán&quot; o &quot;la mejor estética en Polanco, CDMX&quot;.
          </p>

          <h2>Checklist de SEO local para tu negocio</h2>
          <ol>
            <li>Crea un sitio web profesional con datos estructurados Schema.org</li>
            <li>Registra y optimiza tu Google Business Profile</li>
            <li>Verifica que tu NAP sea consistente en todas las plataformas</li>
            <li>Agrega coordenadas GPS a tus datos estructurados</li>
            <li>Solicita reseñas a tus clientes satisfechos</li>
            <li>Publica contenido con menciones de tu ciudad y zona</li>
            <li>Incluye un mapa de Google en tu sitio web</li>
            <li>Optimiza tu sitio para dispositivos móviles</li>
          </ol>

          <h2>Preguntas frecuentes sobre SEO local</h2>

          <h3>¿Cuánto tiempo tarda el SEO local en dar resultados?</h3>
          <p>
            El SEO local generalmente muestra resultados entre 2 y 8 semanas. Con
            datos estructurados Schema.org correctamente implementados, Google
            puede indexar tu negocio en los primeros 14 días. Los resultados
            varían según la competencia en tu ciudad y categoría.
          </p>

          <h3>¿Necesito Google Business Profile si ya tengo sitio web?</h3>
          <p>
            Sí. Google Business Profile y tu sitio web son complementarios. El
            perfil te da visibilidad en Google Maps y el panel de conocimiento. Tu
            sitio web proporciona información detallada y datos estructurados.
            Ambos juntos maximizan tu presencia en búsquedas locales.
          </p>

          <div className="not-prose mt-12 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Quieres SEO local automático para tu negocio?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              INDEXA incluye Schema.org LocalBusiness en cada sitio web — sin configuración manual.
            </p>
            <Link
              href="/registro"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Prueba 14 días gratis
            </Link>
          </div>

          {/* Related content */}
          <div className="not-prose mt-12 border-t border-gray-100 pt-10">
            <h3 className="text-lg font-bold text-indexa-gray-dark">Continúa aprendiendo</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/guia/presencia-digital-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Presencia Digital para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Guía completa: del cero a la primera página de Google</p>
              </Link>
              <Link href="/guia/marketing-digital-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Marketing Digital para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Meta Ads y TikTok Ads: invierte inteligentemente</p>
              </Link>
              <Link href="/casos-de-exito" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all sm:col-span-2">
                <p className="text-sm font-bold text-indexa-gray-dark">Casos de Éxito</p>
                <p className="mt-1 text-xs text-gray-500">PYMES que dominan las búsquedas locales con INDEXA</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
