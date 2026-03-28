import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "10 Beneficios de Tener una Página Web para tu Negocio en México (2026)",
  description:
    "Descubre los beneficios reales de tener una página web profesional para tu PYME: más clientes, credibilidad, ventas 24/7, SEO local y mucho más. Guía completa con datos para México.",
  alternates: { canonical: "/guia/beneficios-pagina-web" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "10 Beneficios de Tener una Página Web para tu Negocio en México",
  description:
    "Beneficios reales de una página web profesional para PYMES mexicanas: más clientes, credibilidad, ventas 24/7 y SEO local.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-02-10",
  dateModified: "2026-03-27",
  mainEntityOfPage: "https://indexa.mx/guia/beneficios-pagina-web",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: "https://indexa.mx" },
    { "@type": "ListItem", position: 2, name: "Guías", item: "https://indexa.mx/guia" },
    { "@type": "ListItem", position: 3, name: "Beneficios de una Página Web" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Realmente necesito una página web si ya tengo redes sociales?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Las redes sociales son canales de descubrimiento, pero tu página web es el único espacio digital que controlas al 100%. En redes dependes de algoritmos que cambian constantemente. Tu sitio web te da credibilidad profesional, aparece en Google, permite integrar WhatsApp, mostrar tus servicios completos y captar clientes las 24 horas sin depender de terceros.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta tener una página web en México?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Los precios varían mucho. Un freelance cobra entre $5,000 y $15,000 MXN sin mantenimiento. Una agencia entre $20,000 y $80,000 MXN. Con plataformas como INDEXA, puedes tener un sitio web profesional desde $299 MXN/mes con hosting, SSL, SEO automático y panel de edición incluidos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuántos clientes nuevos puedo conseguir con una página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Depende de tu sector y ubicación, pero negocios locales con sitio web optimizado para SEO local reportan entre 10 y 50 contactos nuevos al mes. Con WhatsApp integrado, la tasa de conversión aumenta significativamente porque reduces la fricción de contacto.",
      },
    },
    {
      "@type": "Question",
      name: "¿Mi negocio es muy pequeño para tener página web?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No existe un negocio demasiado pequeño para tener presencia digital. Un plomero independiente, una estética de barrio o una taquería pueden beneficiarse enormemente de aparecer en Google cuando alguien busca sus servicios cerca. De hecho, los negocios pequeños son los que más impacto ven al tener su primera página web.",
      },
    },
  ],
};

