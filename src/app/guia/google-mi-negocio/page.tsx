import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export const metadata: Metadata = {
  title: "Google Business Profile (Mi Negocio): Guía Completa para PYMES en México (2026)",
  description:
    "Aprende a crear, optimizar y posicionar tu ficha de Google Business Profile (antes Google Mi Negocio) para aparecer en Google Maps, el Local Pack y atraer clientes locales a tu negocio en México.",
  alternates: { canonical: "/guia/google-mi-negocio" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Google Business Profile: Guía Completa para PYMES en México",
  description:
    "Cómo crear y optimizar tu Google Business Profile para aparecer en Google Maps y atraer clientes locales.",
  author: { "@type": "Organization", name: "INDEXA" },
  publisher: { "@type": "Organization", name: "INDEXA" },
  datePublished: "2026-03-05",
  dateModified: "2026-03-27",
  mainEntityOfPage: `${SITE_URL}/guia/google-mi-negocio`,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "INDEXA", item: `${SITE_URL}` },
    { "@type": "ListItem", position: 2, name: "Guías", item: `${SITE_URL}/guia` },
    { "@type": "ListItem", position: 3, name: "Google Business Profile" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Google Business Profile es gratuito?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Google Business Profile (antes Google Mi Negocio) es completamente gratuito. Puedes crear tu perfil, agregar fotos, responder reseñas y publicar actualizaciones sin ningún costo. Es una de las herramientas gratuitas más poderosas para negocios locales.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto tarda en aparecer mi negocio en Google Maps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Después de crear y verificar tu perfil, tu negocio aparece en Google Maps en 1-3 días. La verificación puede ser por correo postal (1-2 semanas), por teléfono (inmediata) o por email (1-3 días). Una vez verificado, tu perfil se activa y empiezas a aparecer en búsquedas locales.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo consigo más reseñas para mi negocio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Las mejores estrategias son: 1) Pedir reseñas al terminar un servicio satisfactorio, 2) Enviar un enlace directo por WhatsApp, 3) Crear un código QR con el link de reseñas, 4) Responder siempre a las reseñas existentes (positivas y negativas). Nunca compres reseñas falsas — Google las detecta y puede penalizar tu perfil.",
      },
    },
    {
      "@type": "Question",
      name: "¿Necesito página web si ya tengo Google Business Profile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, son complementarios. Google Business Profile te da visibilidad en Maps y el Local Pack. Tu sitio web proporciona información detallada, datos estructurados Schema.org, galería de trabajos y botón de WhatsApp. Google favorece a negocios que tienen ambos, porque demuestra mayor legitimidad y ofrece mejor experiencia al usuario.",
      },
    },
  ],
};

