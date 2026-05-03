const plans = [
  {
    name: "Starter",
    price: "$299",
    description: "Tu presencia digital profesional al instante.",
    features: [
      "Sitio web profesional con IA",
      "Botón de WhatsApp directo",
      "SEO local automático",
      "3 diseños profesionales",
      "Certificado SSL incluido",
      "Soporte por email",
    ],
    cta: "Probar 14 días gratis",
    popular: false,
  },
  {
    name: "Profesional",
    price: "$599",
    description: "Más visibilidad con optimización y soporte directo.",
    features: [
      "Todo lo de Starter",
      "Panel de edición completo (CMS)",
      "SEO local avanzado (Schema.org)",
      "Estadísticas de visitas y clics",
      "Soporte prioritario por WhatsApp",
      "Asesoría para optimizar tu perfil",
    ],
    cta: "Probar 14 días gratis",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$1,299",
    description: "Atención personalizada y prioridad total.",
    features: [
      "Todo lo de Profesional",
      "Asesor personal dedicado",
      "Configuración y soporte premium",
      "Prioridad en nuevas funciones",
      "Soporte técnico urgente",
      "Capacitación 1 a 1",
    ],
    cta: "Probar 14 días gratis",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="precios" className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,102,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className="pointer-events-none absolute top-1/4 left-0 h-[400px] w-[400px] rounded-full bg-indexa-orange/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indexa-blue/15 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indexa-orange/30 bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange backdrop-blur">
            Precios
          </span>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Lo que cuesta una buena cena,{" "}
            <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
              te trae clientes todo el mes.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Sin contratos, sin permanencia. Todo el ecosistema de IA en una sola mensualidad.
          </p>

          {/* Trial banner */}
          <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 backdrop-blur">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm font-semibold text-white">
              14 días gratis en cualquier plan · Sin tarjeta de crédito
            </span>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-2xl p-8 backdrop-blur-xl transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-indexa-orange bg-gradient-to-br from-[#0a0e27] to-[#050816] shadow-2xl shadow-indexa-orange/30 lg:scale-105"
                  : "border border-white/10 bg-white/[0.03] hover:border-white/30 hover:-translate-y-1 hover:bg-white/[0.05]"
              }`}
            >
              {plan.popular && (
                <>
                  {/* Animated glow */}
                  <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indexa-orange/20 via-purple-500/10 to-cyan-400/10 blur-xl" />

                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indexa-orange/40">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                      </svg>
                      Más Popular
                    </span>
                  </div>
                </>
              )}

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-white/55">{plan.description}</p>

              <div className="mt-6 flex items-baseline">
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">{plan.price}</span>
                <span className="ml-2 text-sm font-medium text-white/40">/mes MXN</span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${plan.popular ? "bg-indexa-orange/20" : "bg-white/10"}`}>
                      <svg className={`h-3 w-3 ${plan.popular ? "text-indexa-orange" : "text-white/50"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
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
                    ? "bg-gradient-to-r from-indexa-orange to-orange-500 text-white shadow-lg shadow-indexa-orange/30 hover:shadow-xl hover:shadow-indexa-orange/50 hover:-translate-y-0.5"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="mt-12 text-center text-sm text-white/40">
          Todos los planes incluyen SSL, hosting y actualizaciones automáticas. Precios en pesos mexicanos + IVA.
        </p>
      </div>
    </section>
  );
}
