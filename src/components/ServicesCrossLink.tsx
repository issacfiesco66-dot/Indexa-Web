import Link from "next/link";
import { servicios } from "@/lib/serviciosData";

interface ServicesCrossLinkProps {
  /**
   * Optional context label to render in the badge above the grid.
   * Reinforces semantic context for crawlers — typically the audience
   * (e.g. "Negocios en CDMX", "Restaurantes y negocios de comida").
   */
  contextLabel?: string;
  /**
   * Optional bare place / industry name used in the heading template
   * ("Todo lo que INDEXA hace por tu negocio en {placeName}").
   * Pass just "CDMX" / "Guadalajara" / "el sector restaurantero" — without
   * the "Negocios en" prefix. If omitted, the heading falls back to the
   * generic copy.
   */
  placeName?: string;
  /** Heading override when the default template doesn't fit. */
  heading?: string;
  /** When true, uses a lighter background (for inside-page placement). */
  variant?: "dark" | "subtle";
}

export default function ServicesCrossLink({
  contextLabel,
  placeName,
  heading,
  variant = "dark",
}: ServicesCrossLinkProps) {
  const isDark = variant === "dark";
  const sectionClass = isDark
    ? "relative overflow-hidden bg-[#040611] py-20"
    : "relative overflow-hidden bg-indexa-gray-light/50 py-20";
  const titleClass = isDark ? "text-white" : "text-indexa-gray-dark";
  const subtitleClass = isDark ? "text-white/55" : "text-gray-500";
  const cardBaseClass = isDark
    ? "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
    : "border-gray-200 bg-white hover:border-indexa-orange/40 hover:shadow-lg";
  const cardTitleClass = isDark ? "text-white" : "text-indexa-gray-dark";
  const cardDescClass = isDark ? "text-white/55" : "text-gray-500";

  return (
    <section className={sectionClass}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {contextLabel && (
            <span
              className={`inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                isDark
                  ? "border-indexa-orange/30 bg-indexa-orange/10 text-indexa-orange"
                  : "border-indexa-orange/30 bg-indexa-orange/10 text-indexa-orange"
              }`}
            >
              {contextLabel}
            </span>
          )}
          <h2 className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl ${titleClass}`}>
            {heading ??
              (placeName
                ? `Todo lo que INDEXA hace por tu negocio en ${placeName}`
                : "Servicios INDEXA — un ecosistema completo para tu negocio")}
          </h2>
          <p className={`mx-auto mt-3 max-w-2xl text-base ${subtitleClass}`}>
            No solo te creamos una web. Capturamos, convertimos y retenemos clientes por ti — todo desde una sola plataforma.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <Link
              key={s.slug}
              href={`/servicios/${s.slug}`}
              className={`group relative flex items-start gap-4 overflow-hidden rounded-xl border p-5 backdrop-blur-sm transition-all hover:-translate-y-0.5 ${cardBaseClass}`}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg shadow-lg transition-transform group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${s.cardAccent}, ${s.cardAccent}aa)`,
                  boxShadow: `0 8px 20px -8px ${s.cardAccent}`,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.cardIconPath} />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-base font-bold ${cardTitleClass}`}>{s.cardTitle}</h3>
                <p className={`mt-1 line-clamp-2 text-sm leading-relaxed ${cardDescClass}`}>
                  {s.cardDescription}
                </p>
                <span
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-all"
                  style={{ color: s.cardAccent }}
                >
                  Ver detalle
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3 transition-transform group-hover:translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
