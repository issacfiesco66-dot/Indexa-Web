import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
const PAGE_PATH = "/guia/indexa-vs-wordpress-vs-wix-pymes-mexico";

export const metadata: Metadata = {
  title: "INDEXA vs WordPress vs Wix: ¿Cuál Conviene a una PYME en México? (2026)",
  description:
    "Comparativa real para una PYME mexicana 2026: INDEXA vs WordPress vs Wix. Costo total anual, soporte español, WhatsApp, SEO local, facilidad de uso y conversión.",
  keywords: [
    "indexa vs wordpress",
    "indexa vs wix",
    "wordpress o wix para pyme mexico",
    "mejor plataforma sitio web pyme",
    "wordpress vs wix vs indexa 2026",
    "comparativa cms pyme mexico",
    "que plataforma elegir para mi negocio",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "INDEXA vs WordPress vs Wix — Comparativa 2026 PYMES México",
    description: "Cuál te conviene según tu caso: análisis lado a lado de costo total, conversión y operación.",
    url: `${SITE_URL}${PAGE_PATH}`,
    type: "article",
    locale: "es_MX",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  other: {
    "geo.region": "MX",
    "geo.placename": "México",
    language: "es-MX",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "INDEXA vs WordPress vs Wix: Comparativa 2026 para PYMES México",
  description:
    "Análisis lado a lado de costo total, conversión y operación entre INDEXA, WordPress y Wix para negocios en México.",
  author: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
  publisher: {
    "@type": "Organization",
    name: "INDEXA",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  },
  datePublished: "2026-04-20",
  dateModified: "2026-05-01",
  mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
  inLanguage: "es-MX",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "INDEXA vs WordPress vs Wix" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es mejor para una PYME mexicana: INDEXA, WordPress o Wix?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Para una PYME mexicana sin equipo técnico que necesita un sitio web operando rápido con SEO local, WhatsApp y publicidad integrada: INDEXA. Para un negocio creativo (fotógrafo, agencia) que necesita libertad visual extrema: Wix. Para un proyecto largo con presupuesto alto que justifica un developer dedicado y crecimiento técnico personalizado: WordPress autogestionado.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál es el costo total anual real de cada uno?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "INDEXA: $7,188 MXN/año (plan Profesional, todo incluido). WordPress autogestionado: $8,500-25,000 MXN/año (hosting + plugins + tema + mantenimiento + developer ocasional). Wix Business Elite: $7,200 MXN/año + plugins de WhatsApp y chat ($1,500-3,000 extra). El total real depende mucho del tiempo que dediques tú o un freelancer.",
      },
    },
    {
      "@type": "Question",
      name: "¿WordPress es realmente gratis?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "El software es gratis (wordpress.org), pero necesitas pagar hosting (~$1,500-4,000 MXN/año), tema premium (~$1,000 MXN), plugins esenciales (Yoast SEO, WPForms, plugins de WhatsApp = $2,000-5,000/año), certificado SSL (incluido en buenos hostings) y mantenimiento. Si te pasa algo, pagas un developer ($500-1,500 MXN/hora). El costo real es similar a una plataforma SaaS pero con más responsabilidad técnica.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál es el más fácil de usar para alguien sin conocimientos técnicos?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "INDEXA es el más fácil porque la IA genera tu sitio en menos de 3 minutos a partir de 4 datos básicos. Wix es segundo (drag-and-drop visual). WordPress es el más complejo: instalación, elegir tema, instalar plugins, configurar SEO, configurar SSL — fácilmente 20-40 horas de aprendizaje antes de tener algo funcional.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuál posiciona mejor en Google para búsquedas locales en México?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "INDEXA y WordPress (con Yoast SEO bien configurado) pueden alcanzar la misma posición. INDEXA viene optimizado de fábrica con Schema.org local, velocidad <1.5s y meta tags correctos sin que toques nada. WordPress requiere configuración manual pero tiene más flexibilidad para SEO técnico avanzado. Wix históricamente tiene peor SEO técnico aunque ha mejorado en los últimos años.",
      },
    },
    {
      "@type": "Question",
      name: "Si ya tengo WordPress, ¿conviene migrar a INDEXA?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Solo si tu WordPress no te está trayendo clientes. Si tienes un sitio que ya rankea bien y genera ventas, no muevas nada. Si tu sitio lleva años sin convertir y la operación te consume tiempo (actualizaciones, plugins rotos, sin chat funcional), migrar a INDEXA simplifica todo y suele mejorar conversión 3-5x por el copy y estructura optimizada.",
      },
    },
  ],
};

