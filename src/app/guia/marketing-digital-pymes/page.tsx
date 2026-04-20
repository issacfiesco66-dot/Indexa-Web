import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Marketing Digital para PYMES: Meta Ads y TikTok Ads en México (2026)",
  description:
    "Aprende a invertir en publicidad digital para tu negocio: cuánto cuesta, cómo segmentar y cómo medir resultados en Facebook, Instagram y TikTok. Guía práctica para PYMES mexicanas.",
  alternates: { canonical: "/guia/marketing-digital-pymes" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Marketing Digital para PYMES: Meta Ads y TikTok Ads en México",
  description:
    "Guía práctica de publicidad digital para PYMES: presupuestos, segmentación, formatos y métricas en Meta Ads y TikTok Ads.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-02-01",
  dateModified: "2026-03-25",
  mainEntityOfPage: `${SITE_URL}/guia/marketing-digital-pymes`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "Marketing Digital para PYMES" },
  ],
};

export default function GuiaMarketingDigital() {
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
          <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Guía: Marketing Digital para PYMES</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Marketing Digital para PYMES:{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Meta Ads y TikTok Ads
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Guía práctica para invertir en publicidad digital: cuánto gastar,
              cómo segmentar y cómo medir resultados reales para tu negocio en
              México.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Por qué invertir en publicidad digital?</h2>
          <p>
            La publicidad digital permite a las PYMES llegar a clientes
            potenciales con presupuestos accesibles. A diferencia de la publicidad
            tradicional (radio, volantes, espectaculares), los anuncios digitales
            son <strong>medibles, segmentables y escalables</strong>. Puedes
            empezar con $50 MXN al día y escalar según resultados.
          </p>
          <p>
            Las dos plataformas más efectivas para PYMES en México son{" "}
            <strong>Meta Ads</strong> (Facebook e Instagram) y{" "}
            <strong>TikTok Ads</strong>. Cada una tiene ventajas distintas según
            tu tipo de negocio y audiencia.
          </p>

          <h2>Meta Ads: Facebook e Instagram</h2>

          <h3>¿Cuánto cuesta anunciarse en Facebook?</h3>
          <p>
            En México, el costo promedio por clic (CPC) en Facebook Ads es de{" "}
            <strong>$2-8 MXN</strong>, y el costo por cada 1,000 impresiones (CPM)
            oscila entre <strong>$30-80 MXN</strong>. Un presupuesto de{" "}
            <strong>$1,500-3,000 MXN/mes</strong> es suficiente para una PYME que
            quiere generar tráfico local y leads por WhatsApp.
          </p>

          <h3>Segmentación recomendada para negocios locales</h3>
          <ul>
            <li><strong>Ubicación</strong> — Radio de 5-15 km alrededor de tu negocio</li>
            <li><strong>Edad</strong> — Ajustar según tu cliente ideal (ej. 25-55 para servicios profesionales)</li>
            <li><strong>Intereses</strong> — Relacionados con tu categoría de negocio</li>
            <li><strong>Comportamiento</strong> — &quot;Personas que viven en esta ubicación&quot; (no solo visitan)</li>
          </ul>

          <h3>Formatos que funcionan</h3>
          <ul>
            <li><strong>Carrusel</strong> — Muestra tus servicios o productos en varias imágenes</li>
            <li><strong>Video corto (15-30s)</strong> — Muestra tu negocio, equipo o proceso de trabajo</li>
            <li><strong>Click to WhatsApp</strong> — El usuario hace clic y abre una conversación directa contigo</li>
          </ul>

          <h2>TikTok Ads</h2>

          <h3>¿TikTok funciona para negocios locales?</h3>
          <p>
            Sí, especialmente para negocios con componente visual: restaurantes,
            estéticas, tiendas de ropa, talleres creativos y servicios donde puedes
            mostrar &quot;el antes y después&quot;. TikTok tiene{" "}
            <strong>más de 60 millones de usuarios en México</strong> y su algoritmo
            favorece el contenido local relevante.
          </p>

          <h3>Presupuesto recomendado</h3>
          <p>
            TikTok Ads requiere un presupuesto mínimo diario de <strong>$200 MXN
            por grupo de anuncios</strong>. Para una prueba inicial, recomendamos{" "}
            <strong>$3,000-5,000 MXN/mes</strong> durante al menos 2 semanas para
            que el algoritmo optimice la entrega.
          </p>

          <h2>Métricas que importan</h2>
          <p>
            No te pierdas en métricas de vanidad (likes, impresiones). Las
            métricas que realmente importan para una PYME son:
          </p>
          <ul>
            <li><strong>Costo por lead (CPL)</strong> — ¿Cuánto pagas por cada contacto nuevo?</li>
            <li><strong>Clics a WhatsApp</strong> — ¿Cuántas personas te contactaron?</li>
            <li><strong>Tasa de conversión</strong> — ¿De los que contactaron, cuántos compraron?</li>
            <li><strong>ROAS</strong> — Retorno sobre el gasto en ads (ingreso / inversión)</li>
          </ul>

          <h2>Cómo INDEXA simplifica el marketing digital</h2>
          <p>
            Con el plan Enterprise de <Link href="/">INDEXA</Link>, puedes crear
            y gestionar campañas de <strong>Meta Ads y TikTok Ads</strong>{" "}
            directamente desde tu panel de control. La IA te ayuda a:
          </p>
          <ul>
            <li>Generar el copy y creativos del anuncio automáticamente</li>
            <li>Configurar la segmentación óptima según tu ciudad y categoría</li>
            <li>Monitorear métricas de rendimiento en tiempo real</li>
            <li>Conectar los anuncios directamente con tu botón de WhatsApp</li>
          </ul>

          <div className="not-prose mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Listo para lanzar tus primeras campañas?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              INDEXA gestiona tus campañas de Meta Ads y TikTok Ads desde un solo panel.
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
                <p className="mt-1 text-xs text-gray-500">Guía completa: sitio web, SEO y WhatsApp integrado</p>
              </Link>
              <Link href="/guia/seo-local-mexico" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">SEO Local en México</p>
                <p className="mt-1 text-xs text-gray-500">Domina las búsquedas locales con Schema.org</p>
              </Link>
              <Link href="/casos-de-exito" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all sm:col-span-2">
                <p className="text-sm font-bold text-indexa-gray-dark">Casos de Éxito</p>
                <p className="mt-1 text-xs text-gray-500">Cómo PYMES reales están creciendo con INDEXA</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
