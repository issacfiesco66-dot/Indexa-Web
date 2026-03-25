"use client";

import FAQItem, { type FAQItemData } from "./FAQItem";

const FAQS: FAQItemData[] = [
  {
    question: "¿Por qué es gratis el plan Starter?",
    answer:
      "Queremos que cada negocio en México tenga presencia digital profesional sin importar su presupuesto. El plan Starter incluye todo lo esencial: sitio web con IA, WhatsApp integrado y SEO básico. Cuando crezcas y necesites más herramientas como dominio propio, analíticas avanzadas o campañas de ads, puedes subir de plan sin complicaciones.",
  },
  {
    question: "¿Necesito saber programar para usar INDEXA?",
    answer:
      "Para nada. Nuestra inteligencia artificial genera tu sitio web completo en minutos. Solo necesitas llenar tu nombre de negocio, descripción, número de WhatsApp y listo. Todo se edita desde un panel visual — sin código, sin complicaciones. Si necesitas ayuda, nuestro equipo te guía paso a paso.",
  },
  {
    question: "¿Cómo cancelo mi suscripción?",
    answer:
      "Puedes cancelar en cualquier momento desde tu Dashboard, en la sección de suscripción. No hay contratos, no hay penalizaciones. Si cancelas, tu sitio sigue activo hasta que termine tu periodo pagado. También puedes contactarnos por WhatsApp y lo hacemos por ti al instante.",
  },
  {
    question: "¿Mi sitio aparece en Google automáticamente?",
    answer:
      "Sí. Cada sitio creado con INDEXA incluye optimización SEO automática: meta-tags, Schema.org (JSON-LD), títulos optimizados y estructura pensada para posicionar en búsquedas locales. En el plan Profesional, además puedes configurar tu ciudad, categoría y coordenadas para dominar las búsquedas de tu zona.",
  },
  {
    question: "¿Puedo usar mi propio dominio?",
    answer:
      "Sí, con el plan Profesional o Enterprise puedes conectar tu dominio personalizado (por ejemplo, www.tunegocio.com). Si aún no tienes uno, te ayudamos a registrarlo. Tu sitio siempre estará disponible también en tu URL de INDEXA.",
  },
  {
    question: "¿Qué pasa si necesito ayuda o soporte?",
    answer:
      "Todos los planes incluyen soporte. En Starter tienes soporte por email, en Profesional soporte prioritario, y en Enterprise un asesor dedicado. También puedes contactarnos directamente por WhatsApp en cualquier momento.",
  },
  // ── Long-tail SEO + Featured Snippets + Voice Search ──────────────
  {
    question: "¿Cuánto cuesta crear una página web profesional para un negocio en México en 2026?",
    answer:
      "Con INDEXA, un sitio web profesional generado con inteligencia artificial cuesta desde $299 MXN/mes (plan Starter). Esto incluye diseño profesional, botón de WhatsApp, SEO básico y certificado SSL. En comparación, un desarrollador freelance cobra entre $5,000 y $15,000 MXN por un sitio similar sin mantenimiento ni SEO incluido. El plan Profesional a $599 MXN/mes agrega panel CMS, SEO avanzado con Schema.org y estadísticas de visitas.",
  },
  {
    question: "¿Qué es Schema.org y por qué lo necesita mi negocio local?",
    answer:
      "Schema.org es un vocabulario de datos estructurados que ayuda a Google y otros buscadores a entender tu negocio: nombre, ubicación, servicios, horarios y más. INDEXA implementa automáticamente el marcado LocalBusiness en formato JSON-LD en cada sitio, lo que mejora tu aparición en resultados de búsqueda locales, Google Maps y asistentes de voz como Google Assistant y Siri.",
  },
  {
    question: "¿Cómo me ayuda la inteligencia artificial a crear mi sitio web?",
    answer:
      "La IA de INDEXA analiza el nombre de tu negocio, tu descripción y tu categoría para generar automáticamente un sitio web completo: textos optimizados para SEO, estructura profesional, colores coherentes y secciones personalizadas. El proceso toma menos de 3 minutos y no requiere conocimiento técnico. Además, puedes editar cualquier sección desde el panel visual.",
  },
  {
    question: "¿INDEXA funciona para cualquier tipo de negocio en México?",
    answer:
      "Sí. INDEXA está diseñado para PYMES de cualquier giro: restaurantes, tiendas, talleres mecánicos, consultorios médicos, estéticas, despachos contables, servicios de plomería, pastelerías y más. Cada sitio se adapta a tu categoría con SEO local optimizado para que tus clientes potenciales te encuentren en Google cuando buscan servicios en tu ciudad.",
  },
  {
    question: "¿Qué ventaja tiene INDEXA sobre crear un sitio en Wix o WordPress?",
    answer:
      "INDEXA se diferencia en tres puntos clave: 1) Velocidad: tu sitio está listo en minutos, no en días. 2) SEO local automático: cada sitio incluye Schema.org LocalBusiness, meta-tags optimizados y estructura para Google Maps sin configuración manual. 3) WhatsApp nativo: botón de contacto directo integrado con tracking de conversiones. Además, no necesitas aprender a usar un editor complejo — la IA se encarga del diseño y el contenido.",
  },
];

// JSON-LD FAQPage schema for Google rich results
function buildFAQSchema(faqs: FAQItemData[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export default function FAQ() {
  const jsonLd = buildFAQSchema(FAQS);

  return (
    <section id="faq" className="relative bg-white py-20 sm:py-28">
      {/* JSON-LD FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indexa-blue/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indexa-blue"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-indexa-gray-dark sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-gray-500">
            Todo lo que necesitas saber antes de crear tu sitio web profesional con INDEXA.
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-12 rounded-2xl border border-gray-200 bg-white px-6 shadow-sm sm:px-8">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">¿Listo para impulsar tu negocio?</p>
          <a
            href="/registro"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m13 2 1.5 1.5M16.5 5.5 18 4" />
              <path d="m5 22 14-14" />
              <path d="m14.5 3.5 5 5" />
              <path d="m3.5 18.5 3 3" />
              <path d="M2 22h4" />
            </svg>
            Comenzar Gratis
          </a>
        </div>
      </div>
    </section>
  );
}
