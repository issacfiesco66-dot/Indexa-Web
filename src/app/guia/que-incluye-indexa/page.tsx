import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "¿Qué Incluye INDEXA? Todo lo que Recibes con tu Página Web (2026)",
  description:
    "Desglose completo de todo lo que incluye tu plan de INDEXA: sitio web profesional, SEO automático, WhatsApp, SSL, panel de edición, analytics, galería, bio link y más. Sin costos ocultos.",
  alternates: { canonical: "/guia/que-incluye-indexa" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "¿Qué Incluye INDEXA? Desglose Completo de tu Plan",
  description:
    "Todo lo que recibes con tu plan de INDEXA: sitio web, SEO, WhatsApp, SSL, CMS, analytics y más.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-02-15",
  dateModified: "2026-03-27",
  mainEntityOfPage: `${SITE_URL}/guia/que-incluye-indexa`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "¿Qué Incluye INDEXA?" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Necesito conocimientos técnicos para usar INDEXA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. INDEXA está diseñado para que cualquier persona pueda crear y administrar su sitio web sin conocimientos de programación ni diseño. El panel de edición es visual e intuitivo: editas textos, subes imágenes, cambias colores y todo se actualiza al instante.",
      },
    },
    {
      "@type": "Question",
      name: "¿El hosting y el dominio están incluidos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El hosting está incluido en todos los planes sin costo adicional. El dominio personalizado (.com, .com.mx) se contrata por separado con el proveedor de tu preferencia. INDEXA te proporciona una URL gratuita para que tu sitio esté en línea desde el primer momento.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo cambiar el diseño de mi página después de crearla?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. INDEXA ofrece 3 plantillas profesionales (Moderno, Elegante y Minimalista) y puedes cambiar entre ellas en cualquier momento desde tu panel. También puedes personalizar colores, tipografías, imágenes y contenido.",
      },
    },
    {
      "@type": "Question",
      name: "¿Hay contrato o permanencia mínima?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Todos los planes de INDEXA son mensuales sin contrato y sin permanencia mínima. Puedes cancelar cuando quieras. Mientras tu plan esté activo, tu sitio web sigue en línea con todas las funciones incluidas.",
      },
    },
  ],
};

