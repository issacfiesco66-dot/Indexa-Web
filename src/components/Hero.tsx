export default function Hero() {
  return (
    <section
      aria-label="Información principal de INDEXA"
      className="relative min-h-screen overflow-hidden bg-[#050816]"
    >
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
      <div
        className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px] animate-pulse-glow"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px] animate-pulse-glow"
        style={{ animationDelay: "4s" }}
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[15%] left-[10%] h-1 w-1 animate-float-particle rounded-full bg-indexa-orange/60" style={{ animationDelay: "0s" }} />
        <div className="absolute top-[25%] left-[80%] h-1.5 w-1.5 animate-float-particle rounded-full bg-cyan-400/60" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[60%] left-[15%] h-1 w-1 animate-float-particle rounded-full bg-indexa-orange/50" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[70%] left-[85%] h-1.5 w-1.5 animate-float-particle rounded-full bg-purple-400/60" style={{ animationDelay: "4.5s" }} />
        <div className="absolute top-[40%] left-[5%] h-1 w-1 animate-float-particle rounded-full bg-cyan-300/50" style={{ animationDelay: "2s" }} />
      </div>

      {/* Holographic ring decorations */}
      <div className="pointer-events-none absolute right-[-100px] top-1/3 h-[300px] w-[300px] rounded-full border border-indexa-orange/10 sm:right-[5%] lg:h-[400px] lg:w-[400px]">
        <div className="absolute inset-4 rounded-full border border-indexa-orange/15" />
        <div className="absolute inset-12 rounded-full border border-indexa-orange/10" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 pt-24 pb-12 text-center sm:px-6 lg:px-8">
        {/* Live indicator */}
        <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          IA generando sitios web ahora mismo
        </div>

        <h1 className="animate-fade-up-delay mx-auto max-w-5xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          No te vendemos una web.{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Te llevamos clientes.
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indexa-orange to-transparent" />
          </span>
        </h1>

        <p className="hero-description animate-fade-up-delay-2 mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/65 sm:text-xl">
          INDEXA es un sistema de IA que <span className="font-semibold text-white">captura, convierte y retiene clientes</span> por ti.
          Sitios web pensados para vender, anuncios optimizados 24/7, chatbot que responde solo, SEO local que te lleva al top.{" "}
          <span className="text-white/85">Tener web no es la meta — la meta es que esa web te traiga ventas.</span>
        </p>

        {/* Promise pill */}
        <div className="animate-fade-up-delay-2 mt-8 inline-flex items-center gap-3 rounded-2xl border border-indexa-orange/30 bg-gradient-to-r from-indexa-orange/10 to-amber-400/10 px-5 py-3 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 text-indexa-orange">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm font-semibold text-white sm:text-base">
            No importa qué vendas — vamos a llevarte clientes.
          </p>
        </div>

        {/* CTAs */}
        <div className="animate-fade-up-delay-2 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/registro"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:shadow-indexa-orange/50 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">Activar mi sistema de ventas</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="relative h-5 w-5 transition-transform group-hover:translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <a
            href="/probar"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
          >
            Ver mi web demo gratis
          </a>
        </div>

        <p className="animate-fade-up-delay-2 mt-4 text-sm text-white/40">
          14 días gratis · Sin tarjeta · Cancela cuando quieras
        </p>

        {/* Stats bar - pivoted to conversion */}
        <div className="animate-fade-up-delay-2 mt-14 grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-4">
          {[
            { value: "+340%", label: "Conversión promedio", sub: "vs. webs tradicionales" },
            { value: "<3 min", label: "Para tener tu web", sub: "lista para vender" },
            { value: "−60%", label: "Costo por cliente", sub: "en publicidad" },
            { value: "24/7", label: "IA trabajando", sub: "incluso mientras duermes" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0a0e27]/60 px-5 py-5 text-center">
              <p className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-white/70 sm:text-sm">{stat.label}</p>
              <p className="mt-0.5 text-[10px] text-white/40 sm:text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Social proof + preview link */}
        <div className="animate-fade-up-delay-2 mt-8 flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          <a
            href="/casos-de-exito"
            className="text-sm font-medium text-indexa-orange/80 underline decoration-indexa-orange/30 underline-offset-4 transition-colors hover:text-indexa-orange"
          >
            Ver negocios reales que ya están vendiendo más →
          </a>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050816] to-transparent" />
    </section>
  );
}
