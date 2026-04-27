import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "INDEXA vs Wix vs GoDaddy: comparativa para PYMEs en México (2026)",
  description:
    "Comparativa lado a lado de INDEXA, Wix y GoDaddy para una PYME mexicana: precios MXN, soporte en español, WhatsApp, anuncios integrados, SEO local y facilidad de uso.",
  alternates: { canonical: "/guia/comparativa-indexa-vs-wix-vs-godaddy" },
  openGraph: {
    title: "INDEXA vs Wix vs GoDaddy — comparativa 2026 para PYMES México",
    description: "Tabla detallada de precios, características y diferencias para que tu negocio mexicano decida con datos.",
    url: `${SITE_URL}/guia/comparativa-indexa-vs-wix-vs-godaddy`,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "INDEXA vs Wix vs GoDaddy: comparativa para PYMEs en México 2026",
  description:
    "Comparativa lado a lado para PYMES mexicanas. Precios en MXN, soporte en español por WhatsApp, anuncios integrados y SEO local.",
  author: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
  publisher: { "@type": "Organization", name: "INDEXA", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
  datePublished: "2026-04-27",
  dateModified: "2026-04-27",
  mainEntityOfPage: `${SITE_URL}/guia/comparativa-indexa-vs-wix-vs-godaddy`,
  inLanguage: "es-MX",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "INDEXA vs Wix vs GoDaddy" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué plataforma es mejor para una PYME mexicana sin conocimientos técnicos: INDEXA, Wix o GoDaddy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para una PYME mexicana sin conocimientos técnicos, INDEXA es la opción más simple: la IA genera el sitio completo en menos de 3 minutos a partir de cuatro datos básicos (nombre, descripción, WhatsApp, ciudad), sin necesidad de aprender un editor. Wix tiene un editor drag-and-drop más potente pero con curva de aprendizaje de 2 a 3 días para terminar un sitio publicable. GoDaddy Websites + Marketing es similar a Wix en complejidad pero con menos plantillas modernas. Si lo único que necesitas es tener tu sitio publicado y atrayendo clientes, INDEXA gana en velocidad y simpleza.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál de las tres acepta pagos en pesos mexicanos sin conversión USD?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Solo INDEXA cobra 100% en pesos mexicanos (MXN) con factura CFDI 4.0 ante SAT. Wix y GoDaddy cobran en dólares estadounidenses con conversión que cambia mes a mes según el tipo de cambio: el costo real de tu suscripción fluctúa. Para un negocio mexicano que lleva contabilidad en pesos, esto significa menos sorpresas en el estado de cuenta y deducción más limpia.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál de las tres tiene soporte en español por WhatsApp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA es la única que ofrece soporte directo por WhatsApp en español en sus tres planes (desde el Starter de $299 MXN/mes). Wix tiene chat web en inglés con respuesta lenta; el español solo está disponible en planes Premium con tiempos de respuesta de 24 a 48 horas. GoDaddy ofrece chat y teléfono en español pero no por WhatsApp, lo que para una PYME mexicana implica dejar el celular a un lado y usar otro canal.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál incluye WhatsApp y anuncios de Facebook/TikTok integrados?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Solo INDEXA incluye en la misma suscripción: 1) botón de WhatsApp con tracking de clics y mensaje pre-armado para cada visitante, 2) panel para lanzar anuncios en Facebook, Instagram y TikTok desde $50 MXN/día sin contratar agencia. En Wix y GoDaddy, el botón de WhatsApp requiere instalar un plugin de terceros (con su propio costo mensual) y los anuncios se gestionan en plataformas externas como Meta Business Suite o TikTok Ads Manager, cada una con su curva de aprendizaje.",
      },
    },
    {
      "@type": "Question",
      name: "¿En cuánto tiempo está lista una página web con cada plataforma?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA: menos de 3 minutos. La IA genera el sitio completo a partir de cuatro datos. Wix: 1 a 3 días para terminar un sitio publicable a partir de plantilla. GoDaddy: 1 a 2 días. La diferencia se nota especialmente cuando una PYME necesita estar arriba antes del fin de semana, una temporada (Día de la Madre, Buen Fin) o una campaña.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál tiene mejor SEO local automático para México?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA tiene la mejor implementación automática de SEO local para México: cada sitio incluye Schema.org LocalBusiness con coordenadas GPS, ciudad, categoría, horarios y servicios desde el plan Profesional ($599 MXN/mes), sin configuración manual. Wix tiene Schema básico pero requiere configurar manualmente el LocalBusiness. GoDaddy tiene SEO básico pero le falta Schema.org estructurado fuera del plan Premium.",
      },
    },
  ],
};

