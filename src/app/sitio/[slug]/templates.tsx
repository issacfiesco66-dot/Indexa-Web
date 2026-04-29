import type { SitioData } from "@/types/lead";
import Image from "next/image";
import OfertasBanner from "./OfertasBanner";

interface TemplateProps {
  data: SitioData;
  services: string[];
  whatsAppUrl: string;
}

// ── Shared: WhatsApp SVG icon ─────────────────────────────────────────
function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function IndexaFooterCredit() {
  return (
    <p className="text-xs text-white/40">
      Sitio creado por{" "}
      <a href="https://indexaia.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/60 hover:text-white/80">
        INDEXA
      </a>{" "}
      — Presencia digital para PYMES
    </p>
  );
}

function GallerySection({ images, colorPrincipal, variant = "modern" }: { images: string[]; colorPrincipal: string; variant?: "modern" | "elegant" | "minimalist" }) {
  if (!images || images.length === 0) return null;
  const headingClass = variant === "elegant" ? "font-serif" : "";
  const bgClass = variant === "minimalist" ? "border-b border-gray-200 bg-white" : variant === "elegant" ? "bg-stone-50" : "bg-gray-50";
  return (
    <section className={`${bgClass} py-16 sm:py-20`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          {variant === "minimalist" ? (
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Nuestro trabajo</p>
          ) : variant === "elegant" ? (
            <>
              <p className="font-serif text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: colorPrincipal }}>Portafolio</p>
              <h2 className={`mt-3 ${headingClass} text-3xl font-semibold text-stone-900 sm:text-4xl`}>Nuestros Trabajos</h2>
              <div className="mx-auto mt-4 h-px w-12" style={{ backgroundColor: colorPrincipal }} />
            </>
          ) : (
            <>
              <p className="text-sm font-bold uppercase tracking-wider" style={{ color: colorPrincipal }}>Portafolio</p>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Nuestros Trabajos</h2>
            </>
          )}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, i) => (
            <div key={i} className={`overflow-hidden ${variant === "minimalist" ? "" : "rounded-2xl"} ${variant === "elegant" ? "rounded-sm" : ""}`}>
              <Image src={url} alt={`Trabajo ${i + 1}`} width={600} height={400} className="h-56 w-full object-cover transition-transform duration-300 hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 1. MODERN TEMPLATE
//    Sans-serif, rounded-2xl, soft shadows, gradient buttons
// ═══════════════════════════════════════════════════════════════════════
export function ModernTemplate({ data, services, whatsAppUrl }: TemplateProps) {
  const { nombre, descripcion, eslogan, whatsapp, emailContacto, direccion, colorPrincipal, logoUrl, categoria, ciudad } = data;
  const altLogo = `Logo de ${nombre}${categoria ? ` - ${categoria}` : ""}${ciudad ? ` en ${ciudad}` : ""}`;
  const altHero = `${nombre}${categoria ? ` - ${categoria}` : ""}${ciudad ? ` en ${ciudad}` : ""}`;

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt={altLogo} width={36} height={36} className="h-9 w-9 rounded-lg object-contain" priority />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: colorPrincipal }}>
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-lg font-bold" style={{ color: colorPrincipal }}>{nombre}</span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <a href="#servicios" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">Servicios</a>
            <a href="#contacto" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">Contacto</a>
          </div>
        </nav>
      </header>

      {/* Hero — brand color background with gradient orbs, optional hero image */}
      <section className="relative overflow-hidden" style={{ backgroundColor: colorPrincipal }}>
        {data.heroImageUrl && (
          <Image src={data.heroImageUrl} alt={altHero} fill className="absolute inset-0 object-cover opacity-30" priority />
        )}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
          {logoUrl && (
            <Image src={logoUrl} alt={altHero} width={96} height={96} className="mx-auto mb-8 h-20 w-20 rounded-2xl bg-white/10 object-contain p-2 shadow-lg backdrop-blur-sm sm:h-24 sm:w-24" priority />
          )}
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {nombre}
          </h1>
          {eslogan && <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">{eslogan}</p>}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {whatsapp && (
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                style={{ color: colorPrincipal }}>
                <WaIcon className="h-5 w-5" /> Contáctanos
              </a>
            )}
            <a href="#servicios" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-bold text-white transition-all hover:border-white/50 hover:bg-white/10">
              Conoce más
            </a>
          </div>
        </div>
      </section>

      {/* Ofertas Banner */}
      <OfertasBanner ofertas={data.ofertasActivas} colorPrincipal={colorPrincipal} />

      {/* About */}
      {descripcion && (
        <section className="bg-gray-50 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Sobre Nosotros</h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">{descripcion}</p>
          </div>
        </section>
      )}

      {/* Services */}
      <section id="servicios" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: colorPrincipal }}>Lo que ofrecemos</p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Nuestros Servicios</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <div key={i} className="group rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ backgroundColor: colorPrincipal }}>
                  <CheckIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-gray-900">{service}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <GallerySection images={data.galeria} colorPrincipal={colorPrincipal} variant="modern" />

      {/* Contact */}
      <section id="contacto" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: colorPrincipal }}>Encuéntranos</p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">Contacto</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whatsapp && (
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600"><WaIcon className="h-5 w-5" /></div>
                <div><h3 className="font-bold text-gray-900">WhatsApp</h3><p className="mt-1 text-sm text-gray-500">{whatsapp}</p></div>
              </div>
            )}
            {emailContacto && (
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><MailIcon className="h-5 w-5" /></div>
                <div><h3 className="font-bold text-gray-900">Email</h3><a href={`mailto:${emailContacto}`} className="mt-1 block text-sm text-gray-500 hover:underline">{emailContacto}</a></div>
              </div>
            )}
            {direccion && (
              <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><PinIcon className="h-5 w-5" /></div>
                <div><h3 className="font-bold text-gray-900">Dirección</h3><p className="mt-1 text-sm text-gray-500">{direccion}</p></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: colorPrincipal }}>
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
          <p className="text-lg font-bold text-white">{nombre}</p>
          {eslogan && <p className="mt-1 text-sm text-white/60">{eslogan}</p>}
          <div className="mt-6 border-t border-white/10 pt-6"><IndexaFooterCredit /></div>
        </div>
      </footer>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════
