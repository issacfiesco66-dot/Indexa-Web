const plans = [
  {
    name: "Básico",
    price: "$2,499",
    period: "/mes",
    description: "Ideal para negocios que inician su presencia digital.",
    features: [
      "Página web de 1-3 secciones",
      "Diseño responsivo (móvil)",
      "Formulario de contacto",
      "Certificado SSL",
      "Soporte por email",
    ],
    cta: "Elegir Básico",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$4,999",
    period: "/mes",
    description: "Para negocios que quieren crecer y vender en línea.",
    features: [
      "Página web hasta 8 secciones",
      "Tienda en línea (hasta 50 productos)",
      "SEO básico incluido",
      "Integración con redes sociales",
      "Google Analytics",
      "Soporte prioritario",
    ],
    cta: "Elegir Pro",
    highlighted: true,
  },
  {
    name: "Empresarial",
    price: "$9,999",
    period: "/mes",
    description: "Solución completa para empresas con alto volumen.",
    features: [
      "Sitio web personalizado ilimitado",
      "E-commerce completo",
      "SEO avanzado y SEM",
      "Blog integrado",
      "Dashboard de métricas",
      "Soporte 24/7 dedicado",
      "Capacitación incluida",
    ],
    cta: "Elegir Empresarial",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="precios" className="bg-indexa-gray-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indexa-blue sm:text-4xl">
            Planes y Precios
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-indexa-gray-dark">
            Elige el plan que mejor se adapte a las necesidades de tu negocio.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? "scale-[1.02] border-2 border-indexa-orange bg-white shadow-xl lg:scale-105"
                  : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indexa-orange px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  Más Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-indexa-blue">{plan.name}</h3>
              <p className="mt-2 text-sm text-indexa-gray-dark">{plan.description}</p>

              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-indexa-gray-dark">
                  {plan.price}
                </span>
                <span className="ml-1 text-sm text-gray-500">{plan.period}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-indexa-gray-dark">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-indexa-orange"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contacto"
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                  plan.highlighted
                    ? "bg-indexa-orange text-white hover:bg-indexa-orange/90"
                    : "bg-indexa-blue text-white hover:bg-indexa-blue/90"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