interface CompareRow {
  feature: string;
  indexa: string;
  wix: string;
  godaddy: string;
  ganador?: "indexa" | "wix" | "godaddy" | "tie";
}

const COMPARE: CompareRow[] = [
  { feature: "Precio plan básico", indexa: "$299 MXN/mes", wix: "~$200 MXN (USD)", godaddy: "~$189 MXN (USD)", ganador: "indexa" },
  { feature: "Moneda y facturación", indexa: "MXN, CFDI 4.0", wix: "USD", godaddy: "USD", ganador: "indexa" },
  { feature: "Setup con IA", indexa: "3 min, todo el sitio", wix: "Wix ADI básico", godaddy: "No", ganador: "indexa" },
  { feature: "Botón WhatsApp nativo", indexa: "Sí, con tracking", wix: "Plugin externo", godaddy: "Plugin externo", ganador: "indexa" },
  { feature: "Anuncios FB/IG/TikTok integrados", indexa: "Sí, desde $50 MXN/día", wix: "No (externo)", godaddy: "No (externo)", ganador: "indexa" },
  { feature: "Schema.org LocalBusiness automático", indexa: "Sí, plan Profesional", wix: "Manual", godaddy: "Manual", ganador: "indexa" },
  { feature: "Soporte en español por WhatsApp", indexa: "Sí, todos los planes", wix: "No", godaddy: "Solo teléfono/chat", ganador: "indexa" },
  { feature: "Plantillas modernas", indexa: "3 plantillas optimizadas para PYMES", wix: "800+ plantillas", godaddy: "100+ plantillas", ganador: "wix" },
  { feature: "Editor drag-and-drop", indexa: "Panel visual simple", wix: "Editor avanzado", godaddy: "Editor intermedio", ganador: "wix" },
  { feature: "Dominio propio incluido", indexa: "Plan Enterprise", wix: "1 año gratis", godaddy: "1 año gratis", ganador: "tie" },
  { feature: "Tienda en línea", indexa: "Roadmap 2026", wix: "Sí (Wix Stores)", godaddy: "Sí (limitada)", ganador: "wix" },
  { feature: "Tiempo de aprendizaje", indexa: "Cero (la IA hace todo)", wix: "2-3 días", godaddy: "1-2 días", ganador: "indexa" },
];

