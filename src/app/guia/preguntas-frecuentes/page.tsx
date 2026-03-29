import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Preguntas Frecuentes sobre Páginas Web para Negocios en México (2026)",
  description:
    "Resolvemos todas tus dudas sobre crear una página web para tu negocio: costos, tiempos, dominio, hosting, SEO, WhatsApp, diseño, mantenimiento y más. FAQ completa para PYMES mexicanas.",
  alternates: { canonical: "/guia/preguntas-frecuentes" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Preguntas Frecuentes sobre Páginas Web para Negocios en México",
  description:
    "FAQ completa sobre páginas web para PYMES: costos, tiempos, dominio, hosting, SEO y más.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-02-20",
  dateModified: "2026-03-27",
  mainEntityOfPage: `${SITE_URL}/guia/preguntas-frecuentes`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "Preguntas Frecuentes" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuánto cuesta una página web para mi negocio en México?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA, los planes van desde $299 MXN/mes (Starter) hasta $1,299 MXN/mes (Enterprise). Incluyen hosting, SSL, SEO automático, WhatsApp integrado y panel de edición. Un freelance cobra entre $5,000 y $15,000 MXN de pago único sin mantenimiento. Una agencia entre $20,000 y $80,000 MXN.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto tiempo tarda en estar lista mi página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con INDEXA tu sitio web está listo en menos de 3 minutos. Solo necesitas ingresar los datos de tu negocio y la plataforma genera automáticamente un sitio profesional con diseño, SEO y WhatsApp integrado. Con un freelance toma 2-4 semanas y con una agencia 4-8 semanas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué es un dominio y necesito comprar uno?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El dominio es tu dirección en internet (ej. tunegocio.com). INDEXA te proporciona una URL gratuita para que tu sitio esté en línea desde el primer momento. Si quieres un dominio personalizado (.com, .com.mx), se contrata por separado con proveedores como GoDaddy, Namecheap o Google Domains. El costo promedio es de $200-$500 MXN al año.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué es el hosting y está incluido?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "El hosting es el servicio que mantiene tu página web accesible en internet las 24 horas. Con INDEXA, el hosting está incluido en todos los planes sin costo adicional. Tu sitio se aloja en servidores de alta velocidad con 99.9% de uptime garantizado.",
      },
    },
    {
      "@type": "Question",
      name: "¿Mi página web se verá bien en celulares?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Todos los sitios de INDEXA son 100% responsive, es decir, se adaptan automáticamente a cualquier dispositivo: celular, tablet o computadora. El 85% de las búsquedas locales en México se hacen desde el celular, por lo que esto es fundamental.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo editar mi página web yo mismo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. INDEXA incluye un panel de edición visual donde puedes cambiar textos, imágenes, colores, servicios, horarios y datos de contacto sin necesidad de programar. Los cambios se publican al instante.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo me encuentran los clientes en Google?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "INDEXA implementa automáticamente SEO local con datos estructurados Schema.org, meta tags optimizados, URLs limpias y velocidad de carga optimizada. Esto le dice a Google qué ofreces, dónde estás y cómo contactarte. Los negocios empiezan a aparecer en búsquedas locales en las primeras 2-8 semanas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Necesito redes sociales si ya tengo página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Son complementarios. Tu página web es tu base de operaciones (la controlas al 100%, aparece en Google). Las redes sociales son canales de descubrimiento (Facebook, Instagram, TikTok). La estrategia ideal es usar redes para atraer personas y tu web para convertirlas en clientes.",
      },
    },
  ],
};

