import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cómo Elegir la Mejor Página Web para tu Negocio: Freelance vs Agencia vs Plataforma (2026)",
  description:
    "Compara las opciones para crear tu página web en México: freelance, agencia o plataforma como INDEXA. Pros, contras, costos, tiempos de entrega y cuál es la mejor opción según tu tipo de negocio.",
  alternates: { canonical: "/guia/como-elegir-pagina-web" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Cómo Elegir la Mejor Página Web para tu Negocio en México",
  description:
    "Comparativa completa: freelance vs agencia vs plataforma. Pros, contras, costos y recomendaciones.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-03-01",
  dateModified: "2026-03-27",
  mainEntityOfPage: "https://indexaia.com/guia/como-elegir-pagina-web",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: "https://indexaia.com" },
    { "@type": "ListItem", position: 2, name: "Guías", item: "https://indexaia.com/guia" },
    { "@type": "ListItem", position: 3, name: "Cómo Elegir tu Página Web" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué opción es mejor para una PYME con poco presupuesto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para PYMES con presupuesto limitado, una plataforma como INDEXA es la mejor opción. Por $299 MXN/mes obtienes un sitio profesional con SEO, WhatsApp, SSL y hosting incluidos. Un freelance cobra mínimo $5,000 MXN de pago único y una agencia desde $20,000 MXN. Además, con INDEXA tu sitio está listo en minutos, no en semanas.",
      },
    },
    {
      "@type": "Question",
      name: "¿WordPress es buena opción para mi negocio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WordPress es muy versátil pero requiere mantenimiento técnico constante: actualizaciones de plugins, seguridad, optimización de velocidad y backups. Para una PYME sin equipo técnico, el mantenimiento puede ser problemático. Plataformas como INDEXA eliminan esta complejidad técnica manteniendo la calidad profesional.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo empezar con una opción económica y escalar después?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Con INDEXA puedes empezar con el plan Starter ($299/mes) y escalar a Profesional o Enterprise cuando tu negocio crezca. No pierdes contenido ni posicionamiento al cambiar de plan. Esta flexibilidad es ideal para negocios que están empezando.",
      },
    },
  ],
};

