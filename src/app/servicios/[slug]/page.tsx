import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { getServiceVisual } from "@/components/ServiceVisuals";
import { servicios, getServicioBySlug } from "@/lib/serviciosData";
import {
  buildPlatformServiceSchema,
  buildBreadcrumbSchema,
  INDEXA_SITE_URL,
} from "@/lib/seoSchemas";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return servicios.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const servicio = getServicioBySlug(slug);
  if (!servicio) {
    return { title: "Servicio no encontrado" };
  }
  const canonical = `${INDEXA_SITE_URL}/servicios/${servicio.slug}`;
  return {
    title: servicio.seoTitle,
    description: servicio.seoDescription,
    keywords: servicio.seoKeywords,
    alternates: {
      canonical,
      languages: { "es-MX": canonical },
    },
    openGraph: {
      title: servicio.seoTitle,
      description: servicio.seoDescription,
      type: "website",
      locale: "es_MX",
      url: canonical,
      siteName: "INDEXA",
    },
    twitter: {
      card: "summary_large_image",
      title: servicio.seoTitle,
      description: servicio.seoDescription,
    },
    other: {
      "geo.region": "MX",
      "geo.placename": "México",
      "language": "es-MX",
    },
  };
}

const benefitIcons: Record<string, string> = {
  rocket:
    "M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  chart:
    "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
  magic:
    "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z",
  shield:
    "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
  bolt:
    "M3.75 13.5 13.5 3v7.5h6.75L10.5 21v-7.5H3.75Z",
  target:
    "M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59",
  clock:
    "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  users:
    "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  money:
    "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z",
  growth:
    "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
};

