import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { queryCollection } from "@/lib/firestoreRest";
import type { SitioData } from "@/types/lead";
import SitioTracker from "./SitioTracker";
import WhatsAppButton from "./WhatsAppButton";

interface SitioPageProps {
  params: Promise<{ slug: string }>;
}

async function getSitioBySlug(slug: string): Promise<{ id: string; data: SitioData } | null> {
  const results = await queryCollection("sitios", "slug", slug, 1);
  if (results.length === 0) return null;

  const { id, data: raw } = results[0];

  return {
    id,
    data: {
      nombre: (raw.nombre as string) ?? "",
      slug: (raw.slug as string) ?? "",
      descripcion: (raw.descripcion as string) ?? "",
      eslogan: (raw.eslogan as string) ?? "",
      whatsapp: (raw.whatsapp as string) ?? "",
      emailContacto: (raw.emailContacto as string) ?? "",
      direccion: (raw.direccion as string) ?? "",
      colorPrincipal: (raw.colorPrincipal as string) ?? "#002366",
      logoUrl: (raw.logoUrl as string) ?? "",
      servicios: (raw.servicios as string[]) ?? [],
      vistas: (raw.vistas as number) ?? 0,
      clicsWhatsApp: (raw.clicsWhatsApp as number) ?? 0,
      ownerId: (raw.ownerId as string) ?? "",
      statusPago: (raw.statusPago as string as SitioData["statusPago"]) ?? "inactivo",
      plan: (raw.plan as string as SitioData["plan"]) ?? "",
      fechaVencimiento: (raw.fechaVencimiento as string) ?? null,
      stripeCustomerId: (raw.stripeCustomerId as string) ?? "",
    },
  };
}

export async function generateMetadata({ params }: SitioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sitio = await getSitioBySlug(slug);

  if (!sitio) {
    return { title: "Sitio no encontrado" };
  }

  const { nombre, descripcion, colorPrincipal } = sitio.data;

  return {
    title: `${nombre} — Sitio creado por INDEXA`,
    description: descripcion || `${nombre} - Visita nuestro sitio web y conoce nuestros servicios.`,
    openGraph: {
      title: nombre,
      description: descripcion || `${nombre} - Conoce nuestros servicios.`,
      type: "website",
    },
    other: {
      "theme-color": colorPrincipal,
    },
  };
}

const DEFAULT_SERVICES = [
  "Atención personalizada",
  "Servicio a domicilio",
  "Asesoría gratuita",
  "Calidad garantizada",
];

export default async function SitioPage({ params }: SitioPageProps) {
  const { slug } = await params;
  const sitio = await getSitioBySlug(slug);

  if (!sitio) notFound();

  const { id, data } = sitio;
  const {
    nombre,
    descripcion,
    eslogan,
    whatsapp,
    emailContacto,
    direccion,
    colorPrincipal,
    logoUrl,
    servicios,
  } = data;

  const services = servicios.length > 0 ? servicios : DEFAULT_SERVICES;

  return (
    <div className="min-h-screen bg-white" style={{ "--brand": colorPrincipal } as React.CSSProperties}>
      {/* Analytics tracker (client component) */}
      <SitioTracker sitioId={id} />

      {/* Floating WhatsApp button (client component) */}
      {whatsapp && (
        <WhatsAppButton
          sitioId={id}
          phone={whatsapp}
          businessName={nombre}
          color={colorPrincipal}
        />
      )}

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={nombre} className="h-9 w-9 rounded-lg object-contain" />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: colorPrincipal }}
              >
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-lg font-bold" style={{ color: colorPrincipal }}>
              {nombre}
            </span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <a href="#servicios" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
              Servicios
            </a>
            <a href="#contacto" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
              Contacto
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: colorPrincipal }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={nombre}
              className="mx-auto mb-8 h-20 w-20 rounded-2xl bg-white/10 object-contain p-2 shadow-lg backdrop-blur-sm sm:h-24 sm:w-24"
            />
          )}
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {nombre}
          </h1>
          {eslogan && (
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
              {eslogan}
            </p>
          )}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d+]/g, "").startsWith("+") ? whatsapp.replace(/[^\d+]/g, "") : `+52${whatsapp.replace(/[^\d+]/g, "")}`}?text=${encodeURIComponent(`Hola, vi tu página en INDEXA y me interesa más información sobre ${nombre}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                style={{ color: colorPrincipal }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contáctanos
              </a>
            )}
            <a
              href="#servicios"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-bold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              Conoce más
            </a>
          </div>
        </div>
      </section>

      {/* ── Descripción ────────────────────────────────────────── */}
      {descripcion && (
        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Sobre Nosotros
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {descripcion}
            </p>
          </div>
        </section>
      )}

      {/* ── Servicios ──────────────────────────────────────────── */}
      <section id="servicios" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: colorPrincipal }}>
              Lo que ofrecemos
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Nuestros Servicios
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-white transition-colors"
                  style={{ backgroundColor: colorPrincipal }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-gray-900">{service}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ───────────────────────────────────────────── */}
      <section id="contacto" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: colorPrincipal }}>
              Encuéntranos
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Contacto
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* WhatsApp card */}
            {whatsapp && (
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">WhatsApp</h3>
                  <p className="mt-1 text-sm text-gray-500">{whatsapp}</p>
                </div>
              </div>
            )}

            {/* Email card */}
            {emailContacto && (
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email</h3>
                  <a href={`mailto:${emailContacto}`} className="mt-1 block text-sm text-gray-500 hover:underline">
                    {emailContacto}
                  </a>
                </div>
              </div>
            )}

            {/* Address card */}
            {direccion && (
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Dirección</h3>
                  <p className="mt-1 text-sm text-gray-500">{direccion}</p>
                </div>
              </div>
            )}
          </div>

          {/* Map placeholder */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-200">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  {direccion || "Mapa de ubicación"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: colorPrincipal }}>
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
          <p className="text-lg font-bold text-white">{nombre}</p>
          {eslogan && (
            <p className="mt-1 text-sm text-white/60">{eslogan}</p>
          )}
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs text-white/40">
              Sitio creado por{" "}
              <a
                href="https://www.indexa.com.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/60 hover:text-white/80"
              >
                INDEXA
              </a>{" "}
              — Presencia digital para PYMES
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