export default function GuiaComoElegirPaginaWeb() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Cómo Elegir tu Página Web</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Cómo Elegir la{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Mejor Opción
              </span>{" "}
              para tu Página Web
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Freelance, agencia o plataforma: comparamos costos, tiempos, ventajas
              y desventajas para que tomes la mejor decisión para tu negocio.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Las 3 formas de crear una página web para tu negocio</h2>
          <p>
            Si decides que tu negocio necesita una página web (y la respuesta es sí),
            tienes tres caminos principales. Cada uno tiene sus ventajas y desventajas.
            La mejor opción depende de tu presupuesto, urgencia y nivel técnico.
          </p>

          <h2>Opción 1: Contratar un freelance</h2>
          <p>
            Un diseñador o programador independiente crea tu sitio web de forma
            personalizada.
          </p>
          <h3>Ventajas</h3>
          <ul>
            <li><strong>Diseño personalizado</strong> — Puede crear exactamente lo que imaginas</li>
            <li><strong>Comunicación directa</strong> — Tratas con una sola persona</li>
            <li><strong>Flexibilidad</strong> — Puede adaptarse a requerimientos específicos</li>
          </ul>
          <h3>Desventajas</h3>
          <ul>
            <li><strong>Costo: $5,000-$15,000 MXN</strong> de pago único, sin mantenimiento</li>
            <li><strong>Tiempo: 2-4 semanas</strong> en promedio para tener tu sitio listo</li>
            <li><strong>Sin SEO</strong> — La mayoría de freelancers no incluyen optimización para Google</li>
            <li><strong>Sin mantenimiento</strong> — Si algo se rompe, necesitas contactar (y pagar) al freelance de nuevo</li>
            <li><strong>Riesgo de disponibilidad</strong> — Si el freelance desaparece, puedes quedarte sin soporte</li>
            <li><strong>Sin panel de edición</strong> — Para hacer cambios dependes del freelance</li>
          </ul>
          <p>
            <strong>Ideal para:</strong> Negocios que necesitan funcionalidad muy específica
            (e-commerce complejo, sistemas internos) y tienen presupuesto para pago único
            más mantenimiento mensual.
          </p>

          <h2>Opción 2: Contratar una agencia</h2>
          <p>
            Una agencia de marketing o desarrollo web crea tu sitio con un equipo
            de diseñadores, programadores y estrategas.
          </p>
          <h3>Ventajas</h3>
          <ul>
            <li><strong>Equipo multidisciplinario</strong> — Diseño, desarrollo, SEO y marketing en un solo lugar</li>
            <li><strong>Resultado profesional</strong> — Generalmente alta calidad visual y técnica</li>
            <li><strong>Estrategia integral</strong> — Pueden manejar tu marketing digital completo</li>
            <li><strong>Soporte continuo</strong> — Tienen equipo para resolver problemas</li>
          </ul>
          <h3>Desventajas</h3>
          <ul>
            <li><strong>Costo: $20,000-$80,000 MXN</strong> con mantenimiento mensual adicional de $2,000-$10,000</li>
            <li><strong>Tiempo: 4-8 semanas</strong> para tener tu sitio listo</li>
            <li><strong>Contratos largos</strong> — Muchas agencias piden contratos de 6-12 meses</li>
            <li><strong>Dependencia total</strong> — Necesitas pagarles para cualquier cambio, por mínimo que sea</li>
            <li><strong>Comunicación lenta</strong> — Tu solicitud pasa por ejecutivos de cuenta, diseñadores, desarrolladores...</li>
          </ul>
          <p>
            <strong>Ideal para:</strong> Empresas medianas/grandes con presupuesto amplio
            que necesitan una estrategia digital completa y no les importa esperar
            varias semanas.
          </p>

          <h2>Opción 3: Usar una plataforma como INDEXA</h2>
          <p>
            Una plataforma especializada que te permite crear y administrar tu sitio
            web profesional desde un panel intuitivo, sin conocimientos técnicos.
          </p>
          <h3>Ventajas</h3>
          <ul>
            <li><strong>Costo: desde $299 MXN/mes</strong> — Todo incluido (hosting, SSL, SEO, WhatsApp)</li>
            <li><strong>Listo en 3 minutos</strong> — No esperas semanas, tu sitio está en línea hoy</li>
            <li><strong>SEO automático</strong> — Schema.org, meta tags y velocidad optimizada sin configurar nada</li>
            <li><strong>Panel de edición visual</strong> — Editas textos, imágenes y colores tú mismo, al instante</li>
            <li><strong>Sin contrato</strong> — Pagas mes a mes, cancela cuando quieras</li>
            <li><strong>WhatsApp integrado</strong> — Botón flotante en todas las páginas</li>
            <li><strong>Actualizaciones automáticas</strong> — Nuevas funciones sin costo extra</li>
            <li><strong>Soporte incluido</strong> — Email, WhatsApp o asesor personal según tu plan</li>
          </ul>
          <h3>Desventajas</h3>
          <ul>
            <li><strong>Menos personalización extrema</strong> — Trabajas con plantillas profesionales (aunque son personalizables)</li>
            <li><strong>No ideal para e-commerce complejo</strong> — Si necesitas un catálogo con carrito de compras y pagos en línea</li>
          </ul>
          <p>
            <strong>Ideal para:</strong> PYMES, negocios locales, profesionistas independientes
            y emprendedores que quieren resultados rápidos, profesionales y accesibles.
            Talleres, estéticas, consultorios, restaurantes, fotógrafos, plomeros,
            electricistas, abogados, contadores, dentistas y cualquier negocio local.
          </p>

          <h2>Comparativa directa</h2>
          <div className="not-prose my-8 overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-indexa-gray-dark">Factor</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500">Freelance</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500">Agencia</th>
                  <th className="px-4 py-3 text-center font-semibold text-indexa-orange">INDEXA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2.5 font-medium">Costo inicial</td><td className="px-4 py-2.5 text-center">$5K-$15K</td><td className="px-4 py-2.5 text-center">$20K-$80K</td><td className="px-4 py-2.5 text-center font-semibold text-indexa-orange">$0</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">Costo mensual</td><td className="px-4 py-2.5 text-center">$0*</td><td className="px-4 py-2.5 text-center">$2K-$10K</td><td className="px-4 py-2.5 text-center font-semibold text-indexa-orange">$299-$1,299</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">Tiempo de entrega</td><td className="px-4 py-2.5 text-center">2-4 sem</td><td className="px-4 py-2.5 text-center">4-8 sem</td><td className="px-4 py-2.5 text-center font-semibold text-indexa-orange">3 min</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">SEO incluido</td><td className="px-4 py-2.5 text-center">❌</td><td className="px-4 py-2.5 text-center">$$$</td><td className="px-4 py-2.5 text-center">✅</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">WhatsApp integrado</td><td className="px-4 py-2.5 text-center">Variable</td><td className="px-4 py-2.5 text-center">✅</td><td className="px-4 py-2.5 text-center">✅</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">Edición propia</td><td className="px-4 py-2.5 text-center">❌</td><td className="px-4 py-2.5 text-center">$$$</td><td className="px-4 py-2.5 text-center">✅</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">SSL/Hosting</td><td className="px-4 py-2.5 text-center">Extra</td><td className="px-4 py-2.5 text-center">Incluido</td><td className="px-4 py-2.5 text-center">✅</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">Sin contrato</td><td className="px-4 py-2.5 text-center">✅</td><td className="px-4 py-2.5 text-center">❌</td><td className="px-4 py-2.5 text-center">✅</td></tr>
                <tr><td className="px-4 py-2.5 font-medium">Analytics</td><td className="px-4 py-2.5 text-center">❌</td><td className="px-4 py-2.5 text-center">$$$</td><td className="px-4 py-2.5 text-center">✅</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-400">* Sin mantenimiento. Si algo falla, pagas de nuevo.</p>
          </div>

          <h2>¿Y WordPress, Wix o Squarespace?</h2>

          <h3>WordPress</h3>
          <p>
            WordPress es el CMS más popular del mundo (43% de los sitios web lo usan).
            Es muy versátil, pero tiene una curva de aprendizaje importante. Necesitas:
          </p>
          <ul>
            <li>Contratar hosting por separado ($50-$300 MXN/mes)</li>
            <li>Instalar y configurar plugins (SEO, seguridad, velocidad, formularios)</li>
            <li>Actualizaciones constantes de WordPress, tema y plugins</li>
            <li>Resolver problemas de compatibilidad entre plugins</li>
            <li>Optimizar velocidad manualmente</li>
          </ul>
          <p>
            Para una PYME sin equipo técnico, WordPress puede convertirse en un dolor
            de cabeza más que en una solución.
          </p>

          <h3>Wix / Squarespace</h3>
          <p>
            Son plataformas drag-and-drop internacionales. Ventajas: muchas plantillas
            y flexibilidad de diseño. Desventajas:
          </p>
          <ul>
            <li><strong>No están optimizadas para México</strong> — Sin Schema.org LocalBusiness automático, sin optimización para búsquedas en español mexicano</li>
            <li><strong>Precios en dólares</strong> — $16-$45 USD/mes (más caros que INDEXA)</li>
            <li><strong>Sin WhatsApp integrado</strong> — Necesitas plugins de terceros</li>
            <li><strong>Velocidad variable</strong> — Los sitios pueden ser lentos si agregas muchos elementos</li>
            <li><strong>Soporte en inglés</strong> — No ideal para dueños de negocios mexicanos</li>
          </ul>

          <h2>Nuestra recomendación según tu situación</h2>
          <ul>
            <li><strong>Negocio local que quiere empezar ya</strong> → INDEXA Starter ($299/mes)</li>
            <li><strong>Negocio en crecimiento que necesita marketing</strong> → INDEXA Profesional ($599/mes)</li>
            <li><strong>Negocio con presupuesto amplio y necesidades complejas</strong> → Agencia + SEO</li>
            <li><strong>Proyecto con funcionalidad muy específica</strong> → Freelance senior</li>
            <li><strong>Tienda en línea con carrito de compras</strong> → Shopify + INDEXA para landing page</li>
          </ul>

          <h2>Preguntas frecuentes</h2>

          <h3>¿Qué opción es mejor para una PYME con poco presupuesto?</h3>
          <p>
            Una plataforma como INDEXA. Por $299 MXN/mes obtienes un sitio profesional
            con SEO, WhatsApp, SSL y hosting incluidos. Es la opción con mejor relación
            costo-beneficio para negocios locales.
          </p>

          <h3>¿Puedo empezar con una opción económica y escalar después?</h3>
          <p>
            Sí. Con INDEXA puedes empezar con Starter y escalar a Profesional o
            Enterprise cuando tu negocio crezca. No pierdes contenido ni posicionamiento.
          </p>

          <h3>¿WordPress es buena opción para mi negocio?</h3>
          <p>
            Solo si tienes a alguien técnico que pueda mantenerlo. Para una PYME sin
            equipo de TI, plataformas como INDEXA eliminan la complejidad técnica
            manteniendo la calidad profesional.
          </p>

          <div className="not-prose mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Listo para la opción más inteligente?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Tu sitio web profesional en 3 minutos. Desde $299 MXN/mes.
            </p>
            <Link
              href="/registro"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Prueba 14 días gratis
            </Link>
          </div>

          <div className="not-prose mt-12 border-t border-gray-100 pt-10">
            <h3 className="text-lg font-bold text-indexa-gray-dark">Continúa aprendiendo</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/guia/que-incluye-indexa" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">¿Qué Incluye INDEXA?</p>
                <p className="mt-1 text-xs text-gray-500">Desglose completo de todo lo que recibes</p>
              </Link>
              <Link href="/guia/beneficios-pagina-web" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">10 Beneficios de una Página Web</p>
                <p className="mt-1 text-xs text-gray-500">Por qué tu negocio necesita presencia digital</p>
              </Link>
              <Link href="/guia/preguntas-frecuentes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Preguntas Frecuentes</p>
                <p className="mt-1 text-xs text-gray-500">Todas tus dudas resueltas sobre páginas web</p>
              </Link>
              <Link href="/guia/presencia-digital-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Presencia Digital para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Los 5 pilares de tu presencia digital</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
