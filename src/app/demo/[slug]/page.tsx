import type { Metadata } from "next";

interface DemoPageProps {
  params: Promise<{ slug: string }>;
}

function slugToName(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = slugToName(slug);
  return {
    title: `${name} — Demo por INDEXA`,
    description: `Demostración exclusiva de presencia digital para ${name}, creada por INDEXA.`,
  };
}

const SERVICES = [
  {
    title: "Menú / Catálogo Digital",
    desc: "Presenta tus productos o servicios de forma clara y atractiva. Tus clientes podrán ver todo desde su celular.",
    d: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
  },
  {
    title: "Reservaciones en Línea",
    desc: "Permite que tus clientes agenden citas o reserven directamente desde tu sitio web.",
    d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  },
  {
    title: "Ubicación y Contacto",
    desc: "Mapa interactivo, botón de WhatsApp directo y toda tu información de contacto en un solo lugar.",
    d: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
  },
  {
    title: "Posicionamiento en Google",
    desc: "Aparece en los primeros resultados cuando alguien busque tu tipo de negocio en tu ciudad.",
    d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
  },
];

const GALLERY = [
  { label: "Fachada del negocio", bg: "from-blue-900 to-blue-700" },
  { label: "Interior / Ambiente", bg: "from-orange-600 to-amber-500" },
  { label: "Productos destacados", bg: "from-blue-800 to-indigo-600" },
  { label: "Equipo de trabajo", bg: "from-gray-700 to-gray-500" },
  { label: "Clientes satisfechos", bg: "from-orange-700 to-orange-500" },
  { label: "Promociones", bg: "from-blue-700 to-cyan-600" },
];

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const name = slugToName(slug);

  return (
    <div className="min-h-screen bg-white">
      {/* Demo banner */}
      <div className="bg-indexa-orange text-white">
        <p className="mx-auto max-w-7xl px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider sm:text-sm">
          Esta es una demo exclusiva de INDEXA para {name}
        </p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-xl font-extrabold tracking-tight text-indexa-blue">{name}</span>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#servicios" className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue transition-colors">Servicios</a>
            <a href="#galeria" className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue transition-colors">Galería</a>
            <a href="#contacto" className="text-sm font-medium text-indexa-gray-dark hover:text-indexa-blue transition-colors">Contacto</a>
          </div>
          <a href="#contacto" className="rounded-lg bg-indexa-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indexa-orange/90">
            Contáctanos
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-indexa-blue">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-indexa-orange blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-indexa-orange" />
            Tu negocio, ahora digital
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Bienvenido a la nueva era digital de{" "}
            <span className="text-indexa-orange">{name}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
            Imagina tener tu propio sitio web profesional donde tus clientes puedan conocerte,
            ver tus servicios y contactarte al instante. Así se vería.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#contacto" className="inline-flex items-center gap-2 rounded-xl bg-indexa-orange px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indexa-orange/90 hover:shadow-xl hover:-translate-y-0.5">
              Quiero mi Sitio Web
            </a>
            <a href="#servicios" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-8 py-4 text-lg font-bold text-white transition-all hover:border-white/40 hover:bg-white/5">
              Ver Servicios
            </a>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="bg-indexa-gray-light py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Lo que incluye tu sitio</p>
            <h2 className="mt-3 text-3xl font-extrabold text-indexa-blue sm:text-4xl">
              Todo lo que {name} necesita
            </h2>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.title} className="group flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-indexa-blue/10 text-indexa-blue transition-colors group-hover:bg-indexa-blue group-hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.d} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indexa-gray-dark">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería */}
      <section id="galeria" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Muestra tu mejor cara</p>
            <h2 className="mt-3 text-3xl font-extrabold text-indexa-blue sm:text-4xl">Galería de {name}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-indexa-gray-dark">
              Aquí podrás mostrar fotos de tu negocio, productos y equipo de trabajo.
            </p>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((item) => (
              <div key={item.label} className={`relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-gradient-to-br ${item.bg} p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="h-24 w-24 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
                <span className="relative z-10 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="bg-indexa-gray-light py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">¿Listo para crecer?</p>
            <h2 className="mt-3 text-3xl font-extrabold text-indexa-blue sm:text-4xl">Contáctanos</h2>
            <p className="mt-4 text-lg text-indexa-gray-dark">
              Así tus clientes podrían contactarte directamente desde tu sitio web.
            </p>
          </div>
          <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">Nombre</label>
                <input type="text" placeholder="Tu nombre completo" disabled className="mt-1.5 w-full rounded-xl border border-gray-200 bg-indexa-gray-light px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">Teléfono</label>
                <input type="tel" placeholder="55 1234 5678" disabled className="mt-1.5 w-full rounded-xl border border-gray-200 bg-indexa-gray-light px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">Mensaje</label>
                <textarea rows={3} placeholder="¿En qué podemos ayudarte?" disabled className="mt-1.5 w-full rounded-xl border border-gray-200 bg-indexa-gray-light px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 resize-none" />
              </div>
              <button disabled className="w-full rounded-xl bg-indexa-orange px-8 py-4 text-lg font-bold text-white opacity-90 cursor-default">Enviar Mensaje</button>
              <p className="text-center text-xs text-gray-400">* Los campos están deshabilitados en esta demo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-indexa-blue py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            ¿Te gustaría tener un sitio así para <span className="text-indexa-orange">{name}</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            En INDEXA creamos sitios web profesionales para negocios como el tuyo. Sin complicaciones, con resultados reales.
          </p>
          <a href="https://www.indexa.com.mx/#contacto" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indexa-orange px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indexa-orange/90 hover:shadow-xl hover:-translate-y-0.5">
            Hablar con un Asesor de INDEXA
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400">
            Demo creada por <a href="https://www.indexa.com.mx" target="_blank" rel="noopener noreferrer" className="font-semibold text-indexa-blue hover:underline">INDEXA</a> — Presencia digital para PYMES.
          </p>
        </div>
      </footer>
    </div>
  );
}
