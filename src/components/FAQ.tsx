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