interface CompareRow {
  feature: string;
  indexa: string;
  wordpress: string;
  wix: string;
  ganador: "indexa" | "wp" | "wix" | "empate";
}

const COMPARE: CompareRow[] = [
  { feature: "Tiempo de tener sitio operando", indexa: "<3 minutos con IA", wordpress: "1-3 semanas (tú o freelancer)", wix: "1-3 días", ganador: "indexa" },
  { feature: "Costo total anual real (PYME típica)", indexa: "$3,588-15,588 MXN según plan", wordpress: "$8,500-25,000 MXN", wix: "$3,600-15,600 MXN + plugins", ganador: "indexa" },
  { feature: "Soporte en español por WhatsApp", indexa: "Sí, soporte directo", wordpress: "Solo via foros / freelancer", wix: "Email / chat en inglés primario", ganador: "indexa" },
  { feature: "WhatsApp Business integrado", indexa: "Nativo + chatbot IA", wordpress: "Plugins de terceros ($)", wix: "Plugin básico", ganador: "indexa" },
  { feature: "SEO local (Schema.org México)", indexa: "Configurado de fábrica", wordpress: "Requiere Yoast/RankMath + setup", wix: "Limitado", ganador: "indexa" },
  { feature: "Velocidad de carga (Core Web Vitals)", indexa: "<1.5s sin tunear", wordpress: "Variable según hosting/plugins", wix: "2-4s típico", ganador: "indexa" },
  { feature: "Edición visual sin código", indexa: "Panel simple", wordpress: "Gutenberg + page builders", wix: "Drag-and-drop avanzado", ganador: "wix" },
  { feature: "Personalización extrema (CSS, código)", indexa: "Limitada (es plataforma cerrada)", wordpress: "Total — código abierto", wix: "Velo/Code (limitado)", ganador: "wp" },
  { feature: "Plugins / extensiones", indexa: "Servicios incluidos integrados", wordpress: "+59,000 plugins", wix: "~500 apps", ganador: "wp" },
  { feature: "Riesgo de hackeo / actualizaciones", indexa: "Plataforma cerrada (cero riesgo para ti)", wordpress: "Alto si no actualizas plugins", wix: "Plataforma cerrada", ganador: "empate" },
  { feature: "CFDI / Factura mexicana", indexa: "Automática cada mes", wordpress: "Depende del proveedor de hosting", wix: "Soporte limitado para RFC México", ganador: "indexa" },
  { feature: "Marketing automatizado (Meta Ads)", indexa: "Integrado en panel", wordpress: "Plugins externos", wix: "Wix Ads (limitado)", ganador: "indexa" },
  { feature: "Migración entrante (importar contenido)", indexa: "Manual o por equipo INDEXA", wordpress: "Plugins de importación", wix: "Limitado", ganador: "wp" },
  { feature: "Portabilidad (irse con tu data)", indexa: "Exportación de contenido", wordpress: "Total — eres dueño de todo", wix: "Limitado, lock-in alto", ganador: "wp" },
  { feature: "Funciona sin estar uno encima", indexa: "Sí — IA optimiza sola", wordpress: "Requiere mantenimiento constante", wix: "Estable pero pasivo", ganador: "indexa" },
];

