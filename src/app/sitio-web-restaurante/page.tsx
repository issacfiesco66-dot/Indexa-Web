import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Página Web para Restaurante en México — INDEXA",
  description:
    "Crea la página web de tu restaurante en menos de 3 minutos con IA. Menú digital, galería de platillos, reservaciones por WhatsApp y SEO local para aparecer en Google. Desde $299 MXN/mes.",
  keywords: ["página web restaurante", "sitio web restaurante México", "menú digital restaurante", "web para fonda", "página web taquería", "sitio web cocina"],
  alternates: { canonical: "/sitio-web-restaurante" },
  openGraph: {
    title: "Página Web para tu Restaurante — INDEXA",
    description: "Menú digital, galería de platillos y WhatsApp para reservaciones. SEO local para aparecer cuando busquen 'restaurante cerca de mí'.",
    url: `${SITE_URL}/sitio-web-restaurante`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Página Web para Restaurante en México — INDEXA",
  description: "Crea la página web de tu restaurante con IA. Menú, galería, WhatsApp y SEO local.",
  url: `${SITE_URL}/sitio-web-restaurante`,
  publisher: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué debe incluir la página web de un restaurante?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Una página web efectiva para restaurante debe incluir: menú actualizado con precios, galería de platillos, dirección con mapa, horarios de atención, botón de WhatsApp para reservaciones y reseñas de clientes. INDEXA genera todo esto automáticamente con IA y SEO local para que aparezcas en Google cuando alguien busque 'restaurante en [tu ciudad]'.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta la página web de un restaurante en México?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA, la página web de tu restaurante cuesta desde $299 MXN/mes. Incluye diseño profesional con menú digital, galería de fotos, SEO local, botón de WhatsApp y certificado SSL. Sin pagos iniciales ni contratos forzosos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo aparece mi restaurante en Google cuando alguien busca 'restaurante cerca de mí'?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA implementa Schema.org Restaurant en tu sitio, incluyendo tu ubicación GPS, horarios, tipo de cocina y rango de precios. Esto le indica a Google exactamente qué es tu negocio y dónde está, lo que mejora tu visibilidad en búsquedas locales y Google Maps.",
      },
    },
    {
      "@type": "Question",
      name: "¿Funciona para cualquier tipo de restaurante o fonda?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. INDEXA funciona para restaurantes de cualquier tipo: fondas, taquerías, marisquerías, pizzerías, cafeterías, restaurantes de comida corrida, cocinas económicas y restaurantes de lujo. La IA adapta el diseño y el contenido al estilo de tu negocio.",
      },
    },
  ],
};

const beneficios = [
  { titulo: "Menú digital siempre actualizado", desc: "Edita tus platillos, precios y promociones desde el panel sin necesitar un programador.", icono: "🍽️" },
  { titulo: "Aparece en 'restaurante cerca de mí'", desc: "SEO local automático con Schema.org Restaurant para dominar las búsquedas de tu zona.", icono: "📍" },
  { titulo: "Reservaciones por WhatsApp", desc: "Botón directo con mensaje personalizado: 'Quiero reservar una mesa para X personas'.", icono: "💬" },
  { titulo: "Galería de platillos", desc: "Muestra tus mejores platillos con fotos profesionales para enamorar a tus clientes antes de que lleguen.", icono: "📸" },
  { titulo: "Horarios y dirección claros", desc: "Mapa integrado, horarios visibles y Schema.org para que Google Maps te muestre correctamente.", icono: "🗺️" },
  { titulo: "Reseñas y calificaciones", desc: "Sección de testimonios para mostrar las reseñas de tus clientes satisfechos y generar confianza.", icono: "⭐" },
];

export default function SitioWebRestaurante() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-24">
          <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[100px]" />
          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Para Restaurantes y Fondas
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              La página web que tu{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                restaurante necesita
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Menú digital, galería de platillos, reservaciones por WhatsApp y SEO local para que aparezcas
              en Google cuando alguien busque "restaurante en [tu ciudad]". Listo en menos de 3 minutos.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5">
                Crear sitio para mi restaurante
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30">Ver ejemplo</Link>
            </div>
            <p className="mt-4 text-sm text-white/30">Sin tarjeta de crédito · Sin contratos · Listo en 3 minutos</p>
          </div>
        </section>

        {/* Beneficios */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-4 text-center text-3xl font-extrabold text-indexa-gray-dark sm:text-4xl">
              Todo lo que necesita la web de tu restaurante
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-lg text-gray-500">
              INDEXA genera automáticamente todos los elementos que convierte visitas en reservaciones.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {beneficios.map((b) => (
                <div key={b.titulo} className="rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-3xl">{b.icono}</span>
                  <h3 className="mt-3 text-lg font-bold text-indexa-gray-dark">{b.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Caso de éxito */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indexa-orange to-orange-500 text-lg font-bold text-white">MG</div>
                <div>
                  <p className="text-lg leading-relaxed text-gray-700 italic">
                    &ldquo;Antes mis clientes no podían encontrar mi restaurante en Google. Con INDEXA, en dos semanas ya aparecía para 'restaurante en Iztapalapa'. Ahora recibo 15+ mensajes por WhatsApp cada semana de clientes nuevos.&rdquo;
                  </p>
                  <p className="mt-4 font-bold text-indexa-gray-dark">María García</p>
                  <p className="text-sm text-gray-400">Estética Glamour · Iztapalapa, CDMX</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-3xl font-extrabold text-indexa-gray-dark">
              Preguntas frecuentes — Restaurantes
            </h2>
            {faqJsonLd.mainEntity.map((faq) => (
              <details key={faq.name} className="mb-4 rounded-xl border border-gray-200 bg-white p-6">
                <summary className="cursor-pointer font-semibold text-indexa-gray-dark">{faq.name}</summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-indexa-orange to-orange-500 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">¿Tienes un restaurante o fonda?</h2>
            <p className="mt-4 text-lg text-white/80">Llena más mesas con una presencia digital profesional. Sin código, sin complicaciones.</p>
            <Link href="/registro" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indexa-orange shadow-xl transition-all hover:-translate-y-0.5">
              Crear el sitio de mi restaurante →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