export default function GuiaPreguntasFrecuentes() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Preguntas Frecuentes</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Todas tus{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
                Dudas Resueltas
              </span>{" "}
              sobre tu Página Web
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Respondemos las preguntas más comunes que tienen los dueños de negocios
              sobre páginas web, costos, dominio, hosting, SEO y marketing digital.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">

          <h2>Sobre costos y planes</h2>

          <h3>¿Cuánto cuesta una página web para mi negocio en México?</h3>
          <p>
            Los costos dependen de la solución que elijas:
          </p>
          <ul>
            <li><strong>INDEXA Starter</strong> — $299 MXN/mes: sitio web profesional, SEO automático, WhatsApp, SSL y hosting incluidos</li>
            <li><strong>INDEXA Profesional</strong> — $599 MXN/mes: todo lo anterior + panel CMS completo, SEO avanzado, estadísticas y soporte WhatsApp</li>
            <li><strong>INDEXA Enterprise</strong> — $1,299 MXN/mes: todo lo anterior + asesor dedicado, configuración premium y capacitación 1 a 1</li>
            <li><strong>Freelance</strong> — $5,000-$15,000 MXN pago único, sin mantenimiento ni SEO</li>
            <li><strong>Agencia</strong> — $20,000-$80,000 MXN, tiempos de entrega de 4-8 semanas</li>
          </ul>
          <p>
            Conoce más detalles en nuestra página de{" "}
            <Link href="/#precios">precios</Link>.
          </p>

          <h3>¿Hay contrato o permanencia mínima?</h3>
          <p>
            No. Todos los planes de INDEXA son <strong>mensuales sin contrato</strong>.
            No hay permanencia mínima ni penalización por cancelar. Puedes cancelar
            cuando quieras y tu sitio se mantiene activo hasta el final del período
            pagado.
          </p>

          <h3>¿Hay costos ocultos?</h3>
          <p>
            No. El precio que ves es lo que pagas. Hosting, SSL, SEO, panel de edición
            y soporte están incluidos. Lo único que se paga aparte es el dominio
            personalizado (si lo deseas) que se contrata directamente con un proveedor
            de dominios.
          </p>

          <h3>¿Puedo empezar gratis?</h3>
          <p>
            Sí. Puedes <Link href="/registro">crear tu cuenta</Link> y explorar la
            plataforma sin costo. Tu sitio web queda publicado con una URL de INDEXA
            gratuita mientras decides qué plan te conviene.
          </p>

          <h2>Sobre tu página web</h2>

          <h3>¿Cuánto tiempo tarda en estar lista mi página web?</h3>
          <p>
            Con INDEXA, tu sitio web está listo en <strong>menos de 3 minutos</strong>.
            Solo necesitas ingresar los datos de tu negocio (nombre, descripción,
            servicios, teléfono) y la plataforma genera automáticamente un sitio
            profesional completo.
          </p>

          <h3>¿Puedo editar mi página web yo mismo?</h3>
          <p>
            Sí. Tu dashboard incluye un <strong>panel de edición visual</strong> donde
            puedes cambiar textos, imágenes, colores, servicios, horarios y datos de
            contacto. No necesitas saber programar. Los cambios se publican al instante.
          </p>

          <h3>¿Mi página se verá bien en celulares?</h3>
          <p>
            Sí. Todos los sitios son <strong>100% responsive</strong>. Se adaptan
            automáticamente a celular, tablet y computadora. Esto es crítico porque
            el 85% de las búsquedas locales en México se hacen desde el celular.
          </p>

          <h3>¿Puedo usar mi propio diseño o marca?</h3>
          <p>
            Sí. Puedes personalizar:
          </p>
          <ul>
            <li>Logo de tu negocio</li>
            <li>Color principal (para que coincida con tu marca)</li>
            <li>Tipografía</li>
            <li>Imágenes de portada y galería</li>
            <li>Elegir entre 3 plantillas profesionales</li>
          </ul>

          <h3>¿Puedo cambiar la plantilla después?</h3>
          <p>
            Sí. Puedes cambiar entre las 3 plantillas (Moderno, Elegante, Minimalista)
            en cualquier momento sin perder tu contenido.
          </p>

          <h2>Sobre dominio y hosting</h2>

          <h3>¿Qué es un dominio?</h3>
          <p>
            El dominio es tu dirección en internet, por ejemplo <code>tunegocio.com</code>.
            Es lo que las personas escriben en el navegador para llegar a tu sitio.
            INDEXA te proporciona una URL gratuita tipo <code>indexa.mx/sitio/tunegocio</code>.
            Si quieres tu propio dominio personalizado, lo puedes contratar por separado.
          </p>

          <h3>¿Dónde compro mi dominio?</h3>
          <p>
            Puedes comprar dominios en proveedores como GoDaddy, Namecheap, Google
            Domains o Hostgator. El costo promedio es de <strong>$200-$500 MXN al año</strong>
            para dominios .com o .com.mx.
          </p>

          <h3>¿Qué es el hosting y está incluido?</h3>
          <p>
            El hosting es el servicio que mantiene tu página web accesible en internet
            las 24 horas. Con INDEXA, el hosting está <strong>incluido en todos los
            planes</strong> sin costo adicional. Tu sitio se aloja en servidores de
            alta velocidad con 99.9% de uptime.
          </p>

          <h2>Sobre SEO y Google</h2>

          <h3>¿Cómo me encuentran los clientes en Google?</h3>
          <p>
            INDEXA implementa automáticamente <strong>SEO local</strong> con datos
            estructurados Schema.org. Esto le dice a Google tu nombre, dirección,
            teléfono, servicios, horarios y ubicación GPS. Los negocios empiezan a
            aparecer en búsquedas locales en las primeras 2-8 semanas.
          </p>
          <p>
            Aprende más en nuestra{" "}
            <Link href="/guia/seo-local-mexico">guía completa de SEO local</Link>.
          </p>

          <h3>¿Cuánto tarda en aparecer mi negocio en Google?</h3>
          <p>
            Con los datos estructurados que INDEXA implementa automáticamente, Google
            puede indexar tu negocio en <strong>los primeros 14 días</strong>. Los
            resultados completos de SEO local generalmente se ven entre 2 y 8 semanas,
            dependiendo de la competencia en tu zona y categoría.
          </p>

          <h3>¿También necesito Google Business Profile?</h3>
          <p>
            Sí, es altamente recomendable. Tu sitio web y tu Google Business Profile
            son complementarios. El perfil te da visibilidad en Google Maps, y tu
            sitio web proporciona información detallada con datos estructurados.
            Aprende cómo configurarlo en nuestra{" "}
            <Link href="/guia/google-mi-negocio">guía de Google Business Profile</Link>.
          </p>

          <h2>Sobre WhatsApp y contacto</h2>

          <h3>¿Cómo funciona el botón de WhatsApp?</h3>
          <p>
            Tu sitio incluye un <strong>botón flotante de WhatsApp</strong> visible en
            todas las páginas. Cuando un visitante hace clic, se abre una conversación
            directa contigo en WhatsApp con un mensaje predeterminado. No necesitas
            instalar nada — funciona con tu WhatsApp personal o Business.
          </p>

          <h3>¿Puedo recibir formularios de contacto?</h3>
          <p>
            Sí. Además del botón de WhatsApp, tu sitio tiene secciones de contacto
            que muestran tu teléfono, email y dirección. Los visitantes pueden
            contactarte por el canal que prefieran.
          </p>

          <h2>Sobre redes sociales</h2>

          <h3>¿Necesito redes sociales si ya tengo página web?</h3>
          <p>
            Son complementarios. Tu página web es tu base (aparece en Google, la
            controlas al 100%). Las redes sociales son canales de descubrimiento.
            La estrategia ideal: <strong>usa redes para atraer personas y tu web
            para convertirlas en clientes</strong>.
          </p>

          <h3>¿INDEXA se conecta con mis redes sociales?</h3>
          <p>
            Sí. Tu sitio muestra enlaces a todas tus redes sociales. Además, el
            <strong> Bio Link</strong> profesional conecta todas tus plataformas en
            una sola página que puedes compartir en Instagram, TikTok y Facebook.
          </p>

          <div className="not-prose mt-12 rounded-2xl border border-cyan-200 bg-cyan-50 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Todavía tienes dudas?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Escríbenos por WhatsApp y te asesoramos gratis.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Comenzar Gratis
              </Link>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20tengo%20una%20duda%20sobre%20INDEXA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-bold text-indexa-gray-dark transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>

          <div className="not-prose mt-12 border-t border-gray-100 pt-10">
            <h3 className="text-lg font-bold text-indexa-gray-dark">Continúa aprendiendo</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/guia/beneficios-pagina-web" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">10 Beneficios de una Página Web</p>
                <p className="mt-1 text-xs text-gray-500">Por qué tu negocio necesita presencia digital</p>
              </Link>
              <Link href="/guia/que-incluye-indexa" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">¿Qué Incluye INDEXA?</p>
                <p className="mt-1 text-xs text-gray-500">Desglose completo de todo lo que recibes</p>
              </Link>
              <Link href="/guia/whatsapp-business-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">WhatsApp Business para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Convierte chats en ventas reales</p>
              </Link>
              <Link href="/guia/google-mi-negocio" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">Google Business Profile</p>
                <p className="mt-1 text-xs text-gray-500">Aparece en Google Maps con tu negocio</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
