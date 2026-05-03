import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServicesCrossLink from "@/components/ServicesCrossLink";
import { buildIndustryServiceSchema } from "@/lib/seoSchemas";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Página Web para Taller Mecánico en México — INDEXA",
  description:
    "Crea la página web de tu taller mecánico en 3 minutos con IA. Lista de servicios, precios, galería y WhatsApp para cotizaciones. SEO local para aparecer en Google. Desde $299 MXN/mes.",
  keywords: ["página web taller mecánico", "sitio web taller automotriz", "web para mecánico México", "página web refaccionaria", "sitio web vulcanizadora"],
  alternates: { canonical: "/sitio-web-taller-mecanico" },
  openGraph: {
    title: "Página Web para tu Taller Mecánico — INDEXA",
    description: "Servicios, precios, galería y WhatsApp para cotizaciones. SEO para aparecer cuando busquen 'mecánico cerca de mí'.",
    url: `${SITE_URL}/sitio-web-taller-mecanico`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Para qué sirve tener una página web si tengo un taller mecánico?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Una página web profesional para tu taller mecánico te permite: aparecer en Google cuando alguien busca 'mecánico en [tu ciudad]', mostrar tus servicios y precios, recibir cotizaciones por WhatsApp sin llamadas y generar confianza frente a talleres sin presencia digital. El boca a boca ya no es suficiente — tus clientes te buscan en Google.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta la página web de un taller mecánico?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA, la página web de tu taller mecánico cuesta desde $299 MXN/mes. Incluye diseño profesional, lista de servicios con precios, galería de trabajos, SEO local y botón de WhatsApp para cotizaciones. Sin pagos iniciales ni contratos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo aparece mi taller en Google Maps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA implementa Schema.org AutomotiveBusiness con tu ubicación GPS, horarios, tipos de servicios y datos de contacto. Esto ayuda a Google Maps a mostrar tu taller cuando alguien busca 'mecánico cerca de mí', 'afinación de autos' o 'taller mecánico en [tu colonia]'.",
      },
    },
    {
      "@type": "Question",
      name: "¿INDEXA funciona para talleres especializados en una sola marca de autos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. INDEXA puede mostrar tu especialidad: talleres de Volkswagen, Chevrolet, Ford, Toyota, Honda o cualquier marca. La IA genera contenido específico para tu especialización, lo que te diferencia de talleres generales en las búsquedas de Google.",
      },
    },
  ],
};

const serviceJsonLd = buildIndustryServiceSchema({
  industryName: "talleres mecánicos",
  serviceType: "Página web para talleres mecánicos automotrices",
  pagePath: "/sitio-web-taller-mecanico",
  audienceType: "Talleres mecánicos automotrices en México",
});

const servicios = [
  { nombre: "Afinación", icono: "🔧" },
  { nombre: "Frenos", icono: "🛑" },
  { nombre: "Suspensión", icono: "🚗" },
  { nombre: "Transmisión", icono: "⚙️" },
  { nombre: "Aire acondicionado", icono: "❄️" },
  { nombre: "Diagnóstico electrónico", icono: "💻" },
  { nombre: "Cambio de aceite", icono: "🛢️" },
  { nombre: "Hojalatería y pintura", icono: "🎨" },
];

export default function SitioWebTallerMecanico() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebPage",
          name: "Página Web para Taller Mecánico en México — INDEXA",
          url: `${SITE_URL}/sitio-web-taller-mecanico`,
          publisher: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-24">
          <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[100px]" />
          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Para Talleres Mecánicos y Automotrices
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
              La página web que lleva{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                más autos a tu taller
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Servicios, precios, galería de trabajos y WhatsApp para cotizaciones. SEO local para que
              aparezcas cuando busquen "mecánico en [tu ciudad]". Generado con IA en 3 minutos.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5">
                Crear sitio para mi taller
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
              Muestra todos tus servicios mecánicos
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-center text-lg text-gray-500">
              La IA genera la lista de servicios con precios para que tus clientes sepan exactamente qué ofreces.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {servicios.map((s) => (
                <div key={s.nombre} className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
                  <span className="text-3xl">{s.icono}</span>
                  <span className="mt-2 text-sm font-semibold text-gray-700">{s.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Por qué importa */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="mb-12 text-center text-3xl font-extrabold text-indexa-gray-dark sm:text-4xl">
              ¿Por qué tu taller necesita una página web?
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { titulo: "El 87% busca en Google antes de llevar su auto", desc: "Si no apareces en Google, los llevas a la competencia. Tu página web con SEO local cambia eso.", icono: "🔍" },
                { titulo: "Cotizaciones por WhatsApp sin llamadas", desc: "Botón directo con mensaje preconfigurado: 'Quiero una cotización para mi auto'. Sin teléfono, sin esperas.", icono: "💬" },
                { titulo: "Genera confianza antes de que lleguen", desc: "Galería de trabajos terminados y reseñas de clientes para que confíen en ti antes de poner un pie en tu taller.", icono: "⭐" },
              ].map((b) => (
                <div key={b.titulo} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <span className="text-3xl">{b.icono}</span>
                  <h3 className="mt-3 text-lg font-bold text-indexa-gray-dark">{b.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-10 text-center text-3xl font-extrabold text-indexa-gray-dark">
              Preguntas frecuentes — Talleres mecánicos
            </h2>
            {faqJsonLd.mainEntity.map((faq) => (
              <details key={faq.name} className="mb-4 rounded-xl border border-gray-200 bg-white p-6">
                <summary className="cursor-pointer font-semibold text-indexa-gray-dark">{faq.name}</summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </section>

        <ServicesCrossLink contextLabel="Talleres mecánicos y servicios automotrices" placeName="talleres mecánicos" />


        <section className="bg-gradient-to-r from-indexa-orange to-orange-500 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">¿Tienes un taller mecánico?</h2>
            <p className="mt-4 text-lg text-white/80">Haz que Google te encuentre y llena tu agenda de trabajo. Rápido, fácil y sin programadores.</p>
            <Link href="/registro" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indexa-orange shadow-xl transition-all hover:-translate-y-0.5">
              Crear el sitio de mi taller →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