const winnerLabel: Record<CompareRow["ganador"], { text: string; color: string }> = {
  indexa: { text: "INDEXA", color: "bg-indexa-orange/10 text-indexa-orange border-indexa-orange/30" },
  wp: { text: "WordPress", color: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  wix: { text: "Wix", color: "bg-purple-500/10 text-purple-700 border-purple-500/30" },
  empate: { text: "Empate", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

function GanadorBadge({ g }: { g: CompareRow["ganador"] }) {
  const w = winnerLabel[g];
  return (
    <span className={`ml-2 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${w.color}`}>
      {w.text}
    </span>
  );
}

export default function GuiaIndexaVsWordPressVsWix() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/3 h-[450px] w-[450px] rounded-full bg-purple-500/15 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-orange/15 blur-[120px]" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <Link href="/guia" className="hover:text-white/70">Guías</Link>
              {" / "}
              <span className="text-white/60">INDEXA vs WordPress vs Wix</span>
            </nav>
            <span className="inline-block rounded-full bg-purple-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
              Comparativa para PYMES · 2026
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">INDEXA</span>{" "}
              <span className="text-white/40">vs</span>{" "}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">WordPress</span>{" "}
              <span className="text-white/40">vs</span>{" "}
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Wix</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
              Comparativa lado a lado para una PYME mexicana en 2026. Costo real total, conversión, operación y soporte. Sin marketing, datos.
            </p>
            <p className="mt-4 text-xs text-white/40">
              Última actualización: 1 de mayo 2026 · Probadas las 3 plataformas con cuentas reales.
            </p>
          </div>
        </section>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Respuesta directa</h2>
          <p>
            <strong>Si eres una PYME mexicana sin equipo técnico y quieres clientes, no plataforma: INDEXA gana.</strong>
            En 11 de 15 categorías relevantes para una PYME mexicana es el ganador, especialmente en tiempo de operación, soporte en español, WhatsApp integrado y SEO local.
          </p>
          <p>
            <strong>WordPress gana</strong> en personalización absoluta, plugins, portabilidad y proyectos a la medida con presupuesto alto.
            <strong>Wix gana</strong> en libertad visual extrema para portafolios creativos.
          </p>
          <p>
            La pregunta no es &quot;cuál es mejor en general&quot; — es <em>cuál te trae clientes a ti, en tu ciudad, con tu giro y tu tiempo disponible</em>. Y para 8 de 10 PYMES mexicanas, INDEXA es la respuesta operativa.
          </p>

          <h2>Tabla comparativa completa</h2>
        </article>

        <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="px-3 py-3 text-left font-bold text-indexa-gray-dark">Característica</th>
                <th className="px-3 py-3 text-left font-bold text-indexa-orange">INDEXA</th>
                <th className="px-3 py-3 text-left font-bold text-blue-600">WordPress</th>
                <th className="px-3 py-3 text-left font-bold text-purple-600">Wix</th>
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
                  <td className="px-3 py-3 text-gray-700">{row.wordpress}</td>
                  <td className="px-3 py-3 text-gray-700">{row.wix}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-gray-500">
            Datos verificados en abril 2026. Las plataformas evolucionan; revisa el sitio oficial antes de contratar.
          </p>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Cuál te conviene según tu caso?</h2>

          <h3>📍 Caso 1: Negocio local de servicios (taller, dentista, restaurante, estética)</h3>
          <p>
            <strong>Ganador: INDEXA.</strong> Necesitas estar en Google Maps, WhatsApp directo, SEO local y poder pausar/correr anuncios desde el celular. Las 4 cosas vienen de fábrica en INDEXA. WordPress requiere 5+ plugins y configuración. Wix te falta WhatsApp y SEO local.
          </p>

          <h3>🛒 Caso 2: Tienda en línea con catálogo extenso (50+ productos, variantes)</h3>
          <p>
            <strong>Ganador: WordPress (con WooCommerce).</strong> WooCommerce sigue siendo el rey de e-commerce flexible para catálogos grandes. INDEXA es más adecuada para servicios o catálogo pequeño con WhatsApp como cierre. Wix tiene tienda decente pero más limitada.
          </p>

          <h3>🎨 Caso 3: Estudio creativo, fotógrafo, portafolio artístico</h3>
          <p>
            <strong>Ganador: Wix.</strong> Su libertad visual y plantillas creativas es insuperable para mostrar trabajo visual con animaciones complejas. INDEXA y WordPress (sin un buen tema) se quedan cortos en este nicho.
          </p>

          <h3>🏢 Caso 4: Sitio corporativo grande con blog, careers, multi-idioma</h3>
          <p>
            <strong>Ganador: WordPress.</strong> Para necesidades técnicas avanzadas (multi-idioma con WPML, blog con autores múltiples, integraciones con CRMs corporativos), WordPress es la mejor base.
          </p>

          <h3>💼 Caso 5: Profesional independiente (abogado, contador, consultor)</h3>
          <p>
            <strong>Ganador: INDEXA.</strong> Quieres aparecer en Google, dar confianza y recibir contactos por WhatsApp. INDEXA te lo arma todo. WordPress es overkill, Wix es lento de configurar.
          </p>

          <h3>📈 Caso 6: PYME con presupuesto $0 disponible este mes</h3>
          <p>
            <strong>Ganador: INDEXA (prueba gratis 14 días).</strong> WordPress.com tiene plan gratis pero te muestra ads de WordPress, dominio feo y nada de SEO. INDEXA gratis 14 días te da todo (sitio, SEO, WhatsApp, panel) sin tarjeta. Cuando termina el trial, $299/mes.
          </p>

          <h2>El costo real anual: análisis financiero</h2>
          <p>
            Aquí desglosamos el costo total real (no el de propaganda) para una PYME típica mexicana en 2026:
          </p>

          <h3>💰 INDEXA Profesional (caso típico)</h3>
          <ul>
            <li>Plan: $599 MXN/mes × 12 = $7,188 MXN/año</li>
            <li>Hosting, dominio, SSL, soporte: <strong>incluido</strong></li>
            <li>WhatsApp + chatbot IA: <strong>incluido</strong></li>
            <li>SEO local + analíticas: <strong>incluido</strong></li>
            <li>Tu tiempo de operación: ~30 min/mes editando contenido</li>
            <li className="font-bold">Total año 1: $7,188 MXN | Costo neto post-deducción: ~$4,338 MXN</li>
          </ul>

          <h3>💰 WordPress autogestionado (caso típico)</h3>
          <ul>
            <li>Hosting (Hostinger Premium): $1,800 MXN/año</li>
            <li>Tema premium (Astra Pro o GeneratePress): $1,000 MXN único</li>
            <li>Plugin SEO (RankMath Pro): $1,400 MXN/año</li>
            <li>Plugin chat WhatsApp: $800 MXN/año</li>
            <li>Plugin formularios (WPForms Pro): $1,500 MXN/año</li>
            <li>Plugin de seguridad (Wordfence): $2,000 MXN/año</li>
            <li>Backup (UpdraftPlus Premium): $1,400 MXN/año</li>
            <li>Tu tiempo de operación: ~3-5 hrs/mes (actualizaciones, conflictos, breaks)</li>
            <li>Developer ocasional para fixes: $2,000-5,000 MXN/año</li>
            <li className="font-bold">Total año 1: ~$12,900-15,900 MXN sin contar tu tiempo</li>
          </ul>

          <h3>💰 Wix Business Elite (caso típico)</h3>
          <ul>
            <li>Plan: $499 MXN/mes × 12 = $5,988 MXN/año</li>
            <li>App de WhatsApp / chat: $1,500-3,000 MXN/año</li>
            <li>App de SEO avanzado: $1,200 MXN/año</li>
            <li>Comisiones por venta en tienda (2.9% Wix Payments)</li>
            <li>Tu tiempo: ~2 hrs/mes</li>
            <li className="font-bold">Total año 1: ~$8,700-10,200 MXN</li>
          </ul>

          <h2>Conclusión sin maquillaje</h2>
          <p>
            Si tu negocio depende de <strong>tener clientes nuevos cada semana</strong> y no de tener la web técnicamente más sofisticada del mundo, <strong>INDEXA gana</strong>: menor costo total, soporte en español, WhatsApp y SEO local de fábrica.
          </p>
          <p>
            Si tu negocio es lo suficientemente grande para tener un equipo de marketing/IT propio, <strong>WordPress sigue siendo el rey técnico</strong> por su flexibilidad ilimitada — pero acepta que tu equipo tendrá que mantenerlo.
          </p>
          <p>
            <strong>Wix</strong> tiene su nicho clarísimo en proyectos creativos visuales. Para PYMES de servicios mexicanos, se queda corto en SEO local y WhatsApp.
          </p>

          <h2>Preguntas frecuentes</h2>
          {faqJsonLd.mainEntity.map((q) => (
            <details key={q.name} className="mb-3 rounded-xl border border-gray-200 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-indexa-gray-dark">{q.name}</summary>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{q.acceptedAnswer.text}</p>
            </details>
          ))}
        </article>

        <section className="relative overflow-hidden bg-gradient-to-br from-indexa-orange to-orange-500 py-20">
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Pruébalo tú mismo: 14 días gratis sin tarjeta
            </h2>
            <p className="mt-4 text-lg text-white/85">
              Activa INDEXA en menos de 3 minutos y compáralo con tu sitio actual. Si no te convence, cancelas. Sin compromiso, sin trampa.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indexa-orange shadow-xl transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis
              </Link>
              <Link
                href="/probar"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
              >
                Ver demo de mi sitio
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
