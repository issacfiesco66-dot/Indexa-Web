import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
const PAGE_PATH = "/guia/factura-pagina-web-deducible-mexico";

export const metadata: Metadata = {
  title: "¿Es Deducible una Página Web en México? | Factura, IVA y CFDI 2026",
  description:
    "Sí, una página web es 100% deducible en México como gasto operativo. Te explicamos cómo facturar tu sitio web, qué CFDI usar, IVA acreditable y los requisitos del SAT en 2026.",
  keywords: [
    "página web es deducible mexico",
    "factura página web deducible",
    "cfdi servicios digitales sat",
    "iva acreditable hosting mexico",
    "deducir gastos sitio web pyme",
    "facturar suscripción saas mexico",
    "uso cfdi g03 servicios web",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "¿Es Deducible una Página Web en México? — Guía SAT 2026",
    description: "Cómo facturar y deducir tu sitio web ante el SAT como persona moral o física con actividad empresarial.",
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
  headline: "¿Es Deducible una Página Web en México? Guía SAT 2026",
  description:
    "Cómo deducir y facturar correctamente una página web profesional en México. Uso de CFDI, IVA acreditable y requisitos del SAT.",
  author: { "@type": "Organization", name: "INDEXA", url: SITE_URL },
  publisher: {
    "@type": "Organization",
    name: "INDEXA",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  },
  datePublished: "2026-04-10",
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
    { "@type": "ListItem", position: 3, name: "Página Web Deducible México" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Es deducible una página web en México?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Sí. Una página web profesional es 100% deducible para personas morales y personas físicas con actividad empresarial en México. Se considera un gasto estrictamente indispensable para el desarrollo de la actividad económica conforme al artículo 27 de la Ley del ISR. Tanto el desarrollo inicial, hosting, dominio, suscripciones SaaS y mantenimiento son deducibles siempre que cuentes con CFDI válido.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué CFDI debe emitir el proveedor de la página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Un CFDI 4.0 de tipo Ingreso (I) con uso G03 (Gastos en general) o más específicamente con clave de producto 81111800 (servicios de programación) o 81112200 (servicios de soporte web). El IVA debe estar desglosado al 16%. Si pagas mensualidad, recibirás CFDI cada mes; si pagaste anualidad, recibirás un solo CFDI por todo el periodo.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo acreditar el IVA de mi página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Sí, el 16% de IVA es acreditable siempre que: (1) la página web esté relacionada con tu actividad empresarial, (2) el CFDI esté a tu RFC, (3) el pago haya sido mediante medios trazables (transferencia, tarjeta, cheque nominativo) y (4) el CFDI tenga método de pago PUE o PPD correctamente aplicado. No se acredita el IVA si pagaste en efectivo más de $2,000 MXN.",
      },
    },
    {
      "@type": "Question",
      name: "¿INDEXA emite factura con todos los requisitos SAT?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Sí. INDEXA emite CFDI 4.0 automáticamente al cargo de cada mensualidad con uso G03, clave de producto correcta y desglose de IVA al 16%. Recibirás el XML y PDF en tu correo y también disponible en tu Dashboard. Si requieres un uso de CFDI distinto, lo configuras en tu perfil fiscal.",
      },
    },
    {
      "@type": "Question",
      name: "¿Una página web se deduce como gasto o como activo?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Depende del modelo: (1) Si pagas suscripción mensual a una plataforma SaaS como INDEXA, es gasto deducible inmediato. (2) Si pagas a un developer un desarrollo único de $50,000+ MXN, técnicamente es un activo intangible que debe amortizarse en 5 años (10% al año conforme al artículo 33 LISR). La modalidad SaaS es fiscalmente más ágil para PYMES.",
      },
    },
    {
      "@type": "Question",
      name: "¿Si soy persona física RIF/RESICO puedo deducir mi página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "RESICO PF (vigente desde 2022): la deducción no aplica como tal porque tributas sobre ingresos brutos, no sobre utilidad. Pero para fines de comprobación de actividad y trazabilidad, conserva todos los CFDI. Si tributas en Régimen General de Actividad Empresarial, sí puedes deducir el 100% del gasto en página web.",
      },
    },
  ],
};

interface CFDIRow {
  campo: string;
  valor: string;
  detalle: string;
}

const CFDI_REQUISITOS: CFDIRow[] = [
  { campo: "Tipo de comprobante", valor: "I (Ingreso)", detalle: "Para servicios prestados al cliente." },
  { campo: "Uso de CFDI", valor: "G03", detalle: "Gastos en general (lo más común para servicios web)." },
  { campo: "Régimen fiscal del receptor", valor: "601 / 612 / 626", detalle: "Persona moral / Actividad empresarial / RESICO PM." },
  { campo: "Clave producto/servicio", valor: "81112200", detalle: "Servicios de mantenimiento de páginas web." },
  { campo: "Clave producto alterna", valor: "81111800", detalle: "Servicios de programación informática." },
  { campo: "Unidad", valor: "E48 (Unidad de servicio)", detalle: "Para mensualidades; o ACT (actividad)." },
  { campo: "Método de pago", valor: "PUE o PPD", detalle: "PUE si pagaste antes de facturar; PPD si te facturan y pagas después." },
  { campo: "Forma de pago", valor: "03 / 04 / 28", detalle: "Transferencia / Tarjeta crédito / Tarjeta débito." },
  { campo: "Tasa IVA", valor: "16% acreditable", detalle: "México no tiene exenciones para servicios digitales locales." },
];

