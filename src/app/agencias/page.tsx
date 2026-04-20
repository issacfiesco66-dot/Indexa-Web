import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Para Agencias — Multiplica tu Operación con INDEXA",
  description:
    "Gestiona 10, 50 o 200 clientes PYME desde un solo panel. Sitios con IA, SEO local y WhatsApp integrados. Descuentos por volumen, onboarding en minutos y margen recurrente para tu agencia.",
  alternates: { canonical: "/agencias" },
  openGraph: {
    title: "INDEXA para Agencias — Escala sin multiplicar tu equipo",
    description:
      "Multi-cliente, white-label disponible y margen recurrente. La plataforma de presencia digital con IA pensada para agencias mexicanas.",
    url: "/agencias",
    type: "website",
  },
};

const valueProps = [
  {
    title: "Panel multi-cliente",
    description:
      "Gestiona todos tus clientes desde un solo dashboard. Cambia entre cuentas con un click, edita sitios, revisa métricas y responde leads sin abrir 20 tabs.",
    iconPath:
      "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "Onboarding en 15 minutos",
    description:
      "Un cliente nuevo activo en menos tiempo que una reunión. La IA genera su sitio, SEO y estructura — tú te enfocas en la estrategia y la relación comercial.",
    gradient: "from-indexa-orange to-amber-400",
    iconPath:
      "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Margen recurrente",
    description:
      "Descuentos por volumen desde 10 cuentas. Revende con tu marca o cobra lo que decidas sobre el costo base. Ingresos mensuales predecibles por cada cliente activo.",
    gradient: "from-emerald-500 to-teal-400",
    iconPath:
      "M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z",
  },
  {
    title: "White-label disponible",
    description:
      "Planes Enterprise para agencias permiten co-branding: tus clientes ven tu marca, tu dominio y tu soporte. INDEXA queda invisible mientras tú escalas.",
    gradient: "from-purple-500 to-violet-400",
    iconPath:
      "M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z",
  },
  {
    title: "SEO y WhatsApp incluidos",
    description:
      "Cada sitio lleva Schema.org LocalBusiness, meta-tags, sitemap y botón de WhatsApp con tracking. Menos proveedores que coordinar, más valor que entregar.",
    gradient: "from-rose-500 to-pink-400",
    iconPath:
      "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z",
  },
  {
    title: "API y reportes",
    description:
      "Acceso a reportes consolidados de todos tus clientes: tráfico, leads, conversiones de WhatsApp, desempeño de campañas. Exporta o conecta a tu BI existente.",
    gradient: "from-amber-500 to-orange-400",
    iconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  },
];

const partnerSteps = [
  {
    number: "01",
    title: "Agenda una demo B2B",
    description:
      "Sesión de 30 min donde entendemos tu operación actual, número de clientes y modelo comercial. Te mostramos el panel multi-cliente en vivo.",
  },
  {
    number: "02",
    title: "Configuramos tu cuenta de agencia",
    description:
      "Creamos tu organización con todos los permisos, invitamos a tu equipo y migramos hasta 3 clientes piloto sin costo.",
  },
  {
    number: "03",
    title: "Escala sin fricción",
    description:
      "Cada cliente nuevo activo en minutos. Cobra lo que decidas sobre el costo base y conserva el margen recurrente mes a mes.",
  },
];