export default function GuaQueIncluyeIndexa() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 right-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">¿Qué Incluye INDEXA?</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Todo lo que{" "}
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                Recibes
              </span>{" "}
              con tu Plan de INDEXA
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Desglose detallado de cada herramienta, función y beneficio incluido
              en tu plan. Sin letras chiquitas, sin costos ocultos.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>Tu sitio web profesional completo</h2>
          <p>
            Al crear tu cuenta en INDEXA, obtienes un sitio web profesional listo
            para publicar en minutos. No necesitas saber programar, diseñar ni
            contratar a nadie. Todo está incluido para que tu negocio tenga
            presencia digital de inmediato.
          </p>

          <h2>Diseño profesional con 3 plantillas</h2>
          <p>
            Elige entre 3 diseños profesionales creados por diseñadores especializados
            en conversión para negocios locales:
          </p>
          <ul>
            <li><strong>Moderno</strong> — Diseño limpio con fondos de colores vibrantes, ideal para negocios creativos, restaurantes y servicios</li>
            <li><strong>Elegante</strong> — Estilo sofisticado con tipografías serif, perfecto para consultorios, despachos y servicios profesionales</li>
            <li><strong>Minimalista</strong> — Ultra limpio con mucho espacio blanco, ideal para fotógrafos, arquitectos y marcas premium</li>
          </ul>
          <p>
            Puedes cambiar de plantilla en cualquier momento sin perder tu contenido.
            Cada diseño es <strong>100% responsive</strong> — se ve perfecto en celular,
            tablet y computadora.
          </p>

          <h2>Panel de edición (CMS) sin código</h2>
          <p>
            Tu dashboard es tu centro de control. Desde ahí puedes editar:
          </p>
          <ul>
            <li><strong>Nombre y descripción</strong> de tu negocio</li>
            <li><strong>Logo</strong> — sube el tuyo o cámbialo cuando quieras</li>
            <li><strong>Colores</strong> — personaliza el color principal para que coincida con tu marca</li>
            <li><strong>Tipografía</strong> — elige entre familias de fuentes profesionales</li>
            <li><strong>Imagen de portada (Hero)</strong> — sube una foto impactante de tu negocio</li>
            <li><strong>Galería de trabajo</strong> — muestra tus mejores trabajos con imágenes de alta calidad</li>
            <li><strong>Servicios</strong> — agrega, edita o elimina tus servicios dinámicamente</li>
            <li><strong>Horarios</strong> — configura tu horario de atención por día</li>
            <li><strong>Datos de contacto</strong> — teléfono, email, dirección y WhatsApp</li>
          </ul>
          <p>
            Todos los cambios se publican <strong>al instante</strong>. No necesitas esperar
            a que alguien los apruebe o los implemente.
          </p>

          <h2>SEO local automático</h2>
          <p>
            Cada sitio generado por INDEXA incluye optimización para motores de búsqueda
            sin que tú hagas nada:
          </p>
          <ul>
            <li><strong>Schema.org LocalBusiness</strong> — Datos estructurados JSON-LD con nombre, dirección, teléfono, coordenadas GPS, horarios y servicios</li>
            <li><strong>Meta tags optimizados</strong> — Título, descripción y Open Graph configurados automáticamente</li>
            <li><strong>URLs limpias</strong> — Estructura de URL amigable para Google</li>
            <li><strong>Sitemap XML</strong> — Para que Google indexe tu sitio rápidamente</li>
            <li><strong>Velocidad optimizada</strong> — Páginas que cargan en menos de 2 segundos</li>
          </ul>
          <p>
            Esto significa que tu negocio empieza a aparecer en Google desde el primer
            día. Aprende más en nuestra{" "}
            <Link href="/guia/seo-local-mexico">guía de SEO local para México</Link>.
          </p>

          <h2>Botón de WhatsApp integrado</h2>
          <p>
            Cada sitio incluye un <strong>botón flotante de WhatsApp</strong> visible
            en todas las páginas. Los visitantes hacen clic y se abre una conversación
            directa contigo con un mensaje predeterminado. Sin apps extra, sin
            formularios largos — contacto inmediato.
          </p>
          <p>
            Puedes personalizar el número de WhatsApp desde tu panel. Aprende a
            maximizar tus ventas con WhatsApp en nuestra{" "}
            <Link href="/guia/whatsapp-business-pymes">guía de WhatsApp Business</Link>.
          </p>

          <h2>Certificado SSL (HTTPS) gratuito</h2>
          <p>
            Todos los sitios de INDEXA incluyen <strong>certificado SSL gratuito</strong>,
            el candado verde que aparece en la barra del navegador. Esto:
          </p>
          <ul>
            <li>Protege los datos de tus visitantes con encriptación</li>
            <li>Mejora tu posicionamiento en Google (factor de ranking)</li>
            <li>Genera confianza y credibilidad profesional</li>
            <li>Es obligatorio para muchas funciones web modernas</li>
          </ul>

          <h2>Hosting incluido</h2>
          <p>
            Tu sitio web se aloja en servidores de alta velocidad con <strong>99.9%
            de uptime garantizado</strong>. No necesitas contratar hosting por separado
            ni preocuparte por servidores, actualizaciones o seguridad. Todo está
            incluido en tu plan mensual.
          </p>

          <h2>Bio Link profesional</h2>
          <p>
            Además de tu sitio web, obtienes una <strong>página de bio link</strong> estilo
            Linktree pero integrada con tu marca. Comparte un solo enlace en tus
            redes sociales que lleva a una página con todos tus links importantes:
            sitio web, WhatsApp, ubicación en Google Maps, redes sociales y más.
          </p>

          <h2>Analytics y estadísticas</h2>
          <p>
            Desde tu panel puedes ver:
          </p>
          <ul>
            <li><strong>Visitas totales</strong> a tu sitio web y bio link</li>
            <li><strong>Clics en WhatsApp</strong> — cuántas personas te contactaron</li>
            <li><strong>Tendencias</strong> — cómo crecen tus visitas semana a semana</li>
            <li><strong>Fuentes de tráfico</strong> — de dónde llegan tus visitantes</li>
          </ul>
          <p>
            Con estos datos puedes medir el impacto real de tu presencia digital y
            tomar decisiones informadas sobre tu negocio.
          </p>

          <h2>Actualizaciones automáticas</h2>
          <p>
            INDEXA se actualiza constantemente con nuevas funciones, mejoras de diseño
            y optimizaciones de rendimiento. Todas las actualizaciones se aplican
            automáticamente a tu sitio — no necesitas hacer nada. Siempre tendrás
            la versión más reciente de la plataforma.
          </p>

          <h2>Soporte humano real</h2>
          <p>
            No eres un número. Según tu plan, tienes acceso a:
          </p>
          <ul>
            <li><strong>Starter</strong> — Soporte por email con respuesta en menos de 24 horas</li>
            <li><strong>Profesional</strong> — Soporte prioritario por WhatsApp con asesoría para optimizar tu perfil</li>
            <li><strong>Enterprise</strong> — Asesor personal dedicado, configuración premium, capacitación 1 a 1 y soporte técnico urgente</li>
          </ul>

          <h2>Comparativa: INDEXA vs alternativas</h2>
          <div className="not-prose my-8 overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-indexa-gray-dark">Característica</th>
                  <th className="px-4 py-3 text-center font-semibold text-indexa-orange">INDEXA</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500">Freelance</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-500">Agencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-2.5">Precio mensual</td><td className="px-4 py-2.5 text-center font-semibold text-indexa-orange">$299-$1,299</td><td className="px-4 py-2.5 text-center">$5,000-$15,000*</td><td className="px-4 py-2.5 text-center">$20,000-$80,000*</td></tr>
                <tr><td className="px-4 py-2.5">Tiempo de entrega</td><td className="px-4 py-2.5 text-center font-semibold text-indexa-orange">3 minutos</td><td className="px-4 py-2.5 text-center">2-4 semanas</td><td className="px-4 py-2.5 text-center">4-8 semanas</td></tr>
                <tr><td className="px-4 py-2.5">SEO automático</td><td className="px-4 py-2.5 text-center">✅</td><td className="px-4 py-2.5 text-center">❌</td><td className="px-4 py-2.5 text-center">Extra $$$</td></tr>
                <tr><td className="px-4 py-2.5">WhatsApp integrado</td><td className="px-4 py-2.5 text-center">✅</td><td className="px-4 py-2.5 text-center">Variable</td><td className="px-4 py-2.5 text-center">✅</td></tr>
                <tr><td className="px-4 py-2.5">SSL incluido</td><td className="px-4 py-2.5 text-center">✅</td><td className="px-4 py-2.5 text-center">Variable</td><td className="px-4 py-2.5 text-center">✅</td></tr>
                <tr><td className="px-4 py-2.5">Panel de edición</td><td className="px-4 py-2.5 text-center">✅</td><td className="px-4 py-2.5 text-center">❌</td><td className="px-4 py-2.5 text-center">Extra $$$</td></tr>
                <tr><td className="px-4 py-2.5">Sin contrato</td><td className="px-4 py-2.5 text-center">✅</td><td className="px-4 py-2.5 text-center">Variable</td><td className="px-4 py-2.5 text-center">❌</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-400">* Pago único, sin mantenimiento incluido</p>
          </div>

          <h2>Preguntas frecuentes</h2>

          <h3>¿Necesito conocimientos técnicos para usar INDEXA?</h3>
          <p>
            No. INDEXA está diseñado para que cualquier persona pueda crear y
            administrar su sitio web sin conocimientos de programación ni diseño.
            El panel de edición es visual e intuitivo.
          </p>

          <h3>¿El hosting y el dominio están incluidos?</h3>
          <p>
            El hosting está incluido en todos los planes sin costo adicional. El
            dominio personalizado (.com, .com.mx) se contrata por separado con el
            proveedor de tu preferencia. INDEXA te proporciona una URL gratuita
            desde el primer momento.
          </p>

          <h3>¿Puedo cambiar el diseño después de crearla?</h3>
          <p>
            Sí. Puedes cambiar entre las 3 plantillas profesionales en cualquier
            momento desde tu panel sin perder tu contenido. También puedes
            personalizar colores, tipografías e imágenes.
          </p>

          <h3>¿Hay contrato o permanencia mínima?</h3>
          <p>
            No. Todos los planes son mensuales sin contrato. Cancela cuando quieras.
            Mientras tu plan esté activo, tu sitio sigue en línea con todas las
            funciones incluidas.
          </p>

          <div className="not-prose mt-12 rounded-2xl border border-purple-200 bg-purple-50 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Listo para tener todo esto para tu negocio?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Crea tu sitio web en menos de 3 minutos. Sin conocimientos técnicos.
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
              <Link href="/guia/beneficios-pagina-web" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">10 Beneficios de una Página Web</p>
                <p className="mt-1 text-xs text-gray-500">Por qué tu negocio necesita presencia digital</p>
              </Link>
              <Link href="/guia/presencia-digital-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Presencia Digital para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Los 5 pilares para dominar internet</p>
              </Link>
              <Link href="/guia/como-elegir-pagina-web" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Cómo Elegir tu Página Web</p>
                <p className="mt-1 text-xs text-gray-500">Freelance vs agencia vs plataforma: cuál te conviene</p>
              </Link>
              <Link href="/guia/seo-local-mexico" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">SEO Local en México</p>
                <p className="mt-1 text-xs text-gray-500">Aparece primero en Google y Google Maps</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
