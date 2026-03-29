import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Página Web para Dentista en México — INDEXA",
  description:
    "Crea la página web de tu consultorio dental en menos de 3 minutos. Lista de servicios, galería, citas por WhatsApp y SEO local para aparecer en Google cuando busquen 'dentista en [tu ciudad]'. Desde $299 MXN/mes.",
  keywords: ["página web dentista", "sitio web consultorio dental", "web para dentista México", "página web clínica dental", "sitio web ortodoncista"],
  alternates: { canonical: "/sitio-web-dentista" },
  openGraph: {
    title: "Página Web para tu Consultorio Dental — INDEXA",
    description: "Servicios, galería, citas por WhatsApp y SEO local para aparecer cuando busquen 'dentista cerca de mí'.",
    url: `${SITE_URL}/sitio-web-dentista`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué debe incluir la página web de un dentista?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Una página web efectiva para dentista debe incluir: lista de servicios (limpiezas, ortodoncia, blanqueamiento, implantes), galería de antes/después, horarios, ubicación, botón de WhatsApp para agendar cita, y datos del dentista con su cédula profesional. INDEXA genera todo esto con IA y Schema.org Dentist para el SEO local.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta la página web de un consultorio dental en México?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA, la página web de tu consultorio dental cuesta desde $299 MXN/mes. Incluye diseño profesional con lista de servicios, galería de resultados, SEO local, citas por WhatsApp y SSL. Sin pagos iniciales ni contratos anuales.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo aparece mi consultorio dental en Google cuando buscan 'dentista cerca de mí'?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA implementa Schema.org Dentist y LocalBusiness en tu sitio, con tu ubicación GPS, servicios específicos (implantes, ortodoncia, blanqueamiento) y horarios. Esto le indica a Google exactamente qué ofreces y dónde estás, mejorando tu posicionamiento en búsquedas locales como 'dentista en [tu ciudad]' o 'ortodoncista cerca de mí'.",
      },
    },
    {
      "@type": "Question",
      name: "¿INDEXA funciona para especialistas como ortodoncistas o implantólogos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. INDEXA se adapta a cualquier especialidad dental: odontología general, ortodoncia, implantología, endodoncia, periodoncia, odontopediatría y más. El SEO local incluye palabras clave específicas de tu especialidad para atraer pacientes que buscan exactamente lo que ofreces.",
      },
    },
  ],
};

const servicios = [
  "Limpieza dental y profilaxis", "Ortodoncia y brackets", "Blanqueamiento dental",
  "Implantes dentales", "Endodoncia (nervios)", "Extracciones", "Prótesis dentales", "Odontopediatría",
];

export default function SitioWebDentista() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebPage",
          name: "Página Web para Dentista en México — INDEXA",
          url: `${SITE_URL}/sitio-web-dentista`,
          publisher: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-24">
          <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[100px]" />
          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Para Dentistas y Consultorios Dentales
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              La página web que atrae{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                más pacientes a tu consultorio
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Servicios dentales, galería de resultados, citas por WhatsApp y SEO local para aparecer
              cuando busquen "dentista en [tu ciudad]". Generado con IA en menos de 3 minutos.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5">
                Crear sitio para mi consultorio
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
              <Link href="/demo" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30">Ver ejemplo</Link>
            </div>
            <p className="mt-4 text-sm text-white/30">Sin tarjeta de crédito · Sin contratos · Listo en 3 minutos</p>
          </div>
        </section>

        {/* Servicios */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="mb-4 text-center text-3xl font-extrabold text-indexa-gray-dark sm:text-4xl">
              Tu sitio muestra todos tus servicios dentales
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-lg text-gray-500">
              La IA genera descripciones optimizadas para SEO de cada servicio que ofreces.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {servicios.map((s) => (
                <div key={s} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indexa-orange/10">
                    <svg className="h-3.5 w-3.5 text-indexa-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-3xl font-extrabold text-indexa-gray-dark">
              Preguntas frecuentes — Consultorios dentales
            </h2>
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
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">¿Tienes un consultorio dental?</h2>
            <p className="mt-4 text-lg text-white/80">Atrae más pacientes desde Google con una presencia digital profesional. Sin código, sin complicaciones.</p>
            <Link href="/registro" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indexa-orange shadow-xl transition-all hover:-translate-y-0.5">
              Crear el sitio de mi consultorio →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