// 2. ELEGANT TEMPLATE
//    Serif titles, thin borders, white space, gold/cream/black accents
// ═══════════════════════════════════════════════════════════════════════
export function ElegantTemplate({ data, services, whatsAppUrl }: TemplateProps) {
  const { nombre, descripcion, eslogan, whatsapp, emailContacto, direccion, colorPrincipal, logoUrl, categoria, ciudad } = data;
  const altLogo = `Logo de ${nombre}${categoria ? ` - ${categoria}` : ""}${ciudad ? ` en ${ciudad}` : ""}`;
  const altHero = `${nombre}${categoria ? ` - ${categoria}` : ""}${ciudad ? ` en ${ciudad}` : ""}`;

  return (
    <>
      {/* Navbar — minimal thin border */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <Image src={logoUrl} alt={altLogo} width={40} height={40} className="h-10 w-10 rounded-sm object-contain" priority />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 text-sm font-bold" style={{ borderColor: colorPrincipal, color: colorPrincipal }}>
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-serif text-xl font-semibold tracking-wide text-stone-800">{nombre}</span>
          </div>
          <div className="hidden items-center gap-8 sm:flex">
            <a href="#servicios" className="font-serif text-sm tracking-wide text-stone-500 transition-colors hover:text-stone-900">Servicios</a>
            <a href="#contacto" className="font-serif text-sm tracking-wide text-stone-500 transition-colors hover:text-stone-900">Contacto</a>
          </div>
        </nav>
      </header>

      {/* Hero — white bg, subtle brand accent line, optional hero image */}
      <section className="relative bg-stone-50 py-24 sm:py-32 lg:py-40">
        {data.heroImageUrl && (
          <Image src={data.heroImageUrl} alt={altHero} fill className="absolute inset-0 object-cover opacity-20" priority />
        )}
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mx-auto mb-8 h-px w-16" style={{ backgroundColor: colorPrincipal }} />
          {logoUrl && (
            <Image src={logoUrl} alt={altHero} width={80} height={80} className="mx-auto mb-10 h-16 w-16 rounded-sm object-contain sm:h-20 sm:w-20" priority />
          )}
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-wide text-stone-900 sm:text-5xl lg:text-6xl">
            {nombre}
          </h1>
          {eslogan && (
            <p className="mx-auto mt-6 max-w-lg font-serif text-lg leading-relaxed text-stone-500 italic">
              {eslogan}
            </p>
          )}
          <div className="mx-auto mt-6 h-px w-16" style={{ backgroundColor: colorPrincipal }} />
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {whatsapp && (
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border-2 px-8 py-3.5 font-serif text-sm font-semibold tracking-widest uppercase transition-all hover:opacity-80"
                style={{ borderColor: colorPrincipal, color: colorPrincipal }}>
                <WaIcon className="h-4 w-4" /> Contactar
              </a>
            )}
            <a href="#servicios"
              className="inline-flex items-center gap-2 border-2 border-stone-300 px-8 py-3.5 font-serif text-sm font-semibold tracking-widest uppercase text-stone-600 transition-all hover:border-stone-500">
              Descubrir
            </a>
          </div>
        </div>
      </section>

      {/* Ofertas Banner */}
      <OfertasBanner ofertas={data.ofertasActivas} colorPrincipal={colorPrincipal} />

      {/* About */}
      {descripcion && (
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="font-serif text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: colorPrincipal }}>Acerca de</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">Nuestra Historia</h2>
            <div className="mx-auto mt-4 h-px w-12" style={{ backgroundColor: colorPrincipal }} />
            <p className="mt-8 text-base leading-loose text-stone-500">{descripcion}</p>
          </div>
        </section>
      )}

      {/* Services */}
      <section id="servicios" className="bg-stone-50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-serif text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: colorPrincipal }}>Excelencia</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">Nuestros Servicios</h2>
            <div className="mx-auto mt-4 h-px w-12" style={{ backgroundColor: colorPrincipal }} />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2">
            {services.map((service, i) => (
              <div key={i} className="flex items-start gap-4 border-l-2 pl-6 py-2" style={{ borderColor: colorPrincipal }}>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-stone-800">{service}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <GallerySection images={data.galeria} colorPrincipal={colorPrincipal} variant="elegant" />

      {/* Contact */}
      <section id="contacto" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="font-serif text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: colorPrincipal }}>Contacto</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">Encuéntranos</h2>
            <div className="mx-auto mt-4 h-px w-12" style={{ backgroundColor: colorPrincipal }} />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {whatsapp && (
              <div className="border-t-2 pt-6 text-center" style={{ borderColor: colorPrincipal }}>
                <WaIcon className="mx-auto h-6 w-6 text-stone-400" />
                <h3 className="mt-3 font-serif text-sm font-semibold uppercase tracking-wider text-stone-800">WhatsApp</h3>
                <p className="mt-2 text-sm text-stone-500">{whatsapp}</p>
              </div>
            )}
            {emailContacto && (
              <div className="border-t-2 pt-6 text-center" style={{ borderColor: colorPrincipal }}>
                <MailIcon className="mx-auto h-6 w-6 text-stone-400" />
                <h3 className="mt-3 font-serif text-sm font-semibold uppercase tracking-wider text-stone-800">Email</h3>
                <a href={`mailto:${emailContacto}`} className="mt-2 block text-sm text-stone-500 hover:underline">{emailContacto}</a>
              </div>
            )}
            {direccion && (
              <div className="border-t-2 pt-6 text-center" style={{ borderColor: colorPrincipal }}>
                <PinIcon className="mx-auto h-6 w-6 text-stone-400" />
                <h3 className="mt-3 font-serif text-sm font-semibold uppercase tracking-wider text-stone-800">Dirección</h3>
                <p className="mt-2 text-sm text-stone-500">{direccion}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900">
        <div className="mx-auto max-w-5xl px-6 py-12 text-center">
          <p className="font-serif text-lg tracking-wide text-white">{nombre}</p>
          {eslogan && <p className="mt-2 font-serif text-sm italic text-stone-400">{eslogan}</p>}
          <div className="mt-8 border-t border-stone-700 pt-6"><IndexaFooterCredit /></div>
        </div>
      </footer>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════
// 3. MINIMALIST TEMPLATE
//    Ultra-clean, no shadows, sharp edges, small legible type, photo focus
// ═══════════════════════════════════════════════════════════════════════
export function MinimalistTemplate({ data, services, whatsAppUrl }: TemplateProps) {
  const { nombre, descripcion, eslogan, whatsapp, emailContacto, direccion, colorPrincipal, logoUrl, categoria, ciudad } = data;
  const altLogo = `Logo de ${nombre}${categoria ? ` - ${categoria}` : ""}${ciudad ? ` en ${ciudad}` : ""}`;
  const altHero = `${nombre}${categoria ? ` - ${categoria}` : ""}${ciudad ? ` en ${ciudad}` : ""}`;

  return (
    <>
      {/* Navbar — razor-thin, no shadow */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt={altLogo} width={32} height={32} className="h-8 w-8 object-contain" priority />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: colorPrincipal }}>
                {nombre.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold uppercase tracking-widest text-gray-900">{nombre}</span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <a href="#servicios" className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900">Servicios</a>
            <a href="#contacto" className="text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900">Contacto</a>
          </div>
        </nav>
      </header>

      {/* Hero — white bg, strong typography, brand color as accent line, optional hero image */}
      <section className="relative border-b border-gray-200 bg-white py-20 sm:py-28 lg:py-36">
        {data.heroImageUrl && (
          <Image src={data.heroImageUrl} alt={altHero} fill className="absolute inset-0 object-cover opacity-10" priority />
        )}
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          {logoUrl && (
            <Image src={logoUrl} alt={altHero} width={64} height={64} className="mx-auto mb-8 h-14 w-14 object-contain sm:h-16 sm:w-16" priority />
          )}
          <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900 sm:text-4xl lg:text-5xl">
            {nombre}
          </h1>
          {eslogan && (
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-gray-500">
              {eslogan}
            </p>
          )}
          <div className="mx-auto mt-6 h-0.5 w-10" style={{ backgroundColor: colorPrincipal }} />
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {whatsapp && (
              <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: colorPrincipal }}>
                <WaIcon className="h-3.5 w-3.5" /> Contactar
              </a>
            )}
            <a href="#servicios"
              className="inline-flex items-center gap-2 border border-gray-300 px-7 py-3 text-xs font-bold uppercase tracking-widest text-gray-700 transition-colors hover:border-gray-900">
              Ver más
            </a>
          </div>
        </div>
      </section>

      {/* Ofertas Banner */}
      <OfertasBanner ofertas={data.ofertasActivas} colorPrincipal={colorPrincipal} />

      {/* About */}
      {descripcion && (
        <section className="border-b border-gray-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Sobre nosotros</p>
            <p className="mt-4 text-sm leading-loose text-gray-600">{descripcion}</p>
          </div>
        </section>
      )}

      {/* Services */}
      <section id="servicios" className="border-b border-gray-200 bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Servicios</p>
          <div className="mt-8 grid gap-0 sm:grid-cols-2">
            {services.map((service, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-gray-200 py-5 last:border-b-0 sm:odd:pr-8 sm:even:pl-8 sm:even:border-l">
                <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: colorPrincipal }} />
                <span className="text-sm font-medium text-gray-800">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <GallerySection images={data.galeria} colorPrincipal={colorPrincipal} variant="minimalist" />

      {/* Contact */}
      <section id="contacto" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contacto</p>
          <div className="mt-8 space-y-4">
            {whatsapp && (
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 w-24">WhatsApp</span>
                <span className="text-sm text-gray-800">{whatsapp}</span>
              </div>
            )}
            {emailContacto && (
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 w-24">Email</span>
                <a href={`mailto:${emailContacto}`} className="text-sm text-gray-800 hover:underline">{emailContacto}</a>
              </div>
            )}
            {direccion && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 w-24">Dirección</span>
                <span className="text-sm text-gray-800">{direccion}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-5xl px-6 py-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white">{nombre}</p>
          {eslogan && <p className="mt-2 text-xs text-gray-500">{eslogan}</p>}
          <div className="mt-6 border-t border-gray-800 pt-6"><IndexaFooterCredit /></div>
        </div>
      </footer>
    </>
  );
}