export default async function ServicioPage({ params }: PageProps) {
  const { slug } = await params;
  const s = getServicioBySlug(slug);
  if (!s) notFound();

  const otherServicios = servicios.filter((x) => x.slug !== slug);

  const serviceSchema = buildPlatformServiceSchema({
    serviceTitle: s.cardTitle,
    serviceType: s.serviceType,
    pagePath: `/servicios/${s.slug}`,
    description: s.seoDescription,
    audienceType: s.audienceType,
    faq: s.faq,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", pagePath: "/" },
    { name: "Servicios", pagePath: "/#soluciones" },
    { name: s.cardTitle, pagePath: `/servicios/${s.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main className="relative bg-[#050816] text-white">
        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-28">
          {/* Animated grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <div
              className="absolute inset-0 animate-grid-move"
              style={{
                backgroundImage: `linear-gradient(${s.primaryColor}50 1px, transparent 1px), linear-gradient(90deg, ${s.primaryColor}50 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* Gradient orbs */}
          <div
            className="pointer-events-none absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full blur-[120px] animate-pulse-glow"
            style={{ backgroundColor: `${s.primaryColor}33` }}
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[120px] animate-pulse-glow"
            style={{ backgroundColor: `${s.secondaryColor}26`, animationDelay: "2s" }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-xs text-white/40">
                <li>
                  <Link href="/" className="hover:text-white">Inicio</Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/#soluciones" className="hover:text-white">Servicios</Link>
                </li>
                <li>/</li>
                <li className="text-white/70">{s.cardTitle}</li>
              </ol>
            </nav>

            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur"
                  style={{
                    borderColor: `${s.primaryColor}55`,
                    backgroundColor: `${s.primaryColor}1a`,
                    color: s.primaryColor,
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: s.primaryColor }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.primaryColor }}
                    />
                  </span>
                  {s.heroBadge}
                </span>

                <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {s.heroTitle}{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${s.primaryColor}, ${s.secondaryColor})`,
                    }}
                  >
                    {s.heroHighlight}
                  </span>
                  {s.heroAfterHighlight ? ` ${s.heroAfterHighlight}` : ""}
                </h1>

                <p className="mt-6 text-lg leading-relaxed text-white/65">{s.heroSubtitle}</p>

                <div
                  className="relative mt-8 overflow-hidden rounded-xl border p-5"
                  style={{
                    borderColor: `${s.primaryColor}40`,
                    background: `linear-gradient(135deg, ${s.primaryColor}10, ${s.secondaryColor}05)`,
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-1"
                    style={{ background: `linear-gradient(180deg, ${s.primaryColor}, ${s.secondaryColor})` }}
                  />
                  <p className="text-sm leading-relaxed text-white/75">
                    <span className="font-bold text-white">⚡ La verdad incómoda:</span>{" "}
                    {s.heroPitch}
                  </p>
                </div>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/registro"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-base font-bold text-white shadow-2xl transition-all hover:-translate-y-0.5"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${s.primaryColor}, ${s.secondaryColor})`,
                      boxShadow: `0 20px 40px -12px ${s.primaryColor}80`,
                    }}
                  >
                    Probar 14 días gratis
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 transition-transform group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <a
                    href="#detalle"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
                  >
                    Ver cómo funciona
                  </a>
                </div>

                <p className="mt-4 text-xs text-white/40">
                  Sin tarjeta · Sin compromiso · Cancela cuando quieras
                </p>
              </div>

              {/* Visual */}
              <div className="relative">
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl opacity-50 blur-3xl"
                  style={{ backgroundColor: `${s.primaryColor}20` }}
                />
                <div
                  className="relative aspect-square overflow-hidden rounded-3xl border bg-[#0a0e27]/60 p-6 backdrop-blur-xl"
                  style={{
                    borderColor: `${s.primaryColor}30`,
                    boxShadow: `0 30px 80px -20px ${s.primaryColor}40, inset 0 0 100px ${s.primaryColor}08`,
                  }}
                >
                  {/* Corner accents */}
                  <span
                    className="absolute left-3 top-3 h-3 w-3 border-l-2 border-t-2"
                    style={{ borderColor: s.primaryColor }}
                  />
                  <span
                    className="absolute right-3 top-3 h-3 w-3 border-r-2 border-t-2"
                    style={{ borderColor: s.primaryColor }}
                  />
                  <span
                    className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2"
                    style={{ borderColor: s.primaryColor }}
                  />
                  <span
                    className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2"
                    style={{ borderColor: s.primaryColor }}
                  />
                  {getServiceVisual(s.heroVisual, s.primaryColor, s.secondaryColor)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PROMISE STRIP ─────────────────────────────────── */}
        <section
          className="relative overflow-hidden border-y py-12"
          style={{
            borderColor: `${s.primaryColor}30`,
            background: `linear-gradient(90deg, ${s.primaryColor}08, ${s.secondaryColor}04, ${s.primaryColor}08)`,
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div
              className="absolute -top-px left-0 h-px w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${s.primaryColor}, transparent)` }}
            />
            <div
              className="absolute -bottom-px left-0 h-px w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${s.secondaryColor}, transparent)` }}
            />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${s.primaryColor}, ${s.secondaryColor})`,
                }}
              >
                &ldquo;
              </span>
              {s.promiseStrip}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${s.primaryColor}, ${s.secondaryColor})`,
                }}
              >
                &rdquo;
              </span>
            </p>
          </div>
        </section>

        {/* ─── STATS BAR ─────────────────────────────────────── */}
        <section className="relative py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-3">
              {s.stats.map((stat) => (
                <div key={stat.label} className="bg-[#0a0e27] px-6 py-8 text-center">
                  <p
                    className="text-4xl font-extrabold sm:text-5xl"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${s.primaryColor}, ${s.secondaryColor})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {stat.valor}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/60">{stat.label}</p>
                  {stat.sublabel && <p className="mt-1 text-xs text-white/40">{stat.sublabel}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHAT IT DOES ──────────────────────────────────── */}
        <section id="detalle" className="relative overflow-hidden py-20 sm:py-28">
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
            style={{ backgroundColor: `${s.primaryColor}10` }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span
                className="inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur"
                style={{
                  borderColor: `${s.primaryColor}55`,
                  backgroundColor: `${s.primaryColor}1a`,
                  color: s.primaryColor,
                }}
              >
                Qué hacemos exactamente
              </span>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {s.whatItDoes.titulo}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/55">
                {s.whatItDoes.descripcion}
              </p>
            </div>

            <div className="mt-16 grid gap-5 md:grid-cols-2">
              {s.whatItDoes.items.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/[0.05]"
                >
                  <div
                    className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-30"
                    style={{ backgroundColor: s.primaryColor }}
                  />
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-extrabold text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${s.primaryColor}, ${s.secondaryColor})`,
                        boxShadow: `0 8px 24px -8px ${s.primaryColor}`,
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/55">{item.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BENEFITS ──────────────────────────────────────── */}
        <section className="relative bg-[#040611] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span
                className="inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderColor: `${s.secondaryColor}55`,
                  backgroundColor: `${s.secondaryColor}1a`,
                  color: s.secondaryColor,
                }}
              >
                Beneficios para tu negocio
              </span>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                ¿Por qué importa?
              </h2>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {s.benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all hover:-translate-y-1 hover:border-white/30"
                >
                  <div
                    className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${s.primaryColor}, ${s.secondaryColor})`,
                      boxShadow: `0 8px 24px -8px ${s.primaryColor}`,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d={benefitIcons[b.icon] || benefitIcons.bolt} />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold leading-tight text-white">{b.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{b.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── METRICS BEFORE/AFTER ──────────────────────────── */}
        {s.metrics && s.metrics.length > 0 && (
          <section className="relative py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <span
                  className="inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{
                    borderColor: `${s.primaryColor}55`,
                    backgroundColor: `${s.primaryColor}1a`,
                    color: s.primaryColor,
                  }}
                >
                  Antes vs. Después
                </span>
                <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Cambios reales, números reales
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-white/55">
                  Ranges típicos basados en datos de PYMES en México que usan INDEXA.
                </p>
              </div>

              <div className="mt-12 space-y-4">
                {s.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm md:grid-cols-12 md:items-center md:gap-6"
                  >
                    <div className="md:col-span-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/40">Métrica</p>
                      <p className="mt-1 text-base font-semibold text-white">{m.label}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-400/60">Antes</p>
                      <p className="mt-1 text-base text-white/50 line-through decoration-red-400/40">{m.before}</p>
                    </div>
                    <div className="hidden text-center md:col-span-1 md:block">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={s.primaryColor} className="mx-auto h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: s.primaryColor }}>
                        Con INDEXA
                      </p>
                      <p className="mt-1 text-base font-bold text-white">{m.after}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                        style={{
                          backgroundColor: `${s.primaryColor}1a`,
                          color: s.primaryColor,
                          border: `1px solid ${s.primaryColor}44`,
                        }}
                      >
                        {m.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── PROCESS ───────────────────────────────────────── */}
        <section className="relative bg-[#040611] py-20 sm:py-28">
          <div
            className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{ backgroundColor: `${s.secondaryColor}10` }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span
                className="inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderColor: `${s.secondaryColor}55`,
                  backgroundColor: `${s.secondaryColor}1a`,
                  color: s.secondaryColor,
                }}
              >
                Proceso
              </span>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {s.process.titulo}
              </h2>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {s.process.pasos.map((paso, idx) => (
                <div key={paso.numero} className="relative">
                  {idx < s.process.pasos.length - 1 && (
                    <div
                      className="pointer-events-none absolute right-0 top-12 hidden h-px w-6 lg:block"
                      style={{
                        right: "-12px",
                        background: `linear-gradient(90deg, ${s.primaryColor}66, transparent)`,
                      }}
                    />
                  )}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm transition-all hover:border-white/20">
                    <span
                      className="inline-block bg-clip-text text-5xl font-black text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${s.primaryColor}, ${s.secondaryColor})`,
                      }}
                    >
                      {paso.numero}
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-white">{paso.titulo}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">{paso.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WHO IS IT FOR ─────────────────────────────────── */}
        <section className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span
                className="inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderColor: `${s.primaryColor}55`,
                  backgroundColor: `${s.primaryColor}1a`,
                  color: s.primaryColor,
                }}
              >
                ¿Es para mí?
              </span>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {s.whoIsItFor.titulo}
              </h2>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {s.whoIsItFor.items.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${s.primaryColor}26`,
                      border: `1px solid ${s.primaryColor}55`,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke={s.primaryColor} className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ────────────────────────────────────────────── */}
        <section className="relative bg-[#040611] py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span
                className="inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderColor: `${s.secondaryColor}55`,
                  backgroundColor: `${s.secondaryColor}1a`,
                  color: s.secondaryColor,
                }}
              >
                Preguntas frecuentes
              </span>
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                Resolvamos las dudas
              </h2>
            </div>

            <div className="mt-12 space-y-3">
              {s.faq.map((q, idx) => (
                <details
                  key={idx}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all hover:border-white/20"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-base font-semibold text-white">
                    {q.pregunta}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="h-5 w-5 flex-shrink-0 text-white/50 transition-transform group-open:rotate-45"
                      style={{ color: s.primaryColor }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </summary>
                  <div className="border-t border-white/10 p-5 text-sm leading-relaxed text-white/65">
                    {q.respuesta}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${s.primaryColor}20, transparent 70%)`,
            }}
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {s.ctaTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
              {s.ctaSubtitle}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/registro"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:-translate-y-0.5"
                style={{
                  backgroundImage: `linear-gradient(90deg, ${s.primaryColor}, ${s.secondaryColor})`,
                  boxShadow: `0 24px 60px -12px ${s.primaryColor}90`,
                }}
              >
                Empezar prueba 14 días
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 transition-transform group-hover:translate-x-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/probar"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                Ver demo de mi sitio
              </Link>
            </div>

            <p className="mt-4 text-sm text-white/40">Sin tarjeta · 14 días completos · Soporte por WhatsApp</p>
          </div>
        </section>

        {/* ─── OTHER SERVICES ─────────────────────────────────── */}
        <section className="relative border-t border-white/10 bg-[#040611] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white/40">Otros servicios</p>
                <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">El ecosistema completo</h2>
              </div>
              <Link href="/#soluciones" className="hidden text-sm font-semibold text-indexa-orange hover:underline sm:block">
                Ver todos →
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {otherServicios.map((o) => (
                <Link
                  key={o.slug}
                  href={`/servicios/${o.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/30"
                >
                  <div
                    className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${o.cardAccent}, ${o.cardAccent}99)`,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={o.cardIconPath} />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-white">{o.cardTitle}</h3>
                  <span
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-all"
                    style={{ color: o.cardAccent }}
                  >
                    Ver más
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3 transition-transform group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
