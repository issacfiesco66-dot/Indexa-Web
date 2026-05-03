"use client";

const beforeAfter = [
  {
    label: "Cuando alguien entra a tu web",
    before: {
      tag: "Web tradicional",
      desc: "Lee 'somos líderes desde 1998', no entiende qué vendes y se va.",
      stat: "0.8% convierte",
    },
    after: {
      tag: "Con INDEXA",
      desc: "Ve un titular claro, una oferta concreta y un botón de WhatsApp listo.",
      stat: "5.2% convierte",
    },
  },
  {
    label: "Cuando un cliente te escribe",
    before: {
      tag: "Sin sistema",
      desc: "Tu vendedora responde en 4 horas. El cliente ya compró con la competencia.",
      stat: "8% cierra",
    },
    after: {
      tag: "Con INDEXA",
      desc: "Tu chatbot responde en 3 segundos, califica el lead y agenda la cita.",
      stat: "32% cierra",
    },
  },
  {
    label: "Cuando inviertes en publicidad",
    before: {
      tag: "Manual",
      desc: "Pagas $5,000 al mes. No sabes qué anuncio funciona ni qué clientes llegaron.",
      stat: "$320 por lead",
    },
    after: {
      tag: "Con INDEXA",
      desc: "La IA optimiza cada 6 minutos, pausa lo que pierde y escala lo que gana.",
      stat: "$72 por lead",
    },
  },
];

export default function WhyConverts() {
  return (
    <section id="por-que-converte" className="relative overflow-hidden bg-[#040611] py-24 sm:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,102,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indexa-orange/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-300 backdrop-blur">
            La verdad incómoda
          </span>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Tienes web hace años{" "}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              y nunca te ha traído un cliente.
            </span>
          </h2>
          <p className="mx-auto mt-6 text-lg leading-relaxed text-white/65 sm:text-xl">
            No es que tu negocio no sirva. Es que te vendieron <span className="font-bold text-white">una página, no un sistema de ventas</span>.
            La diferencia es la que separa a los negocios que crecen de los que sobreviven.
          </p>
        </div>

        {/* Before/After scenarios */}
        <div className="mt-16 space-y-6">
          {beforeAfter.map((scenario, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm transition-all hover:border-white/20"
            >
              {/* Scenario label */}
              <div className="border-b border-white/5 bg-white/[0.02] px-6 py-3 sm:px-8">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Escenario · {String(idx + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-base font-semibold text-white sm:text-lg">{scenario.label}</p>
              </div>

              {/* Before vs After */}
              <div className="grid divide-white/10 lg:grid-cols-[1fr_auto_1fr] lg:divide-x">
                {/* BEFORE */}
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-300">
                      {scenario.before.tag}
                    </span>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-white/55 sm:text-lg">
                    {scenario.before.desc}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-sm font-bold text-red-300">{scenario.before.stat}</span>
                  </div>
                </div>

                {/* Arrow divider */}
                <div className="flex items-center justify-center px-4 py-4 lg:py-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indexa-orange to-amber-400 shadow-lg shadow-indexa-orange/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>

                {/* AFTER */}
                <div className="relative p-6 sm:p-8">
                  {/* Glow accent */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indexa-orange/20 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

                  <div className="relative flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      {scenario.after.tag}
                    </span>
                  </div>
                  <p className="relative mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
                    {scenario.after.desc}
                  </p>
                  <div className="relative mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-sm font-bold text-emerald-300">{scenario.after.stat}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* The promise card */}
        <div className="mt-20 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-indexa-orange/30 to-purple-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-indexa-orange/30 bg-gradient-to-br from-[#0a0e27] to-[#050816] p-8 sm:p-10">
              {/* Top accent */}
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-indexa-orange to-transparent" />

              {/* Corner brackets */}
              <span className="absolute left-4 top-4 h-4 w-4 border-l-2 border-t-2 border-indexa-orange/60" />
              <span className="absolute right-4 top-4 h-4 w-4 border-r-2 border-t-2 border-indexa-orange/60" />
              <span className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-indexa-orange/60" />
              <span className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-indexa-orange/60" />

              <span className="inline-flex items-center gap-2 rounded-full border border-indexa-orange/40 bg-indexa-orange/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indexa-orange">
                Promesa INDEXA
              </span>

              <h3 className="mt-6 text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                Si no llegan clientes en 30 días,{" "}
                <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                  trabajamos gratis hasta que lleguen.
                </span>
              </h3>

              <p className="mt-6 text-base leading-relaxed text-white/70">
                Estamos tan seguros de que el sistema funciona, que nos jugamos nuestro tiempo. Si activas todos los servicios y no
                ves un solo cliente nuevo en los primeros 30 días, te devolvemos tu dinero o seguimos optimizando sin cobrarte un peso más.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/registro"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-indexa-orange/30 transition-all hover:-translate-y-0.5"
                >
                  Activar el sistema
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 transition-transform group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="/casos-de-exito"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-bold text-white transition-all hover:border-white/30 hover:bg-white/10"
                >
                  Ver casos reales
                </a>
              </div>
            </div>
          </div>

          {/* What you get list */}
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Lo que estás activando hoy:
            </h3>
            <div className="mt-6 space-y-3">
              {[
                "Una web optimizada para vender, no para verse bonita",
                "Un chatbot que contesta a tus clientes en 3 segundos, las 24 horas",
                "Anuncios automáticos que solo gastan donde hay clientes reales",
                "SEO que te lleva al top de Google sin pagar publicidad",
                "Analíticas que te dicen qué funciona y qué no",
                "Automatizaciones que ejecutan tu negocio mientras duermes",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-indexa-orange/30 hover:bg-white/[0.04]"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-amber-400 shadow-lg shadow-indexa-orange/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="pt-1 text-sm font-medium text-white/85 sm:text-base">{item}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-white/40">
              Todo en una sola plataforma. Sin contratar 5 agencias. Sin pagar 5 mensualidades.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
