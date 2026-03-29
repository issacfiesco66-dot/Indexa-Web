import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Página Web para Negocios en CDMX — INDEXA",
  description:
    "Crea tu página web profesional para tu negocio en Ciudad de México en menos de 3 minutos. Con SEO local, WhatsApp integrado y IA. Desde $299 MXN/mes.",
  keywords: ["página web CDMX", "sitio web Ciudad de México", "presencia digital CDMX", "diseño web CDMX", "página web negocio México DF"],
  alternates: { canonical: "/pagina-web-cdmx" },
  openGraph: {
    title: "Página Web para Negocios en CDMX — INDEXA",
    description: "Crea tu página web profesional para tu negocio en CDMX. SEO local, WhatsApp y IA incluidos.",
    url: `${SITE_URL}/pagina-web-cdmx`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Página Web para Negocios en CDMX — INDEXA",
  description: "Crea tu página web profesional para tu negocio en Ciudad de México con IA.",
  url: `${SITE_URL}/pagina-web-cdmx`,
  publisher: {
    "@type": "Organization",
    name: "INDEXA",
    url: SITE_URL,
    areaServed: { "@type": "City", name: "Ciudad de México" },
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta una página web profesional para un negocio en CDMX?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA, una página web profesional para tu negocio en Ciudad de México cuesta desde $299 MXN/mes, incluyendo diseño con IA, SEO local, botón de WhatsApp y certificado SSL. Sin costos iniciales ni contratos.",
      },
    },
    {
      "@type": "Question",
      name: "¿En cuánto tiempo aparece mi negocio de CDMX en Google?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con el SEO local de INDEXA, la mayoría de los negocios en CDMX empiezan a aparecer en Google en búsquedas locales entre 1 y 3 semanas. Cada sitio incluye Schema.org LocalBusiness con tu ubicación en la Ciudad de México.",
      },
    },
    {
      "@type": "Question",
      name: "¿INDEXA funciona para cualquier tipo de negocio en Ciudad de México?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. INDEXA está diseñado para PYMES en CDMX de cualquier giro: restaurantes, estéticas, talleres, consultorios, tiendas, despachos contables y más. Cada sitio se adapta a tu categoría y zona de la ciudad.",
      },
    },
  ],
};

const sectores = [
  { nombre: "Restaurantes y Fondas", icono: "🍽️", busqueda: "restaurante en CDMX" },
  { nombre: "Estéticas y Salones", icono: "💇", busqueda: "estética en CDMX" },
  { nombre: "Talleres Mecánicos", icono: "🔧", busqueda: "taller mecánico CDMX" },
  { nombre: "Consultorios Médicos", icono: "🩺", busqueda: "médico en CDMX" },
  { nombre: "Despachos Contables", icono: "📊", busqueda: "contador en CDMX" },
  { nombre: "Tiendas y Comercios", icono: "🛍️", busqueda: "tienda en CDMX" },
  { nombre: "Plomería y Electricidad", icono: "⚡", busqueda: "plomero en CDMX" },
  { nombre: "Pastelerías y Dulcerías", icono: "🎂", busqueda: "pastelería en CDMX" },
];

export default function PaginaWebCDMX() {
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
              Ciudad de México
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Página web profesional para tu{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                negocio en CDMX
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              INDEXA crea tu sitio web con inteligencia artificial en menos de 3 minutos.
              Con SEO local para Ciudad de México, botón de WhatsApp y certificado SSL incluido.
              Aparece en Google cuando tus clientes te buscan.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5"
              >
                Crear mi sitio gratis
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30"
              >
                Ver demo
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/30">Sin tarjeta de crédito · Sin contratos · Listo en 3 minutos</p>
          </div>
        </section>

        {/* Sectores */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-indexa-gray-dark sm:text-4xl">
                Para todo tipo de negocio en CDMX
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Desde Iztapalapa hasta Polanco. INDEXA adapta tu sitio a tu zona y giro.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {sectores.map((s) => (
                <div key={s.nombre} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <span className="text-3xl">{s.icono}</span>
                  <p className="mt-2 text-sm font-semibold text-indexa-gray-dark">{s.nombre}</p>
                  <p className="mt-1 text-xs text-gray-400">{s.busqueda}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="mb-12 text-center text-3xl font-extrabold text-indexa-gray-dark sm:text-4xl">
              ¿Por qué elegir INDEXA para tu negocio en CDMX?
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  titulo: "SEO local para CDMX",
                  desc: "Tu sitio incluye Schema.org con tu dirección, colonia y alcaldía en CDMX. Google entiende exactamente dónde estás y te muestra cuando alguien busca en tu zona.",
                  icono: "📍",
                },
                {
                  titulo: "Listo en 3 minutos",
                  desc: "La IA genera tu sitio completo: textos, diseño y estructura optimizada. Solo llenas los datos de tu negocio y tu página está lista para recibir clientes.",
                  icono: "⚡",
                },
                {
                  titulo: "WhatsApp nativo",
                  desc: "Botón de contacto directo por WhatsApp con mensaje personalizado. Convierte visitas en clientes sin intermediarios.",
                  icono: "💬",
                },
              ].map((b) => (
                <div key={b.titulo} className="rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <span className="text-3xl">{b.icono}</span>
                  <h3 className="mt-3 text-lg font-bold text-indexa-gray-dark">{b.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-3xl font-extrabold text-indexa-gray-dark">
              Preguntas frecuentes — CDMX
            </h2>
            {faqJsonLd.mainEntity.map((faq) => (
              <details key={faq.name} className="mb-4 rounded-xl border border-gray-200 bg-white p-6">
                <summary className="cursor-pointer font-semibold text-indexa-gray-dark">
                  {faq.name}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {faq.acceptedAnswer.text}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gradient-to-r from-indexa-orange to-orange-500 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              ¿Tienes un negocio en CDMX?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Únete a los cientos de emprendedores en Ciudad de México que ya tienen presencia digital profesional.
            </p>
            <Link
              href="/registro"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indexa-orange shadow-xl transition-all hover:-translate-y-0.5"
            >
              Empezar gratis ahora →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
