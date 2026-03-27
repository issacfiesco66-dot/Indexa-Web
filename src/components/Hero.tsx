export default function Hero() {
  return (
    <section aria-label="Información principal de INDEXA" className="relative min-h-screen overflow-hidden bg-[#050816]">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="absolute inset-0 animate-grid-move"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,102,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "4s" }} />

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 pt-20 text-center sm:px-6 lg:px-8">
        <h1 className="animate-fade-up-delay mx-auto max-w-5xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Tu negocio merece una{" "}
          <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
            presencia digital
          </span>{" "}
          inteligente
        </h1>

        <p className="hero-description animate-fade-up-delay-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
          INDEXA es la plataforma en México que utiliza inteligencia artificial
          para generar sitios web profesionales para PYMES en menos de 3 minutos.
          Con SEO local automático, WhatsApp integrado y campañas de ads —
          todo desde un solo panel.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up-delay-2 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/registro"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:shadow-indexa-orange/40 hover:-translate-y-0.5"
          >
            Comenzar Gratis
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 transition-transform group-hover:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
          >
            Ver cómo funciona
          </a>
        </div>

        {/* Social proof link */}
        <div className="animate-fade-up-delay-2 mt-6">
          <a href="/casos-de-exito" className="text-sm font-medium text-indexa-orange/80 underline decoration-indexa-orange/30 underline-offset-4 hover:text-indexa-orange transition-colors">
            Conoce nuestros casos de éxito
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          {[
            { value: "500+", label: "Negocios activos" },
            { value: "3 min", label: "Sitio web con IA" },
            { value: "24/7", label: "Soporte con IA" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-white/50 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
