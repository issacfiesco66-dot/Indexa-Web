import Link from "next/link";
import { servicios } from "@/lib/serviciosData";

export default function Solutions() {
  return (
    <section id="soluciones" className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Animated grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,180,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="pointer-events-none absolute top-1/4 -left-32 h-[400px] w-[400px] rounded-full bg-indexa-blue/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indexa-orange/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indexa-orange/30 bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indexa-orange opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indexa-orange" />
            </span>
            Servicios INDEXA
          </span>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            No te ofrecemos una web.{" "}
            <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Te ofrecemos clientes.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Un ecosistema de IA que captura, convierte y retiene clientes por ti — mientras tú te dedicas a hacer lo que mejor sabes hacer.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s, idx) => (
            <Link
              key={s.slug}
              href={`/servicios/${s.slug}`}
              className="group relative block"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-all duration-500 hover:border-white/30 hover:-translate-y-2 hover:bg-white/[0.06] hover:shadow-2xl">
                {/* Animated gradient border on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, ${s.cardAccent}30 0%, transparent 60%)`,
                  }}
                />

                {/* Hover glow */}
                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${s.cardGradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`}
                />

                {/* Subtle scanline effect */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-0 transition-opacity group-hover:opacity-100">
                  <div
                    className="absolute -inset-x-10 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    style={{
                      top: "0",
                      animation: "scanline 3s linear infinite",
                    }}
                  />
                </div>

                {/* Icon */}
                <div className="relative mb-5 inline-flex">
                  <div
                    className={`relative inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${s.cardGradient} shadow-lg`}
                    style={{ boxShadow: `0 8px 32px -8px ${s.cardAccent}` }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="white"
                      className="h-7 w-7"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.cardIconPath} />
                    </svg>
                  </div>
                  {/* Orbiting dot */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ animation: "orbit 4s linear infinite" }}
                  >
                    <div
                      className="absolute -right-1 top-1/2 h-1.5 w-1.5 rounded-full"
                      style={{ background: s.cardAccent, boxShadow: `0 0 12px ${s.cardAccent}` }}
                    />
                  </div>
                </div>

                <h3 className="relative text-xl font-bold text-white">{s.cardTitle}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-white/55">
                  {s.cardDescription}
                </p>

                <div className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-all" style={{ color: s.cardAccent }}>
                  Ver detalle
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>

                {/* Bottom accent bar */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-px scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: `linear-gradient(90deg, transparent, ${s.cardAccent}, transparent)` }}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm text-white/40">
            Todos los servicios disponibles desde el plan Starter ·{" "}
            <a href="/registro" className="font-semibold text-indexa-orange hover:underline">
              Pruébalos 14 días gratis →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