interface DeductionTable {
  modalidad: string;
  costoEjemplo: string;
  comoSeDeducce: string;
  ahorroFiscal: string;
}

const DEDUCTION_EXAMPLES: DeductionTable[] = [
  {
    modalidad: "Plataforma SaaS (INDEXA, Wix, etc.)",
    costoEjemplo: "$599 MXN/mes (Profesional)",
    comoSeDeducce: "Gasto deducible 100% al mes que se paga.",
    ahorroFiscal: "ISR 30% PM = ahorras $179.70 MXN/mes en impuestos. Real: pagas $419.30 netos.",
  },
  {
    modalidad: "Pago anual SaaS (descuento típico 15%)",
    costoEjemplo: "$6,108 MXN/año",
    comoSeDeducce: "Deducible en el ejercicio fiscal del pago.",
    ahorroFiscal: "Ahorras ~$1,832 MXN al año en ISR.",
  },
  {
    modalidad: "Desarrollo a la medida (freelancer)",
    costoEjemplo: "$45,000 MXN único",
    comoSeDeducce: "Activo intangible, amortización 10% anual durante 5 años (~$4,500/año).",
    ahorroFiscal: "Más lento de recuperar fiscalmente. Recomendamos modelo SaaS.",
  },
  {
    modalidad: "Hosting + dominio independientes",
    costoEjemplo: "$1,200 MXN/año",
    comoSeDeducce: "Gasto deducible al pagarse.",
    ahorroFiscal: "Solo si tienes CFDI con tu RFC. GoDaddy/Hostgator emiten CFDI; algunos extranjeros no.",
  },
];

