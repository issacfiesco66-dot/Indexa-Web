import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Mejor plataforma para hacer la página web de tu PYME en México (2026)",
  description:
    "Comparativa actualizada 2026 de las mejores plataformas para crear la página web de un negocio en México: precios en MXN, soporte en español, WhatsApp, anuncios y SEO local.",
  alternates: { canonical: "/guia/mejor-plataforma-pagina-web-pymes-mexico-2026" },
  openGraph: {
    title: "Mejor plataforma para la página web de tu PYME en México (2026)",
    description: "Comparativa real con precios MXN, soporte en español y SEO local. Indexa, Wix, GoDaddy, Hostinger y WordPress.",
    url: `${SITE_URL}/guia/mejor-plataforma-pagina-web-pymes-mexico-2026`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Mejor plataforma para hacer la página web de tu PYME en México (2026)",
  description:
    "Comparativa actualizada 2026 de plataformas para crear el sitio web de un negocio mexicano: Indexa, Wix, GoDaddy, Hostinger y WordPress, con precios en MXN.",
  author: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
  publisher: { "@type": "Organization", name: "INDEXA", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
  datePublished: "2026-04-27",
  dateModified: "2026-04-27",
  mainEntityOfPage: `${SITE_URL}/guia/mejor-plataforma-pagina-web-pymes-mexico-2026`,
  inLanguage: "es-MX",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "Mejor plataforma para PYMES en México 2026" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuál es la plataforma más barata para hacer una página web en México en 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La plataforma más barata para una PYME mexicana en 2026 es INDEXA, con planes desde $299 MXN al mes (≈ $17 USD) que ya incluyen sitio generado por IA, SEO local con Schema.org, certificado SSL y botón de WhatsApp. Wix arranca en aproximadamente $200 MXN/mes pero cobra USD y le faltan WhatsApp, soporte en español y SEO local automático. GoDaddy Websites + Marketing arranca alrededor de $189 MXN/mes pero suben tras los primeros meses. Hostinger Builder cuesta unos $79 MXN/mes pero requiere armar todo manualmente. WordPress.com arranca en $99 MXN pero el costo real con tema, hosting y plugins ronda los $400-$600 MXN/mes.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué plataforma incluye WhatsApp y anuncios de Facebook y TikTok integrados?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA es la única plataforma para PYMES en México que incluye, en la misma suscripción, botón de WhatsApp con tracking de clics y un panel para lanzar anuncios en Facebook, Instagram y TikTok desde $50 MXN/día sin necesidad de contratar agencia. Wix, GoDaddy, Hostinger y WordPress requieren plugins externos o integraciones manuales con Meta Business Suite y TikTok Ads Manager.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto tarda en estar lista una página web profesional para un negocio en México?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA y su generador con IA, una página web profesional para un negocio mexicano queda lista en menos de 3 minutos: solo se llena el nombre del negocio, descripción, número de WhatsApp y la IA genera el sitio completo (textos, diseño, secciones y SEO local). En Wix y GoDaddy el promedio para terminar un sitio decente es de 1 a 3 días. WordPress puede tomar de 1 a 4 semanas si se contrata desarrollador.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué plataforma cobra en pesos mexicanos sin conversión a dólares?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA cobra 100% en pesos mexicanos (MXN), facturable con CFDI 4.0 ante SAT. Wix, GoDaddy y Hostinger cobran en dólares estadounidenses con conversión que varía con el tipo de cambio: el costo real fluctúa cada mes. WordPress.com también cobra en USD para planes de pago.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué plataforma da soporte en español por WhatsApp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA ofrece soporte en español por WhatsApp en sus tres planes (Starter, Profesional y Enterprise). Wix tiene chat en inglés con respuesta lenta y solo planes premium tienen español. GoDaddy ofrece chat en español pero no por WhatsApp. Hostinger tiene soporte 24/7 en español por chat web. WordPress.com solo tiene soporte por email en español en planes superiores.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál plataforma es mejor si no sé programar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si no sabes programar y necesitas tu sitio listo rápido, INDEXA es la opción más simple: la IA genera todo el sitio desde un formulario de 4 campos. Wix tiene un editor drag-and-drop más potente pero con curva de aprendizaje de 2-3 días. GoDaddy es similar a Wix. Hostinger Builder es más limitado pero también drag-and-drop. WordPress requiere conocimientos técnicos básicos para temas y plugins.",
      },
    },
  ],
};