export default function GuiaGoogleMiNegocio() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <nav className="mb-6 text-sm text-white/40">
              <Link href="/" className="hover:text-white/70">INDEXA</Link>
              {" / "}
              <span className="text-white/60">Google Business Profile</span>
            </nav>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Google Business Profile:{" "}
              <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">
                Aparece en Google Maps
              </span>{" "}
              y Atrae Clientes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Tu ficha de Google Business Profile es la herramienta gratuita más
              poderosa para atraer clientes locales. Aprende a crearla, optimizarla
              y posicionarla para dominar las búsquedas en tu zona.
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="prose prose-lg prose-gray mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h2>¿Qué es Google Business Profile y por qué es vital?</h2>
          <p>
            Google Business Profile (antes conocido como Google Mi Negocio) es una
            herramienta <strong>gratuita</strong> de Google que permite a los negocios
            gestionar cómo aparecen en Google Search y Google Maps. Cuando alguien
            busca &quot;restaurante cerca de mí&quot; o &quot;dentista en Guadalajara&quot;,
            los primeros resultados que ve son fichas de Google Business Profile.
          </p>
          <p>
            Estos resultados se conocen como el <strong>&quot;Local Pack&quot;</strong> — los 3
            negocios destacados con mapa que Google muestra para búsquedas con
            intención local. Aparecer aquí puede significar decenas de clientes
            nuevos cada mes.
          </p>

          <h2>Datos que demuestran su importancia</h2>
          <ul>
            <li><strong>97% de los consumidores</strong> buscan negocios locales en internet</li>
            <li><strong>El 46% de las búsquedas en Google</strong> tienen intención local</li>
            <li><strong>88% de los usuarios</strong> que buscan negocios locales en su celular visitan o llaman al negocio en las siguientes 24 horas</li>
            <li>Negocios con perfil completo reciben <strong>7 veces más clics</strong> que los que no tienen</li>
            <li>Las fotos en tu perfil generan <strong>42% más solicitudes de direcciones</strong> y 35% más clics a tu sitio web</li>
          </ul>

          <h2>Cómo crear tu Google Business Profile paso a paso</h2>

          <h3>Paso 1: Accede a Google Business Profile</h3>
          <p>
            Ve a <strong>business.google.com</strong> e inicia sesión con tu cuenta de
            Google (Gmail). Si no tienes una, crea una nueva — es gratuita.
          </p>

          <h3>Paso 2: Agrega tu negocio</h3>
          <p>
            Busca el nombre de tu negocio. Si ya existe (quizás creado automáticamente
            por Google), reclámalo. Si no, selecciona &quot;Agregar tu negocio a Google&quot;.
          </p>

          <h3>Paso 3: Completa la información básica</h3>
          <ul>
            <li><strong>Nombre del negocio</strong> — Usa el nombre oficial, exactamente como aparece en tu sitio web</li>
            <li><strong>Categoría principal</strong> — Elige la más específica posible (ej. &quot;Salón de belleza&quot; en vez de &quot;Negocio local&quot;)</li>
            <li><strong>Dirección</strong> — Dirección completa con calle, colonia, código postal y ciudad</li>
            <li><strong>Teléfono</strong> — El mismo número que aparece en tu sitio web (consistencia NAP)</li>
            <li><strong>Sitio web</strong> — Enlace a tu página de INDEXA</li>
          </ul>

          <h3>Paso 4: Verifica tu negocio</h3>
          <p>
            Google necesita verificar que eres el dueño real del negocio. Los métodos disponibles son:
          </p>
          <ul>
            <li><strong>Correo postal</strong> — Google envía una postal con un código a tu dirección (1-2 semanas)</li>
            <li><strong>Teléfono</strong> — Código por SMS o llamada (inmediato, no siempre disponible)</li>
            <li><strong>Email</strong> — Código por correo electrónico (1-3 días)</li>
            <li><strong>Video</strong> — Grabas un video corto de tu negocio (algunas categorías)</li>
          </ul>

          <h3>Paso 5: Optimiza tu perfil</h3>
          <p>
            Una vez verificado, completa absolutamente todos los campos disponibles.
            Google favorece los perfiles completos.
          </p>

          <h2>Cómo optimizar tu perfil para aparecer primero</h2>

          <h3>1. Fotos de alta calidad (mínimo 10)</h3>
          <p>
            Los perfiles con fotos reciben <strong>42% más solicitudes de direcciones</strong>.
            Sube:
          </p>
          <ul>
            <li>Foto de portada (la principal que ve todo mundo)</li>
            <li>Logo de tu negocio</li>
            <li>Fotos del interior y exterior de tu local</li>
            <li>Fotos de tus productos o trabajos realizados</li>
            <li>Fotos de tu equipo de trabajo</li>
          </ul>
          <p>
            Usa fotos reales, bien iluminadas y en alta resolución. Evita fotos de stock.
          </p>

          <h3>2. Horarios actualizados</h3>
          <p>
            Mantén tus horarios siempre actualizados, incluyendo horarios especiales
            para días festivos. Google penaliza los perfiles con horarios incorrectos
            cuando un usuario llega y encuentra cerrado.
          </p>

          <h3>3. Categorías secundarias</h3>
          <p>
            Además de tu categoría principal, agrega categorías secundarias relevantes.
            Por ejemplo, un &quot;Salón de belleza&quot; puede agregar &quot;Barbería&quot;,
            &quot;Spa de uñas&quot; y &quot;Servicio de peinado&quot;.
          </p>

          <h3>4. Descripción del negocio</h3>
          <p>
            Escribe una descripción de hasta 750 caracteres que incluya:
          </p>
          <ul>
            <li>Qué servicios ofreces</li>
            <li>Tu ubicación y zona de servicio</li>
            <li>Qué te diferencia de la competencia</li>
            <li>Palabras clave naturales (ej. &quot;dentista en Polanco&quot;, &quot;plomero en CDMX&quot;)</li>
          </ul>

          <h3>5. Servicios y productos</h3>
          <p>
            Agrega cada servicio o producto que ofreces con nombre, descripción y
            precio. Google muestra esta información directamente en los resultados
            de búsqueda.
          </p>

          <h3>6. Google Posts (publicaciones)</h3>
          <p>
            Publica actualizaciones regulares: ofertas, eventos, novedades o
            contenido útil. Los posts aparecen en tu ficha y le indican a Google
            que tu negocio está activo. <strong>Publica mínimo 1 vez por semana</strong>.
          </p>

          <h2>La importancia de las reseñas</h2>
          <p>
            Las reseñas son uno de los <strong>factores más importantes para el
            posicionamiento local</strong>. Google favorece a negocios con más
            reseñas y mejor calificación.
          </p>

          <h3>Cómo conseguir más reseñas</h3>
          <ol>
            <li><strong>Pide directamente</strong> — Al terminar un servicio satisfactorio, pide una reseña amablemente</li>
            <li><strong>Envía el enlace por WhatsApp</strong> — Comparte el link directo a tus reseñas después de cada trabajo</li>
            <li><strong>Crea un código QR</strong> — Ponlo en tu local, tarjetas de presentación o empaques</li>
            <li><strong>Facilita el proceso</strong> — Mientras más fácil sea dejar la reseña, más personas lo harán</li>
          </ol>

          <h3>Cómo responder reseñas</h3>
          <ul>
            <li><strong>Reseñas positivas</strong> — Agradece por nombre, menciona algo específico del servicio</li>
            <li><strong>Reseñas negativas</strong> — Responde profesionalmente, ofrece solución, lleva la conversación a privado</li>
            <li><strong>Nunca ignores una reseña</strong> — Responder a todas muestra compromiso con tus clientes</li>
          </ul>

          <h2>La conexión entre Google Business Profile y tu sitio web</h2>
          <p>
            Tu ficha de Google y tu sitio web se <strong>refuerzan mutuamente</strong>:
          </p>
          <ul>
            <li>Google verifica que los datos de tu perfil coincidan con tu sitio web (consistencia NAP)</li>
            <li>Los datos estructurados Schema.org de tu sitio confirman tu información a Google</li>
            <li>Tu sitio web proporciona contenido detallado que tu ficha no puede (galería completa, servicios detallados, blog)</li>
            <li>El enlace a tu sitio web genera tráfico directo desde Google Maps</li>
            <li>Negocios con ambos (perfil + web) reciben <strong>hasta 5x más visibilidad</strong></li>
          </ul>
          <p>
            Con <Link href="/">INDEXA</Link>, tu sitio web incluye automáticamente datos
            estructurados Schema.org que coinciden con tu ficha de Google, maximizando
            tu visibilidad en búsquedas locales.
          </p>

          <h2>Errores comunes que debes evitar</h2>
          <ol>
            <li><strong>Información inconsistente</strong> — Tu nombre, dirección y teléfono deben ser idénticos en todas las plataformas</li>
            <li><strong>Pocas fotos o fotos de baja calidad</strong> — Invierte tiempo en buenas fotos, valen oro</li>
            <li><strong>No responder reseñas</strong> — Especialmente las negativas, que necesitan respuesta profesional</li>
            <li><strong>Perfil incompleto</strong> — Cada campo vacío es una oportunidad perdida</li>
            <li><strong>No publicar Google Posts</strong> — Un perfil sin actividad reciente pierde posiciones</li>
            <li><strong>Comprar reseñas falsas</strong> — Google las detecta y puede suspender tu perfil</li>
            <li><strong>No verificar el perfil</strong> — Sin verificación, no tienes control sobre tu ficha</li>
          </ol>

          <h2>Checklist de optimización</h2>
          <ol>
            <li>Perfil verificado y reclamado</li>
            <li>Nombre exactamente igual al de tu sitio web</li>
            <li>Categoría principal y secundarias configuradas</li>
            <li>Dirección completa y precisa</li>
            <li>Teléfono correcto (mismo que en tu web)</li>
            <li>Enlace a tu sitio web de INDEXA</li>
            <li>Descripción completa con palabras clave locales</li>
            <li>Mínimo 10 fotos de alta calidad</li>
            <li>Horarios actualizados (incluyendo festivos)</li>
            <li>Servicios/productos con descripciones y precios</li>
            <li>Mínimo 1 Google Post por semana</li>
            <li>Reseñas respondidas (todas)</li>
            <li>Enlace de reseñas compartido con clientes</li>
          </ol>

          <h2>Preguntas frecuentes</h2>

          <h3>¿Google Business Profile es gratuito?</h3>
          <p>
            Sí. Es completamente gratuito. Puedes crear tu perfil, agregar fotos,
            responder reseñas y publicar actualizaciones sin ningún costo.
          </p>

          <h3>¿Cuánto tarda en aparecer mi negocio en Google Maps?</h3>
          <p>
            Después de crear y verificar tu perfil, apareces en 1-3 días. La
            verificación puede tomar de inmediato (por teléfono) a 2 semanas
            (por correo postal).
          </p>

          <h3>¿Necesito página web si ya tengo Google Business Profile?</h3>
          <p>
            Sí, son complementarios. Google favorece negocios que tienen ambos.
            Tu sitio web proporciona información detallada, datos estructurados
            Schema.org y WhatsApp integrado que tu ficha de Google no ofrece.
          </p>

          <div className="not-prose mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center">
            <p className="text-lg font-bold text-indexa-gray-dark">
              ¿Quieres maximizar tu visibilidad en Google?
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Google Business Profile + INDEXA = la combinación perfecta para negocios locales.
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
              <Link href="/guia/seo-local-mexico" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">SEO Local en México</p>
                <p className="mt-1 text-xs text-gray-500">Schema.org y datos estructurados para Google</p>
              </Link>
              <Link href="/guia/whatsapp-business-pymes" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">WhatsApp Business para PYMES</p>
                <p className="mt-1 text-xs text-gray-500">Convierte chats en ventas reales</p>
              </Link>
              <Link href="/guia/beneficios-pagina-web" className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <p className="text-sm font-bold text-indexa-gray-dark">10 Beneficios de una Página Web</p>
                <p className="mt-1 text-xs text-gray-500">Por qué tu negocio necesita presencia digital</p>
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
