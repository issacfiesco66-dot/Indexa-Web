"use client";

import FAQItem, { type FAQItemData } from "@/components/FAQItem";
import Link from "next/link";

const HELP_FAQS: FAQItemData[] = [
  {
    question: "¿Cómo mejorar mi SEO Local?",
    answer:
      "Ve a tu Dashboard → pestaña General → sección 'SEO Local'. Llena los campos de Categoría (ej. Tlapalería, Restaurante), Ciudad (ej. Chalco, CDMX), y tus coordenadas de Google Maps. Esto genera automáticamente meta-tags optimizados y un schema de LocalBusiness que ayuda a Google a mostrar tu negocio en búsquedas locales como 'tlapalería cerca de mí'.",
  },
  {
    question: "¿Cómo cambio mis horarios de atención?",
    answer:
      "En tu Dashboard, ve a la pestaña Contacto y busca el campo 'Horarios'. Escribe tus horarios en formato legible, por ejemplo: 'Lunes a Viernes 9am-7pm, Sábado 9am-2pm'. Esta información se muestra en tu sitio web y en los resultados de Google.",
  },
  {
    question: "¿Cómo conecto mi dominio personalizado?",
    answer:
      "Con el plan Profesional o Enterprise puedes usar tu propio dominio (ej. www.tunegocio.com). Contacta a tu asesor INDEXA por WhatsApp y te guiaremos paso a paso para configurar los DNS. El proceso toma menos de 24 horas.",
  },
  {
    question: "¿Cómo subo mi logo o cambio mis colores?",
    answer:
      "En tu Dashboard, ve a la pestaña Visual. Ahí puedes subir tu logo (se recomienda formato PNG o SVG cuadrado), elegir tu color principal de una paleta predefinida o usar un color personalizado, y seleccionar el estilo de diseño de tu sitio web (Moderno, Elegante o Minimalista).",
  },
  {
    question: "¿Cómo veo las estadísticas de mi sitio?",
    answer:
      "En la parte superior de tu Dashboard verás dos métricas clave: 'Vistas totales' (cuántas personas han visitado tu sitio) y 'Clics al WhatsApp' (cuántas personas tocaron el botón de WhatsApp para contactarte). Estas métricas se actualizan en tiempo real.",
  },
  {
    question: "¿Cómo cambio mi plan o método de pago?",
    answer:
      "Si ya tienes un plan activo, verás un botón 'Administrar suscripción' en tu Dashboard. Desde ahí puedes cambiar de plan, actualizar tu tarjeta, ver facturas o cancelar. Si aún no tienes plan, elige uno de los planes disponibles y serás guiado al proceso de pago seguro con Stripe.",
  },
  {
    question: "¿Cómo edito el contenido de mi sitio web?",
    answer:
      "Todo se edita desde tu Dashboard. En la pestaña General puedes cambiar el nombre, descripción y eslogan. En Contacto puedes actualizar tu WhatsApp, email y dirección. En Visual puedes cambiar colores, logo y plantilla. Los cambios se aplican al dar clic en 'Guardar'.",
  },
  {
    question: "¿Puedo conectar mis redes sociales y anuncios?",
    answer:
      "Sí. Desde tu Dashboard puedes acceder a la sección de Marketing para conectar Facebook/Instagram Ads, y a la sección de TikTok Ads. Estas herramientas te permiten lanzar y gestionar campañas publicitarias directamente desde INDEXA sin necesidad de entrar a cada plataforma por separado.",
  },
];

const SUPPORT_WHATSAPP = "5512345678";
const SUPPORT_MESSAGE = encodeURIComponent(
  "Hola, soy cliente de INDEXA y necesito ayuda con mi sitio web."
);

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-indexa-gray-light">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0a0e27] shadow-lg shadow-black/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
              <span className="text-sm font-black text-white">IX</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">INDEXA</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indexa-blue/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indexa-blue">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-indexa-gray-dark sm:text-3xl">
            Centro de Ayuda
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
            Encuentra respuestas rápidas sobre cómo sacar el máximo provecho de INDEXA.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-6 shadow-sm sm:px-8">
          {HELP_FAQS.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Support CTA */}
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-indexa-gray-dark">¿No encontraste lo que buscas?</h3>
          <p className="mt-2 text-sm text-gray-500">
            Nuestro equipo está listo para ayudarte. Escríbenos y te respondemos en minutos.
          </p>
          <a
            href={`https://wa.me/+52${SUPPORT_WHATSAPP}?text=${SUPPORT_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1fb855] hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hablar con un asesor
          </a>
        </div>

        {/* Quick links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indexa-blue/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indexa-blue">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-indexa-gray-dark">Mi Dashboard</p>
              <p className="text-xs text-gray-400">Edita tu sitio web</p>
            </div>
          </Link>
          <Link
            href="/dashboard/marketing"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indexa-orange">
                <path d="m3 11 18-5v12L3 14v-3z" />
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-indexa-gray-dark">Marketing</p>
              <p className="text-xs text-gray-400">Facebook e Instagram Ads</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
