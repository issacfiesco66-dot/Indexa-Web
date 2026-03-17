const solutions = [
  {
    title: "Sitios Web con IA",
    description:
      "Generamos tu sitio web profesional en minutos usando inteligencia artificial. Diseño moderno, responsivo y optimizado para convertir visitantes en clientes.",
    gradient: "from-blue-500 to-cyan-400",
    bg: "bg-blue-500/10",
    iconPath: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.73-3.418",
  },
  {
    title: "Marketing Automatizado",
    description:
      "Conecta Meta Ads y gestiona campañas de Facebook e Instagram desde tu panel. Pausa, reanuda y analiza métricas en tiempo real con un click.",
    gradient: "from-indexa-orange to-amber-400",
    bg: "bg-indexa-orange/10",
    iconPath: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46",
  },
  {
    title: "SEO Inteligente",
    description:
      "Nuestro sistema de IA optimiza tu posicionamiento en Google automáticamente. Más tráfico orgánico, más clientes, sin complicaciones técnicas.",
    gradient: "from-emerald-500 to-teal-400",
    bg: "bg-emerald-500/10",
    iconPath: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605",
  },
  {
    title: "Analíticas en Tiempo Real",
    description:
      "Panel de métricas inteligente: visitas, leads, conversiones de WhatsApp, rendimiento de campañas. Datos reales para decisiones inteligentes.",
    gradient: "from-purple-500 to-violet-400",
    bg: "bg-purple-500/10",
    iconPath: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  },
];

export default function Solutions() {
  return (
    <section id="soluciones" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-indexa-blue/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-blue">
            Soluciones
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-indexa-gray-dark sm:text-5xl">
            Herramientas que trabajan{" "}
            <span className="bg-gradient-to-r from-indexa-blue to-blue-400 bg-clip-text text-transparent">por ti</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Un ecosistema completo de inteligencia artificial diseñado para hacer crecer tu negocio.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
            >
              {/* Hover glow */}
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />

              <div className={`relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 bg-gradient-to-r ${s.gradient} bg-clip-text`} style={{ color: 'inherit' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
                </svg>
              </div>
              <h3 className="relative text-lg font-bold text-indexa-gray-dark">{s.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-gray-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