export default function GuiaBeneficiosPaginaWeb() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Beneficios de una Página Web</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              10 Beneficios de Tener una{" "}
              <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                Página Web
              </span>{" "}
              para tu Negocio
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              ¿Todavía te preguntas si tu negocio necesita una página web? Aquí te
              damos los datos concretos de por qué una presencia digital profesional
              transforma las ventas de cualquier PYME en México.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Por qué tu negocio necesita una página web en 2026?</h2>
          <p>
            En México, <strong>más de 100 millones de personas tienen acceso a internet</strong>
            y el 85% de los consumidores investigan en línea antes de comprar un producto
            o contratar un servicio. Si tu negocio no aparece en Google, simplemente
            no existes para la mayoría de tus clientes potenciales.
          </p>
          <p>
            Una página web no es un gasto — es la inversión con mayor retorno que puede
            hacer una PYME. A continuación, te detallamos los 10 beneficios concretos
            que obtienes al tener presencia digital profesional.
          </p>

          <h2>1. Credibilidad y confianza instantánea</h2>
          <p>
            El <strong>75% de los consumidores juzgan la credibilidad de un negocio
            por su sitio web</strong>. Un sitio profesional con diseño moderno, certificado
            SSL (el candado verde en la barra de navegación) y datos de contacto claros
            genera confianza inmediata. Sin página web, muchos clientes potenciales
            simplemente no te tomarán en serio.
          </p>
          <p>
            Con <Link href="/">INDEXA</Link>, cada sitio incluye certificado SSL gratuito,
            diseño profesional responsive y toda la información de tu negocio presentada
            de forma clara y atractiva.
          </p>

          <h2>2. Ventas y contactos las 24 horas, los 7 días</h2>
          <p>
            Tu negocio físico cierra por la noche, pero tu página web trabaja sin
            descanso. Los clientes pueden conocer tus servicios, ver tu galería de
            trabajo, leer tus horarios y contactarte por WhatsApp en cualquier momento.
            Muchos negocios reportan que <strong>entre el 30% y 50% de sus contactos
            nuevos llegan fuera del horario laboral</strong>.
          </p>

          <h2>3. Apareces en Google (SEO local)</h2>
          <p>
            Cuando alguien busca <em>&quot;dentista en Polanco&quot;</em> o <em>&quot;mecánico
            cerca de mí&quot;</em> en Google, solo aparecen negocios que tienen presencia
            digital. Una página web con <strong>datos estructurados Schema.org</strong> le
            dice a Google exactamente qué ofreces, dónde estás y cómo contactarte.
          </p>
          <p>
            INDEXA implementa automáticamente el schema <code>LocalBusiness</code> con
            tu nombre, dirección, teléfono, coordenadas GPS, horarios y servicios — sin
            que tú configures nada. Aprende más en nuestra{" "}
            <Link href="/guia/seo-local-mexico">guía de SEO local para México</Link>.
          </p>

          <h2>4. WhatsApp integrado = más conversiones</h2>
          <p>
            En México, <strong>WhatsApp es el canal de comunicación #1 para negocios</strong>.
            Un botón de WhatsApp integrado en tu sitio web reduce la fricción entre
            &quot;me interesa&quot; y &quot;quiero comprar&quot;. Los negocios con WhatsApp
            en su web reportan hasta <strong>3 veces más contactos</strong> que los que
            solo ponen su teléfono.
          </p>
          <p>
            Cada sitio creado con INDEXA incluye un botón flotante de WhatsApp que se
            muestra en todas las páginas, listo para recibir mensajes de tus clientes.
          </p>

          <h2>5. Independencia de las redes sociales</h2>
          <p>
            Facebook e Instagram cambian sus algoritmos constantemente. Un día tu
            publicación llega a 1,000 personas, al siguiente a 50. Tu página web es
            el <strong>único canal digital que controlas al 100%</strong>: tú decides
            qué se muestra, cómo se muestra y no dependes de ningún algoritmo.
          </p>
          <p>
            Las redes sociales son excelentes para descubrimiento, pero tu sitio web
            es tu base de operaciones digital. La estrategia ganadora es usar redes
            para atraer tráfico y tu web para convertir visitantes en clientes.
          </p>

          <h2>6. Muestras tu trabajo y servicios de forma profesional</h2>
          <p>
            Una galería de tus trabajos realizados, una lista detallada de servicios
            con descripciones y una sección de reseñas de clientes satisfechos hacen
            que los visitantes lleguen prácticamente convencidos de comprarte. En redes
            sociales, tu contenido se pierde en el feed; en tu web, todo está organizado
            y accesible.
          </p>

          <h2>7. Competir con negocios más grandes</h2>
          <p>
            Una página web profesional <strong>nivela el campo de juego</strong>. Un
            pequeño taller mecánico con un sitio web bien optimizado puede aparecer en
            Google arriba de cadenas grandes si tiene mejor SEO local. Tu cercanía
            geográfica al cliente es una ventaja competitiva enorme que solo se activa
            con presencia digital.
          </p>

          <h2>8. Medir resultados con datos reales</h2>
          <p>
            A diferencia de un volante o un anuncio en el periódico, una página web te
            permite <strong>medir exactamente cuántas personas te visitaron</strong>,
            desde dónde llegaron, qué servicios consultaron y cuántos te contactaron.
            Con estos datos puedes tomar decisiones informadas sobre tu negocio.
          </p>
          <p>
            INDEXA incluye un panel de analytics integrado donde ves tus visitas, clics
            en WhatsApp y tendencias — todo desde tu celular o computadora.
          </p>

          <h2>9. Base para marketing digital</h2>
          <p>
            Si quieres invertir en publicidad con Meta Ads (Facebook/Instagram) o
            TikTok Ads, necesitas un destino para tu tráfico. Enviar personas a un
            perfil de Facebook es mucho menos efectivo que enviarlas a una página web
            profesional con toda tu información, galería y botón de contacto.
          </p>
          <p>
            Tu sitio web es el <strong>centro de tu estrategia de marketing digital</strong>.
            Conoce más en nuestra{" "}
            <Link href="/guia/marketing-digital-pymes">guía de marketing digital para PYMES</Link>.
          </p>

          <h2>10. Es más accesible de lo que piensas</h2>
          <p>
            Muchos dueños de PYMES creen que una página web profesional cuesta
            decenas de miles de pesos. La realidad es que con plataformas modernas
            como INDEXA, puedes tener un sitio web completo <strong>desde $299 MXN/mes</strong>
            — menos de lo que gastas en café al mes.
          </p>
          <p>
            Incluye diseño profesional, hosting, certificado SSL, SEO automático,
            WhatsApp integrado, panel de edición y soporte. Sin contratos, sin costos
            ocultos y sin necesidad de conocimientos técnicos.
          </p>

          <h2>Preguntas frecuentes</h2>

          <h3>¿Realmente necesito una página web si ya tengo redes sociales?</h3>
          <p>
            Sí. Las redes sociales son canales de descubrimiento, pero tu página web
            es el único espacio digital que controlas al 100%. En redes dependes de
            algoritmos que cambian constantemente. Tu sitio web te da credibilidad
            profesional, aparece en Google y permite captar clientes las 24 horas.
          </p>

          <h3>¿Cuántos clientes nuevos puedo conseguir con una página web?</h3>
          <p>
            Depende de tu sector y ubicación, pero negocios locales con sitio web
            optimizado para SEO local reportan entre <strong>10 y 50 contactos
            nuevos al mes</strong>. Con WhatsApp integrado, la tasa de conversión
            aumenta significativamente.
          </p>

          <h3>¿Mi negocio es muy pequeño para tener página web?</h3>
          <p>
            No existe un negocio demasiado pequeño. Un plomero independiente, una
            estética de barrio o una taquería pueden beneficiarse enormemente de
            aparecer en Google. De hecho, los negocios pequeños son los que más
            impacto ven al tener su primera página web.
          </p>

          <div className="not-prose mt-12 rounded-2xl border border-indexa-orange/20 bg-indexa-orange/5 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Listo para llevar tu negocio a internet?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Crea tu página web profesional en minutos. Sin conocimientos técnicos.
            </p>
            <Link
              href="/registro"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Comenzar Gratis
            </Link>
          </div>

          <div className="not-prose mt-12 border-t border-gray-100 pt-10">
            <h3 className="text-lg font-bold text-indexa-gray-dark">Continúa aprendiendo</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Link href="/guia/que-incluye-indexa" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">¿Qué Incluye INDEXA?</p>
                <p className="mt-1 text-xs text-gray-500">Todo lo que recibes con tu plan — desglose completo</p>
              </Link>
              <Link href="/guia/seo-local-mexico" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">SEO Local en México</p>
                <p className="mt-1 text-xs text-gray-500">Cómo aparecer primero en Google Maps</p>
              </Link>
              <Link href="/guia/whatsapp-business-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">WhatsApp Business para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Convierte chats en ventas reales</p>
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
