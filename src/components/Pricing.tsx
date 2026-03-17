const plans = [
  {
    name: "Starter",
    price: "$299",
    description: "Arrancar tu presencia digital profesional.",
    features: [
      "Sitio web generado con IA",
      "Diseño responsivo",
      "WhatsApp integrado",
      "SEO básico automático",
      "Certificado SSL",
      "Soporte por email",
    ],
    cta: "Comenzar Ahora",
    popular: false,
  },
  {
    name: "Profesional",
    price: "$599",
    description: "Crecer con marketing y analíticas avanzadas.",
    features: [
      "Todo lo de Starter",
      "Dominio personalizado",
      "Panel de Meta Ads",
      "Analíticas en tiempo real",
      "CMS completo",
      "Soporte prioritario",
    ],
    cta: "Elegir Profesional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$1,299",
    description: "Escalar con asesoría y herramientas dedicadas.",
    features: [
      "Todo lo de Profesional",
      "Landing pages múltiples",
      "Redes sociales integradas",
      "Email marketing con IA",
      "Asesor dedicado",
      "SLA garantizado",
    ],
    cta: "Elegir Enterprise",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="precios" className="relative bg-indexa-gray-light py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
            Precios
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-indexa-gray-dark sm:text-5xl">
            Inversión inteligente,{" "}
            <span className="bg-gradient-to-r from-indexa-orange to-amber-500 bg-clip-text text-transparent">
              resultados reales
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Sin contratos. Cancela cuando quieras. Todas las herramientas de IA incluidas.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-indexa-orange bg-white shadow-2xl shadow-indexa-orange/10 lg:scale-105"
                  : "border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indexa-orange/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                    </svg>
                    Más Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-indexa-gray-dark">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-6 flex items-baseline">
                <span className="text-5xl font-extrabold tracking-tight text-indexa-gray-dark">{plan.price}</span>
                <span className="ml-2 text-sm font-medium text-gray-400">/mes MXN</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${plan.popular ? "bg-indexa-orange/10" : "bg-gray-100"}`}>
                      <svg className={`h-3 w-3 ${plan.popular ? "text-indexa-orange" : "text-gray-400"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="/registro"
                className={`mt-8 block rounded-xl py-3.5 text-center text-sm font-bold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-indexa-orange to-orange-500 text-white shadow-lg shadow-indexa-orange/25 hover:shadow-xl hover:shadow-indexa-orange/30 hover:-translate-y-0.5"
                    : "bg-indexa-gray-dark text-white hover:bg-indexa-gray-dark/90"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="mt-12 text-center text-sm text-gray-400">
          Todos los planes incluyen SSL, hosting y actualizaciones automáticas. Precios en pesos mexicanos + IVA.
        </p>
      </div>
    </section>
  );
}