const agencyFaqs = [
  {
    question: "¿Cuál es el descuento por volumen para agencias?",
    answer:
      "Los descuentos empiezan desde 10 cuentas activas y crecen por tramo: 10-24 cuentas (15% off), 25-49 (25% off), 50-99 (35% off), 100+ (negociable). Los descuentos aplican sobre el precio público de cada plan (Starter, Profesional o Enterprise).",
  },
  {
    question: "¿Pueden ponerle mi marca a los sitios?",
    answer:
      "Sí. En el plan Enterprise ofrecemos white-label: dominio personalizado para el panel, eliminación del branding 'Hecho con INDEXA' en los sitios y soporte con tu marca. Ideal para agencias que venden presencia digital como servicio propio.",
  },
  {
    question: "¿Cómo es el modelo comercial con mis clientes?",
    answer:
      "Tú defines el precio que le cobras a tu cliente final. Nosotros te facturamos el costo base con descuento por volumen y tú emites tu propia factura con tu margen. Muchas agencias cobran entre 2-4x el costo INDEXA como servicio mensual gestionado.",
  },
  {
    question: "¿Puedo migrar clientes que ya tienen sitios en otras plataformas?",
    answer:
      "Sí. Nuestro equipo te ayuda a migrar sitios existentes de WordPress, Wix, GoDaddy, Squarespace y otras plataformas. Las primeras 3 migraciones son sin costo al firmar como agencia partner.",
  },
  {
    question: "¿Qué soporte recibe mi agencia?",
    answer:
      "Account manager dedicado, canal directo de Slack o WhatsApp con nuestro equipo técnico, capacitación inicial del equipo de tu agencia y prioridad en tickets. Las agencias con 50+ cuentas también reciben revisiones mensuales de performance.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "SaaS para agencias de marketing digital",
  provider: {
    "@type": "Organization",
    name: "INDEXA",
  },
  areaServed: {
    "@type": "Country",
    name: "México",
  },
  description:
    "Plataforma multi-cliente para agencias de marketing: sitios web con IA, SEO local y WhatsApp integrado. Descuentos por volumen y white-label disponible.",
};

export default function AgenciasPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute inset-0 opacity-[0.07]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,102,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-orange/15 blur-[100px]" />

          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-indexa-blue/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-blue">
              INDEXA para Agencias
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Multiplica tu operación{" "}
              <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                sin multiplicar tu equipo
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
              Gestiona 10, 50 o 200 clientes PYME desde un solo panel.
              Sitios con IA, SEO local y WhatsApp integrados. Descuentos por volumen
              y margen recurrente que crece cada mes.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#contacto-agencias"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5 hover:shadow-indexa-orange/40"
              >
                Agendar demo B2B
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a
                href="/#precios"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                Ver precios base
              </a>
            </div>

            <p className="mt-5 text-sm text-white/40">
              Respuesta en menos de 24 horas · Demo personalizada de 30 min
            </p>

            {/* Stats bar */}
            <div className="mt-14 grid w-full max-w-3xl mx-auto grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <div className="px-6 py-5 text-center">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">15 min</p>
                <p className="mt-1 text-xs font-medium text-white/50 sm:text-sm">Onboarding por cliente</p>
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">Hasta 35%</p>
                <p className="mt-1 text-xs font-medium text-white/50 sm:text-sm">Descuento por volumen</p>
              </div>
              <div className="px-6 py-5 text-center">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">2-4x</p>
                <p className="mt-1 text-xs font-medium text-white/50 sm:text-sm">Margen típico de reventa</p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
                Beneficios para socios
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-indexa-gray-dark sm:text-5xl">
                Todo lo que tu agencia necesita{" "}
                <span className="bg-gradient-to-r from-indexa-blue to-blue-400 bg-clip-text text-transparent">
                  para escalar
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
                Una sola plataforma que reemplaza hosting, CMS, SEO, WhatsApp Business y analítica. Menos proveedores, más margen.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {valueProps.map((prop) => (
                <div
                  key={prop.title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
                >
                  <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${prop.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />
                  <div className={`relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${prop.gradient}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-6 w-6 text-white"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={prop.iconPath} />
                    </svg>
                  </div>
                  <h3 className="relative text-lg font-bold text-indexa-gray-dark">{prop.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-gray-500">{prop.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works for agencies */}
        <section className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
          <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indexa-blue/5 blur-[120px]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
                Cómo iniciamos
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">
                De la demo al primer cliente activo en{" "}
                <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                  una semana
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
                Proceso de onboarding B2B pensado para agencias con operación existente.
              </p>
            </div>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {partnerSteps.map((step) => (
                <div
                  key={step.number}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <span className="inline-block bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-4xl font-black text-transparent">
                    {step.number}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI / Use case */}
        <section className="bg-indexa-gray-light py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg shadow-black/5 sm:p-12">
              <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
                Caso de uso típico
              </span>
              <h2 className="mt-4 text-2xl font-extrabold text-indexa-gray-dark sm:text-3xl">
                Agencia con 30 clientes PYME en su portafolio
              </h2>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">Antes</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    5 plataformas distintas (hosting, CMS, plugins SEO, analítica, WhatsApp). 2 personas full-time solo en mantenimiento. Onboarding de cliente: 1-2 semanas.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indexa-blue">Con INDEXA</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    Panel único. Onboarding en 15 min. Mantenimiento automático. Equipo liberado para estrategia y nuevos clientes en lugar de soporte técnico.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-green-600">Resultado</h3>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Capacidad para 3x más clientes sin contratar
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Margen recurrente predecible
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Menos churn por mejor SEO local
                    </li>
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-xs text-gray-400">
                * Números ilustrativos basados en conversaciones con agencias partner. Tu realidad dependerá de tu modelo operativo y tu portafolio.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-indexa-gray-dark sm:text-4xl">
                Preguntas frecuentes de agencias
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-gray-500">
                Lo que otras agencias preguntan antes de firmar como socios.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {agencyFaqs.map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-indexa-orange/30"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-indexa-gray-dark">
                    {faq.question}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5 transition-transform group-open:rotate-180"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA anchor */}
        <section id="contacto-agencias" className="relative overflow-hidden bg-gradient-to-br from-[#050816] via-[#0a0e27] to-[#050816] py-24 sm:py-32">
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-blue/15 blur-[100px]" />

          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-5xl">
              Hablemos de tu operación
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60">
              30 minutos para entender tu portafolio, mostrarte el panel multi-cliente en vivo y cotizar descuento según tu volumen.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/#contacto"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5 hover:shadow-indexa-orange/40"
              >
                Agendar demo B2B
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href="https://wa.me/525622042820?text=Hola%2C%20soy%20de%20una%20agencia%20y%20quiero%20saber%20m%C3%A1s%20sobre%20INDEXA%20B2B"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                Contactar por WhatsApp
              </a>
            </div>

            <p className="mt-6 text-sm text-white/40">
              Respondemos en menos de 24 horas hábiles
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