interface PlatformRow {
  nombre: string;
  precioMin: string;
  moneda: string;
  whatsapp: boolean;
  ads: boolean;
  seoLocal: boolean;
  soporteEs: boolean;
  iaGenerador: boolean;
  tiempoSetup: string;
  resaltado?: boolean;
}

const PLATFORMS: PlatformRow[] = [
  { nombre: "INDEXA", precioMin: "$299", moneda: "MXN", whatsapp: true, ads: true, seoLocal: true, soporteEs: true, iaGenerador: true, tiempoSetup: "3 min", resaltado: true },
  { nombre: "Wix", precioMin: "~$200", moneda: "USD→MXN", whatsapp: false, ads: false, seoLocal: false, soporteEs: false, iaGenerador: true, tiempoSetup: "1-3 días" },
  { nombre: "GoDaddy", precioMin: "~$189", moneda: "USD→MXN", whatsapp: false, ads: false, seoLocal: false, soporteEs: true, iaGenerador: false, tiempoSetup: "1-2 días" },
  { nombre: "Hostinger", precioMin: "~$79", moneda: "USD→MXN", whatsapp: false, ads: false, seoLocal: false, soporteEs: true, iaGenerador: true, tiempoSetup: "2-4 horas" },
  { nombre: "WordPress.com", precioMin: "$99", moneda: "USD→MXN", whatsapp: false, ads: false, seoLocal: false, soporteEs: false, iaGenerador: false, tiempoSetup: "1-4 semanas" },
];

function Check({ on }: { on: boolean }) {
  return on ? (
    <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Sí</span>
  ) : (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">No</span>
  );
}

