import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Página Web para Negocios en Puebla — INDEXA",
  description:
    "Crea tu página web profesional para tu negocio en Puebla en menos de 3 minutos. SEO local para Puebla capital y todo el estado, WhatsApp integrado e IA. Desde $299 MXN/mes.",
  keywords: ["página web Puebla", "sitio web Puebla", "presencia digital Puebla", "diseño web Puebla", "página web negocio Puebla"],
  alternates: { canonical: "/pagina-web-puebla" },
  openGraph: {
    title: "Página Web para Negocios en Puebla — INDEXA",
    description: "Crea tu página web profesional para tu negocio en Puebla. SEO local, WhatsApp y IA incluidos.",
    url: `${SITE_URL}/pagina-web-puebla`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Página Web para Negocios en Puebla — INDEXA",
  description: "Crea tu página web profesional para tu negocio en Puebla con IA.",
  url: `${SITE_URL}/pagina-web-puebla`,
  publisher: {
    "@type": "Organization",
    name: "INDEXA",
    url: SITE_URL,
    areaServed: { "@type": "City", name: "Puebla" },
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta una página web profesional para un negocio en Puebla?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA, tu página web en Puebla cuesta desde $299 MXN/mes. Incluye diseño con IA, SEO local para Puebla y el estado, WhatsApp directo y certificado SSL. Sin pagos iniciales ni contratos forzosos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto tarda en aparecer mi negocio poblano en Google?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con el SEO local de INDEXA, los negocios en Puebla empiezan a aparecer en Google en búsquedas locales entre 1 y 3 semanas. Cada sitio incluye Schema.org LocalBusiness con tu dirección, colonia y municipio en Puebla.",
      },
    },
    {
      "@type": "Question",
      name: "¿INDEXA funciona para negocios en municipios cercanos a Puebla?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. INDEXA optimiza el SEO local para toda la zona metropolitana de Puebla: Cholula, San Andrés Cholula, Amozoc, Tehuacán y demás municipios del estado. El SEO se configura con tu ubicación exacta.",
      },
    },
  ],
};

export default function PaginaWebPuebla() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-24">
          <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[100px]" />
          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Puebla de Zaragoza
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Página web profesional para tu{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                negocio en Puebla
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              INDEXA crea tu sitio web con inteligencia artificial en menos de 3 minutos.
              SEO local para Puebla, Cholula y toda la zona metropolitana. Botón de WhatsApp y SSL incluido.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5">
                Crear mi sitio gratis
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30">Ver demo</Link>
            </div>
            <p className="mt-4 text-sm text-white/30">Sin tarjeta de crédito · Sin contratos · Listo en 3 minutos</p>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-3xl font-extrabold text-indexa-gray-dark">Preguntas frecuentes — Puebla</h2>
            {faqJsonLd.mainEntity.map((faq) => (
              <details key={faq.name} className="mb-4 rounded-xl border border-gray-200 bg-white p-6">
                <summary className="cursor-pointer font-semibold text-indexa-gray-dark">{faq.name}</summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-indexa-orange to-orange-500 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">¿Tienes un negocio en Puebla?</h2>
            <p className="mt-4 text-lg text-white/80">Sé el primero en tu colonia o municipio con presencia digital profesional. Listo en minutos.</p>
            <Link href="/registro" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indexa-orange shadow-xl transition-all hover:-translate-y-0.5">Empezar gratis ahora →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
