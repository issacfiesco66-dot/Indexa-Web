import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Guía Completa de Presencia Digital para PYMES en México (2026)",
  description:
    "Aprende paso a paso cómo crear presencia digital profesional para tu negocio: sitio web, SEO local, WhatsApp Business, redes sociales y marketing digital. Guía actualizada para PYMES mexicanas.",
  alternates: { canonical: "/guia/presencia-digital-pymes" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Guía Completa de Presencia Digital para PYMES en México (2026)",
  description:
    "Paso a paso para crear presencia digital profesional: sitio web con IA, SEO local, WhatsApp Business y marketing digital para PYMES.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-01-15",
  dateModified: "2026-03-25",
  mainEntityOfPage: `${SITE_URL}/guia/presencia-digital-pymes`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "Presencia Digital para PYMES" },
  ],
};

export default function GuiaPresenciaDigital() {
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
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Guía: Presencia Digital para PYMES</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Guía Completa de{" "}
              <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                Presencia Digital
              </span>{" "}
              para PYMES en México
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Todo lo que necesitas saber para llevar tu negocio a internet: desde
              crear tu sitio web hasta aparecer en las primeras posiciones de Google.
              Guía actualizada para 2026.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Qué es la presencia digital y por qué es vital para las PYMES?</h2>
          <p>
            La presencia digital es la suma de todos los canales donde tu negocio
            existe en internet: sitio web, redes sociales, Google Maps, directorios
            y plataformas de reseñas. Según datos del INEGI, <strong>más del 70%
            de los consumidores mexicanos buscan productos y servicios en Google
            antes de comprar</strong>. Si tu negocio no aparece, estás perdiendo
            ventas frente a competidores que sí tienen presencia digital.
          </p>
          <p>
            Para las PYMES, la presencia digital no es un lujo — es una necesidad
            operativa. Un sitio web profesional con SEO local optimizado puede ser
            la diferencia entre que un cliente te encuentre o encuentre a tu
            competencia.
          </p>

          <h2>Los 5 pilares de la presencia digital para PYMES</h2>

          <h3>1. Sitio web profesional</h3>
          <p>
            Tu sitio web es tu carta de presentación digital. Debe cargar en menos
            de 3 segundos, ser responsive (adaptarse a móviles) y contener
            información clara: qué ofreces, dónde estás y cómo contactarte.
          </p>
          <p>
            Con plataformas como <Link href="/">INDEXA</Link>, puedes generar un
            sitio web profesional con inteligencia artificial en minutos, sin
            necesidad de conocimientos técnicos. Cada sitio incluye certificado SSL,
            diseño responsive y optimización para motores de búsqueda.
          </p>

          <h3>2. SEO local (Search Engine Optimization)</h3>
          <p>
            El SEO local es el conjunto de técnicas que hacen que tu negocio
            aparezca cuando alguien busca &quot;{"{tu servicio}"} en {"{tu ciudad}"}&quot;
            en Google. Los elementos clave son:
          </p>
          <ul>
            <li><strong>Datos estructurados Schema.org</strong> — Marcado JSON-LD que le dice a Google tu nombre, dirección, teléfono, horarios y servicios</li>
            <li><strong>Google Business Profile</strong> — Tu ficha en Google Maps con reseñas y fotos</li>
            <li><strong>NAP consistente</strong> — Nombre, Dirección y Teléfono idénticos en todas las plataformas</li>
            <li><strong>Contenido local</strong> — Mencionar tu ciudad y zona de servicio en tu sitio web</li>
          </ul>
          <p>
            Aprende más en nuestra <Link href="/guia/seo-local-mexico">guía completa de SEO local para México</Link>.
          </p>

          <h3>3. WhatsApp Business</h3>
          <p>
            En México, <strong>WhatsApp es el canal de comunicación #1 para
            negocios</strong>. Integrar un botón de WhatsApp en tu sitio web
            reduce la fricción entre &quot;me interesa&quot; y &quot;quiero comprar&quot;.
            Los negocios que usan INDEXA reportan un promedio de 15-35 contactos
            nuevos por mes a través del botón de WhatsApp integrado.
          </p>

          <h3>4. Redes sociales</h3>
          <p>
            Facebook, Instagram y TikTok son canales de descubrimiento. Tu
            estrategia debe incluir contenido regular, pero siempre dirigir
            tráfico a tu sitio web — donde controlas la experiencia y puedes
            medir conversiones. Un <strong>bio link</strong> profesional conecta
            todas tus redes a una página central con tracking.
          </p>

          <h3>5. Marketing digital pagado</h3>
          <p>
            Las campañas en Meta Ads (Facebook e Instagram) y TikTok Ads permiten
            llegar a clientes potenciales segmentados por ubicación, intereses y
            comportamiento. Conoce más en nuestra{" "}
            <Link href="/guia/marketing-digital-pymes">guía de marketing digital para PYMES</Link>.
          </p>

          <h2>¿Cuánto cuesta tener presencia digital profesional en México?</h2>
          <p>
            Los costos varían según la complejidad. Un sitio web hecho por un
            freelance cuesta entre $5,000 y $15,000 MXN sin mantenimiento. Una
            agencia puede cobrar $20,000-$50,000 MXN con mantenimiento mensual
            adicional.
          </p>
          <p>
            Con <Link href="/">INDEXA</Link>, la presencia digital profesional
            empieza desde <strong>$299 MXN/mes</strong>, incluyendo sitio web con
            IA, SEO automático, WhatsApp integrado, SSL y hosting — sin contratos
            ni costos ocultos.
          </p>

          <h2>Cómo empezar hoy</h2>
          <ol>
            <li>
              <Link href="/registro">Crea tu cuenta gratuita en INDEXA</Link> — toma menos de 1 minuto
            </li>
            <li>Ingresa los datos de tu negocio: nombre, descripción, WhatsApp</li>
            <li>La IA genera tu sitio web profesional en menos de 3 minutos</li>
            <li>Comparte tu URL en redes sociales y Google Business Profile</li>
            <li>Monitorea tus visitas y clics desde el panel de analytics</li>
          </ol>

          <div className="not-prose mt-12 rounded-2xl border border-indexa-orange/20 bg-indexa-orange/5 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Listo para crear tu presencia digital?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Más de 500 negocios en México ya usan INDEXA.
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
            <h3 className="text-lg font-bold text-indexa-gray-dark">
              Continúa aprendiendo
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link
                href="/guia/seo-local-mexico"
                className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all"
              >
                <p className="text-sm font-bold text-indexa-gray-dark">
                  SEO Local en México
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Cómo dominar las búsquedas locales con Schema.org y Google Maps
                </p>
              </Link>
              <Link
                href="/guia/marketing-digital-pymes"
                className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all"
              >
                <p className="text-sm font-bold text-indexa-gray-dark">
                  Marketing Digital para PYMES
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Meta Ads y TikTok Ads: cómo invertir inteligentemente
                </p>
              </Link>
              <Link
                href="/casos-de-exito"
                className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all sm:col-span-2"
              >
                <p className="text-sm font-bold text-indexa-gray-dark">
                  Casos de Éxito
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Historias reales de PYMES que crecieron con INDEXA
                </p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