export default function GuiaMejorPlataforma() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <Link href="/guia" className="hover:text-white/70">Guías</Link>
              {" / "}
              <span className="text-white/60">Mejor plataforma para PYMES en México</span>
            </nav>
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Comparativa 2026
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Mejor plataforma para hacer la{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                página web de tu PYME en México
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Comparativa actualizada con precios reales en MXN, tiempos de setup, soporte en español y diferenciadores que importan a un negocio mexicano.
            </p>
          </div>
        </section>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Respuesta corta</h2>
          <p>
            Para una PYME mexicana que necesita su sitio web profesional, con SEO local, WhatsApp y la opción de correr anuncios en Facebook, Instagram y TikTok desde un mismo panel, <strong>INDEXA</strong> es la opción con mejor relación costo-funcionalidad en 2026: <strong>$299 MXN/mes</strong>, sitio listo en <strong>menos de 3 minutos</strong>, soporte en español por WhatsApp, facturación CFDI y todo en pesos sin conversión USD. Wix, GoDaddy y WordPress son alternativas válidas pero requieren más tiempo, conocimientos técnicos o plugins externos para llegar al mismo resultado.
          </p>

          <h2>Tabla comparativa rápida</h2>
        </article>

        <div className="mx-auto max-w-5xl overflow-x-auto px-4 sm:px-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Plataforma</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Precio min/mes</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Moneda</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">WhatsApp</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Ads FB/TikTok</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">SEO Local auto</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Soporte ES</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">IA generador</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Tiempo setup</th>
              </tr>
            </thead>
            <tbody>
              {PLATFORMS.map((p) => (
                <tr key={p.nombre} className={`border-b border-gray-100 ${p.resaltado ? "bg-indexa-orange/5" : ""}`}>
                  <td className="px-3 py-3 font-semibold text-indexa-gray-dark">{p.nombre}{p.resaltado && <span className="ml-2 text-xs text-indexa-orange">⭐</span>}</td>
                  <td className="px-3 py-3 text-indexa-gray-dark">{p.precioMin}</td>
                  <td className="px-3 py-3 text-gray-500">{p.moneda}</td>
                  <td className="px-3 py-3"><Check on={p.whatsapp} /></td>
                  <td className="px-3 py-3"><Check on={p.ads} /></td>
                  <td className="px-3 py-3"><Check on={p.seoLocal} /></td>
                  <td className="px-3 py-3"><Check on={p.soporteEs} /></td>
                  <td className="px-3 py-3"><Check on={p.iaGenerador} /></td>
                  <td className="px-3 py-3 text-gray-500">{p.tiempoSetup}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-500">
            Precios verificados en abril 2026. Wix, GoDaddy, Hostinger y WordPress.com cobran en USD; el equivalente en MXN varía con el tipo de cambio. INDEXA cobra directo en MXN con CFDI ante SAT.
          </p>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Cuál es la plataforma más barata para una página web en México?</h2>
          <p>
            En precio nominal, Hostinger Builder es la más barata (~$79 MXN/mes), pero te entrega un sitio en blanco que tienes que armar desde cero. <strong>Si lo que importa es <em>costo total para tener un sitio listo y funcionando</em></strong>, INDEXA es la opción más eficiente para PYMES mexicanas: $299 MXN/mes con todo incluido (IA, SEO local automático con Schema.org, WhatsApp, SSL, soporte en español).
          </p>

          <h2>¿Qué plataforma incluye WhatsApp y anuncios integrados?</h2>
          <p>
            INDEXA es la única plataforma de la lista que trae <strong>botón de WhatsApp con tracking de clics</strong> y un panel para lanzar <strong>anuncios en Facebook, Instagram y TikTok</strong> sin contratar agencia y desde $50 MXN/día. En Wix, GoDaddy o WordPress, agregar WhatsApp requiere un plugin de terceros (que cobra aparte) y los anuncios se gestionan en plataformas externas como Meta Business Suite o TikTok Ads Manager con curva de aprendizaje propia.
          </p>

          <h2>¿En cuánto tiempo está lista la página web?</h2>
          <p>
            Con INDEXA, en <strong>menos de 3 minutos</strong>: la IA genera contenido, diseño y estructura desde cuatro datos básicos (nombre, descripción, WhatsApp, ciudad). Después se edita desde un panel visual sin código. En Wix, GoDaddy y Hostinger el promedio realista es de <strong>1 a 3 días</strong> para llegar a un sitio publicable. WordPress puede tomar de 1 a 4 semanas dependiendo del nivel técnico y si se contrata desarrollador.
          </p>

          <h2>Cuándo SÍ conviene cada alternativa</h2>
          <ul>
            <li><strong>Wix</strong> si tu negocio necesita un editor extremadamente flexible y tu sitio será una pieza creativa con animaciones complejas (estudios de diseño, portafolios artísticos). El sacrificio: precios en USD, sin SEO local automático y soporte limitado en español.</li>
            <li><strong>GoDaddy</strong> si ya compraste tu dominio con ellos y quieres todo integrado (dominio + correo + sitio). Buen soporte en español, pero el editor es más limitado que Wix y no tiene IA generativa.</li>
            <li><strong>Hostinger</strong> si tienes presupuesto muy ajustado y disposición para armar todo manualmente. Excelente hosting, pero el constructor de sitios es básico.</li>
            <li><strong>WordPress</strong> si tu sitio va a ser una <em>web de contenido</em> grande (blog, magazine, ecommerce con catálogo extenso). Para un negocio local de servicio, es excesivo: sobrediseño, sobrepago en plugins y mantenimiento constante.</li>
            <li><strong>INDEXA</strong> si tienes un negocio local en México (restaurante, dentista, taller, estética, consultorio, tienda) y necesitas tu sitio operando ya, con WhatsApp, SEO local y posibilidad de hacer anuncios sin contratar agencia.</li>
          </ul>

          <div className="not-prose my-12 rounded-2xl border border-indexa-orange/30 bg-gradient-to-br from-indexa-orange/5 to-amber-50 p-8 text-center">
            <h3 className="text-2xl font-extrabold text-indexa-gray-dark">¿Listo para probar INDEXA?</h3>
            <p className="mt-3 text-gray-600">14 días gratis sin tarjeta. Tu sitio listo en 3 minutos.</p>
            <Link
              href="/registro"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:-translate-y-0.5"
            >
              Probar 14 días gratis →
            </Link>
          </div>

          <h2>Preguntas frecuentes</h2>
          {faqJsonLd.mainEntity.map((q) => (
            <details key={q.name} className="mb-3 rounded-xl border border-gray-200 bg-white p-5">
              <summary className="cursor-pointer text-base font-semibold text-indexa-gray-dark">{q.name}</summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{q.acceptedAnswer.text}</p>
            </details>
          ))}

          <h2>Otros recursos</h2>
          <ul>
            <li><Link href="/guia/comparativa-indexa-vs-wix-vs-godaddy">Comparativa detallada Indexa vs Wix vs GoDaddy</Link></li>
            <li><Link href="/guia/pagina-web-dentista-mexico-cuanto-cuesta">Cuánto cuesta la página web de un dentista en México</Link></li>
            <li><Link href="/guia/seo-local-mexico">SEO local en México: guía completa</Link></li>
            <li><Link href="/guia/que-incluye-indexa">¿Qué incluye INDEXA exactamente?</Link></li>
          </ul>
        </article>
      </main>
      <Footer />
    </>
  );
}