export default function GuiaPaginaWebDeducible() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-orange/10 blur-[120px]" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <Link href="/guia" className="hover:text-white/70">Guías</Link>
              {" / "}
              <span className="text-white/60">Página Web Deducible · México</span>
            </nav>
            <span className="inline-block rounded-full bg-indexa-blue/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
              Guía Fiscal · SAT 2026
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              ¿Una página web es{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">deducible en México?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
              Sí, 100% deducible. Te explicamos exactamente cómo facturarla, qué uso de CFDI poner y cómo acreditar el IVA del 16% ante el SAT en 2026.
            </p>
            <p className="mt-4 text-xs text-white/40">
              Última actualización: 1 de mayo 2026 · Información referencial. Consulta a tu contador para tu caso particular.
            </p>
          </div>
        </section>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Respuesta directa</h2>
          <p>
            <strong>Sí, una página web profesional es 100% deducible en México</strong> para:
          </p>
          <ul>
            <li>Personas morales (sociedades mercantiles, S.A. de C.V., S.C.).</li>
            <li>Personas físicas con actividad empresarial y profesional.</li>
            <li>RESICO Persona Moral.</li>
          </ul>
          <p>
            La base legal está en el <strong>artículo 27 de la Ley del ISR</strong>: los gastos &quot;estrictamente indispensables&quot; para los fines de la actividad del contribuyente son deducibles. Una página web hoy se considera tan indispensable como una línea telefónica o un local físico.
          </p>
          <p>
            Para que el SAT te respete la deducción necesitas tres cosas: <strong>CFDI 4.0 válido a tu RFC</strong>, <strong>pago trazable</strong> (no efectivo arriba de $2,000 MXN) y que el servicio sea <strong>real y proporcional</strong> a tu negocio.
          </p>

          <h2>Modalidades de página web y cómo se deducen</h2>
        </article>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Modalidad</th>
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Costo ejemplo</th>
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Cómo se deduce</th>
                  <th className="px-4 py-3 text-left font-bold text-emerald-600">Beneficio fiscal</th>
                </tr>
              </thead>
              <tbody>
                {DEDUCTION_EXAMPLES.map((row) => (
                  <tr key={row.modalidad} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-bold text-indexa-gray-dark">{row.modalidad}</td>
                    <td className="px-4 py-3 text-gray-700">{row.costoEjemplo}</td>
                    <td className="px-4 py-3 text-gray-700">{row.comoSeDeducce}</td>
                    <td className="px-4 py-3 text-gray-600">{row.ahorroFiscal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Requisitos exactos del CFDI para tu página web</h2>
          <p>
            El proveedor (INDEXA, Wix, GoDaddy, freelancer) debe emitirte un CFDI 4.0 con estos datos. Si falta alguno, el SAT puede rechazar la deducción.
          </p>
        </article>

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Campo SAT</th>
                  <th className="px-4 py-3 text-left font-bold text-indexa-orange">Valor correcto</th>
                  <th className="px-4 py-3 text-left font-bold text-indexa-gray-dark">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {CFDI_REQUISITOS.map((row) => (
                  <tr key={row.campo} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-bold text-indexa-gray-dark">{row.campo}</td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-indexa-orange">{row.valor}</td>
                    <td className="px-4 py-3 text-gray-600">{row.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Caso real: cuánto te ahorras al deducir tu sitio</h2>
          <p>
            Un restaurante S.A. de C.V. en CDMX con plan INDEXA Profesional ($599 MXN/mes):
          </p>
          <ul>
            <li>Gasto anual: $599 × 12 = <strong>$7,188 MXN</strong></li>
            <li>IVA acreditable (16% incluido): <strong>$991.45 MXN/año</strong></li>
            <li>Base deducible para ISR: <strong>$6,196.55 MXN</strong></li>
            <li>Ahorro ISR (30%): <strong>$1,858.96 MXN/año</strong></li>
            <li>Costo neto real anualizado: <strong>$4,337.59 MXN/año = $361 MXN/mes</strong></li>
          </ul>
          <p>
            <strong>Resultado:</strong> el plan que &quot;cuesta $599&quot; cuesta de verdad $361 después del beneficio fiscal. Y eso sin contar el IVA acreditable contra otras ventas.
          </p>

          <h2>Errores caros que te detiene el SAT</h2>

          <h3>❌ Pagar a un freelancer en efectivo sin factura</h3>
          <p>
            Sin CFDI no hay deducción ni acreditación de IVA. Aunque te ahorres &quot;el IVA&quot; al pagar en efectivo, fiscalmente pierdes más: pierdes el ISR del 30% sobre el monto y rompes la cadena de comprobación.
          </p>

          <h3>❌ Comprar dominio en plataforma extranjera sin RFC mexicano</h3>
          <p>
            Algunas plataformas extranjeras (Namecheap, Cloudflare en planes pequeños) no emiten CFDI mexicano. Si las usas, ese gasto NO es deducible. Para PYMES en México conviene usar registradores que emitan CFDI: GoDaddy MX, Akky, Gigas, INDEXA (incluido en plan).
          </p>

          <h3>❌ Pagar &quot;por adelantado el año&quot; sin entender el efecto fiscal</h3>
          <p>
            Si tu ejercicio fiscal cierra en diciembre y pagas en noviembre por todo el siguiente año, el SAT puede objetarte que estás &quot;adelantando&quot; deducción. La buena práctica es pagar mensual o pagar el anual al inicio del ejercicio fiscal.
          </p>

          <h3>❌ Confundir &quot;activo intangible&quot; con gasto</h3>
          <p>
            Un desarrollo único de $80,000 MXN no se deduce 100% el año del pago — se amortiza. Si necesitas la deducción rápida, prefiere modalidad SaaS o suscripción.
          </p>

          <h2>Cómo INDEXA te factura paso a paso</h2>
          <ol>
            <li><strong>Registras tu RFC y datos fiscales</strong> en tu Dashboard (1 minuto).</li>
            <li><strong>Pagas tu mensualidad</strong> con tarjeta o transferencia.</li>
            <li><strong>Recibes el CFDI automáticamente</strong> en tu correo en menos de 24 horas.</li>
            <li><strong>Descargas XML y PDF</strong> también desde tu panel para tu contador.</li>
          </ol>
          <p>
            Toda factura de INDEXA cumple con uso G03, IVA al 16% desglosado y clave 81112200. Tu contador la puede meter directo a tu contabilidad mensual.
          </p>

          <h2>Preguntas frecuentes</h2>
          {faqJsonLd.mainEntity.map((q) => (
            <details key={q.name} className="mb-3 rounded-xl border border-gray-200 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-indexa-gray-dark">{q.name}</summary>
              <p className="mt-3 text-base leading-relaxed text-gray-600">{q.acceptedAnswer.text}</p>
            </details>
          ))}

          <p className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <strong>⚠️ Aviso:</strong> Esta guía es informativa y refleja el marco fiscal vigente en mayo 2026.
            Cada caso particular puede tener implicaciones distintas según tu régimen fiscal, ingresos y operación.
            Consulta siempre con tu contador o asesor fiscal antes de aplicar deducciones.
          </p>
        </article>

        <section className="relative overflow-hidden bg-gradient-to-br from-indexa-blue to-cyan-600 py-20">
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Tu próxima factura puede ser deducible al 100%
            </h2>
            <p className="mt-4 text-lg text-white/85">
              INDEXA te emite CFDI 4.0 automático cada mes con todos los requisitos del SAT. Tu sitio web se paga solo en términos fiscales.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indexa-blue shadow-xl transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis
              </Link>
              <Link
                href="/servicios/sitios-web-ia"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
              >
                Ver detalle del servicio
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
