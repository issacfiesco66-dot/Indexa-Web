const steps = [
  {
    number: "01",
    title: "Inicia tu prueba de 14 días",
    description:
      "Regístrate en segundos. Sin tarjeta de crédito, sin conocimientos técnicos. Empieza a probar la plataforma completa hoy mismo.",
    gradient: "from-indexa-orange to-amber-400",
  },
  {
    number: "02",
    title: "Genera tu sitio con IA",
    description:
      "Elige un plan y nuestra IA crea tu sitio web profesional en minutos. Personaliza todo desde un panel visual — sin código.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    number: "03",
    title: "Conecta tus herramientas",
    description:
      "Integra Meta Ads, WhatsApp Business y más. Todo se sincroniza automáticamente desde tu panel.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    number: "04",
    title: "Crece con datos reales",
    description:
      "Monitorea métricas, gestiona campañas y recibe leads directamente. La IA optimiza todo por ti.",
    gradient: "from-purple-500 to-violet-400",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indexa-blue/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
            Cómo funciona
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">
            De cero a digital en{" "}
            <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
              4 pasos
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            Sin código. Sin complicaciones. La IA hace el trabajo pesado.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="group relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-6 bg-gradient-to-r from-white/20 to-transparent lg:block" style={{ right: "-12px" }} />
              )}

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
                {/* Step number */}
                <span className={`inline-block bg-gradient-to-r ${step.gradient} bg-clip-text text-4xl font-black text-transparent`}>
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/registro"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/20 transition-all hover:shadow-indexa-orange/30 hover:-translate-y-0.5"
          >
            Iniciar prueba gratis
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <p className="mt-4 text-sm text-white/40">14 días gratis · Sin tarjeta de crédito</p>
        </div>
      </div>
    </section>
  );
}