function GanadorBadge({ g }: { g: CompareRow["ganador"] }) {
  if (!g || g === "tie") return null;
  const map = { indexa: "bg-indexa-orange text-white", wix: "bg-blue-500 text-white", godaddy: "bg-emerald-500 text-white" };
  return <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${map[g]}`}>{g}</span>;
}

export default function GuiaIndexaVsWixVsGoDaddy() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/3 h-[450px] w-[450px] rounded-full bg-purple-500/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <Link href="/guia" className="hover:text-white/70">Guías</Link>
              {" / "}
              <span className="text-white/60">INDEXA vs Wix vs GoDaddy</span>
            </nav>
            <span className="inline-block rounded-full bg-purple-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
              Comparativa B2B · 2026
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              INDEXA{" "}
              <span className="text-white/40">vs</span>{" "}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Wix</span>{" "}
              <span className="text-white/40">vs</span>{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">GoDaddy</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              Comparativa lado a lado para una PYME mexicana en 2026. Precios reales en MXN, soporte en español, WhatsApp y anuncios integrados.
            </p>
          </div>
        </section>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Respuesta corta</h2>
          <p>
            <strong>Para una PYME mexicana, INDEXA gana en 9 de 12 categorías.</strong> Wix gana en plantillas y editor avanzado (mejor si necesitas un sitio creativo complejo). GoDaddy gana cuando ya compraste tu dominio con ellos y quieres integración con su correo. Pero para el caso típico — un negocio local que necesita su sitio web operando rápido, con SEO local, WhatsApp y la opción de hacer publicidad sin contratar agencia — INDEXA es la opción más eficiente.
          </p>
        </article>

        <div className="mx-auto max-w-5xl overflow-x-auto px-4 sm:px-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Característica</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-orange">INDEXA</th>
                <th className="px-3 py-3 text-left font-bold text-blue-600">Wix</th>
                <th className="px-3 py-3 text-left font-bold text-emerald-600">GoDaddy</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.feature} className="border-b border-gray-100">
                  <td className="px-3 py-3 font-semibold text-indexa-gray-dark">
                    {row.feature}
                    <GanadorBadge g={row.ganador} />
                  </td>
                  <td className="px-3 py-3 text-gray-700">{row.indexa}</td>
                  <td className="px-3 py-3 text-gray-700">{row.wix}</td>
                  <td className="px-3 py-3 text-gray-700">{row.godaddy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-500">
            Datos verificados en abril 2026. Las características de cada plataforma cambian; revisa el sitio oficial de cada proveedor antes de contratar.
          </p>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Cuál te conviene según tu caso?</h2>

          <h3>Caso 1: Negocio local de servicios (taller, dentista, estética, restaurante)</h3>
          <p>
            <strong>Ganador: INDEXA.</strong> Necesitas estar en Google Maps, WhatsApp directo y poder pausar/correr anuncios desde el celular sin agencia. Las 3 cosas vienen de fábrica en INDEXA. Wix y GoDaddy te exigen plugins externos y conocimiento técnico para llegar al mismo resultado.
          </p>

          <h3>Caso 2: Estudio creativo, fotógrafo, portafolio artístico</h3>
          <p>
            <strong>Ganador: Wix.</strong> El editor de Wix es objetivamente más potente para diseño visual fuera de plantilla, animaciones complejas y estructuras no lineales. Si tu sitio ES la pieza creativa, Wix tiene mejor lienzo. Sacrificas precios en USD y soporte en español limitado.
          </p>

          <h3>Caso 3: Ya tengo dominio + correo en GoDaddy</h3>
          <p>
            <strong>Considera GoDaddy.</strong> Si ya pagas dominio y correo profesional con ellos, agregar el sitio a la misma cuenta tiene sentido por simplicidad. Pero si tu prioridad es el resultado (clientes nuevos), conviene migrar a INDEXA y mantener el dominio apuntando al sitio nuevo (proceso de 24h, sin migración compleja).
          </p>

          <h3>Caso 4: Tienda en línea con catálogo grande (50+ productos)</h3>
          <p>
            <strong>Ganador: Wix Stores</strong> o un servicio especializado como Shopify. INDEXA está enfocado en negocios de servicios y catálogos pequeños — la tienda en línea está en roadmap 2026 pero no es lo más fuerte hoy. Para servicios y catálogos pequeños (menos de 30 productos), INDEXA cubre bien.
          </p>

          <h3>Caso 5: PYME que recién empieza, sin presupuesto técnico</h3>
          <p>
            <strong>Ganador claro: INDEXA.</strong> $299 MXN/mes, 14 días gratis sin tarjeta, cero curva de aprendizaje, soporte en español por WhatsApp. Es la opción que minimiza fricción al máximo: si te late, te quedas; si no, no pagas.
          </p>

          <div className="not-prose my-12 rounded-2xl border border-indexa-orange/30 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8 text-center">
            <h3 className="text-2xl font-extrabold text-indexa-gray-dark">¿Probamos INDEXA antes de decidir?</h3>
            <p className="mt-3 text-gray-600">14 días gratis sin tarjeta. Si no te convence, te ayudamos a migrar a Wix o GoDaddy.</p>
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
            <li><Link href="/guia/mejor-plataforma-pagina-web-pymes-mexico-2026">Comparativa completa con 5 plataformas</Link></li>
            <li><Link href="/guia/pagina-web-dentista-mexico-cuanto-cuesta">Cuánto cuesta una página web dental</Link></li>
            <li><Link href="/guia/que-incluye-indexa">¿Qué incluye INDEXA exactamente?</Link></li>
            <li><Link href="/guia/seo-local-mexico">SEO local en México</Link></li>
          </ul>
        </article>
      </main>
      <Footer />
    </>
  );
}
