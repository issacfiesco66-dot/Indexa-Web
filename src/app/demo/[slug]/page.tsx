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

// ── Business type detection and dynamic content ─────────────────────────
type BusinessType = "restaurante" | "salon" | "tienda" | "salud" | "taller" | "general";

interface ServiceItem {
  title: string;
  desc: string;
  d: string;
}

interface GalleryItem {
  label: string;
  bg: string;
}

const ICON_PATHS = {
  menu: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
  calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  location: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
  search: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
  cart: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
  scissors: "M7.848 8.25l1.536.887M7.848 8.25a3 3 0 1 1-5.196-3 3 3 0 0 1 5.196 3Zm1.536.887a2.165 2.165 0 0 1 1.083 1.839c.005.442.17.79.387 1.024m-1.47-2.863a2.17 2.17 0 0 0-1.47 2.863m1.47-2.863 5.848 3.375m-5.848-3.375L3.817 1.5M7.848 15.75l1.536-.887m-1.536.887a3 3 0 1 0-5.196 3 3 3 0 0 0 5.196-3Zm1.536-.887a2.165 2.165 0 0 0 1.083-1.838c.005-.443.17-.792.387-1.025m-1.47 2.863a2.17 2.17 0 0 1-1.47-2.863",
  heart: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
  wrench: "M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743",
  star: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z",
  truck: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25m-2.25 0h2.25m0 0v5.25",
};

const BUSINESS_KEYWORDS: Record<BusinessType, string[]> = {
  restaurante: ["taco", "pizza", "burger", "hambur", "comida", "restaurant", "cocina", "sushi", "antojito", "parrilla", "mariscos", "café", "cafeteria", "bakery", "panaderia", "torta", "ceviche", "birria", "pollo", "carnita"],
  salon: ["salon", "beauty", "belleza", "estética", "estetica", "barber", "barbería", "peluquer", "nail", "uñas", "spa", "hair", "cabello", "maquillaje"],
  tienda: ["tienda", "store", "shop", "boutique", "ropa", "fashion", "zapato", "joyería", "accesorio", "mueble", "ferret", "abarrote", "mini super", "papelería"],
  salud: ["doctor", "dentist", "clínica", "clinica", "hospital", "médico", "medico", "salud", "fisio", "nutri", "psico", "veterinar", "farmacia", "óptica", "optica", "laboratorio"],
  taller: ["taller", "mecánic", "mecanico", "auto", "llanta", "carrocer", "electri", "plomer", "carpinter", "herrería", "herrero", "pintur", "construccion", "instalaci"],
  general: [],
};

function detectBusinessType(slug: string): BusinessType {
  const lower = decodeURIComponent(slug).toLowerCase().replace(/-/g, " ");
  for (const [type, keywords] of Object.entries(BUSINESS_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return type as BusinessType;
    }
  }
  return "general";
}

const SERVICES_BY_TYPE: Record<BusinessType, ServiceItem[]> = {
  restaurante: [
    { title: "Menú Digital", desc: "Presenta tus platillos con fotos y precios. Tus clientes podrán ver todo desde su celular antes de visitarte.", d: ICON_PATHS.menu },
    { title: "Reservaciones en Línea", desc: "Permite que tus clientes reserven mesa directamente desde tu sitio web, sin llamadas.", d: ICON_PATHS.calendar },
    { title: "Pedidos y Delivery", desc: "Recibe pedidos directamente por WhatsApp. Sin comisiones de plataformas externas.", d: ICON_PATHS.truck },
    { title: "Posicionamiento en Google", desc: "Aparece cuando busquen restaurantes en tu zona. Más visibilidad = más clientes.", d: ICON_PATHS.search },
  ],
  salon: [
    { title: "Catálogo de Servicios", desc: "Muestra tus cortes, tratamientos y precios con fotos de tu trabajo. Genera confianza antes de la visita.", d: ICON_PATHS.scissors },
    { title: "Agenda de Citas Online", desc: "Tus clientes eligen fecha, hora y servicio desde tu web. Menos llamadas, más organización.", d: ICON_PATHS.calendar },
    { title: "Galería de Trabajos", desc: "Muestra tu portafolio de antes y después. Nada vende más que resultados reales.", d: ICON_PATHS.star },
    { title: "Ubicación y WhatsApp", desc: "Mapa interactivo y botón de WhatsApp directo. Que te encuentren y contacten fácilmente.", d: ICON_PATHS.location },
  ],
  tienda: [
    { title: "Catálogo de Productos", desc: "Exhibe tu inventario con fotos, precios y descripciones. Tu vitrina digital abierta 24/7.", d: ICON_PATHS.cart },
    { title: "Pedidos por WhatsApp", desc: "Tus clientes seleccionan productos y te contactan directo. Ventas sin intermediarios.", d: ICON_PATHS.truck },
    { title: "Ofertas y Promociones", desc: "Destaca tus mejores ofertas y temporadas. Mantén a tus clientes informados.", d: ICON_PATHS.star },
    { title: "Posicionamiento en Google", desc: "Aparece cuando busquen tiendas de tu tipo en tu zona. Más tráfico orgánico.", d: ICON_PATHS.search },
  ],
  salud: [
    { title: "Servicios y Especialidades", desc: "Presenta tus servicios médicos, especialidades y equipo profesional con claridad y confianza.", d: ICON_PATHS.heart },
    { title: "Agenda de Citas", desc: "Tus pacientes agendan cita desde tu web. Menos llamadas, más eficiencia en tu consultorio.", d: ICON_PATHS.calendar },
    { title: "Ubicación y Contacto", desc: "Mapa con tu ubicación exacta, horarios de atención y botón de WhatsApp para urgencias.", d: ICON_PATHS.location },
    { title: "Presencia en Google", desc: "Aparece cuando busquen servicios de salud en tu zona. Los pacientes te encontrarán primero.", d: ICON_PATHS.search },
  ],
  taller: [
    { title: "Servicios y Cotizaciones", desc: "Lista tus servicios con precios estimados. Los clientes sabrán qué ofreces antes de llamar.", d: ICON_PATHS.wrench },
    { title: "Galería de Trabajos", desc: "Muestra fotos de tus trabajos realizados. La prueba de tu experiencia y calidad.", d: ICON_PATHS.star },
    { title: "WhatsApp Directo", desc: "Cotizaciones rápidas por WhatsApp. El cliente describe su problema y tú respondes al instante.", d: ICON_PATHS.location },
    { title: "Posicionamiento Local", desc: "Aparece en Google cuando busquen talleres en tu zona. Sé la primera opción.", d: ICON_PATHS.search },
  ],
  general: [
    { title: "Menú / Catálogo Digital", desc: "Presenta tus productos o servicios de forma clara y atractiva. Tus clientes podrán ver todo desde su celular.", d: ICON_PATHS.menu },
    { title: "Reservaciones en Línea", desc: "Permite que tus clientes agenden citas o reserven directamente desde tu sitio web.", d: ICON_PATHS.calendar },
    { title: "Ubicación y Contacto", desc: "Mapa interactivo, botón de WhatsApp directo y toda tu información de contacto en un solo lugar.", d: ICON_PATHS.location },
    { title: "Posicionamiento en Google", desc: "Aparece en los primeros resultados cuando alguien busque tu tipo de negocio en tu ciudad.", d: ICON_PATHS.search },
  ],
};

const GALLERY_BY_TYPE: Record<BusinessType, GalleryItem[]> = {
  restaurante: [
    { label: "Fachada del restaurante", bg: "from-amber-900 to-amber-700" },
    { label: "Interior / Ambiente", bg: "from-orange-600 to-amber-500" },
    { label: "Platillos principales", bg: "from-red-800 to-red-600" },
    { label: "Cocina en acción", bg: "from-gray-700 to-gray-500" },
    { label: "Clientes disfrutando", bg: "from-orange-700 to-orange-500" },
    { label: "Bebidas y postres", bg: "from-amber-700 to-yellow-600" },
  ],
  salon: [
    { label: "Fachada del salón", bg: "from-pink-900 to-pink-700" },
    { label: "Estaciones de trabajo", bg: "from-rose-600 to-pink-500" },
    { label: "Antes y después", bg: "from-purple-800 to-purple-600" },
    { label: "Productos profesionales", bg: "from-gray-700 to-gray-500" },
    { label: "Clientas satisfechas", bg: "from-pink-700 to-rose-500" },
    { label: "Ambiente del salón", bg: "from-violet-700 to-purple-600" },
  ],
  tienda: [
    { label: "Fachada de la tienda", bg: "from-blue-900 to-blue-700" },
    { label: "Exhibición de productos", bg: "from-indigo-600 to-blue-500" },
    { label: "Productos destacados", bg: "from-teal-800 to-teal-600" },
    { label: "Interior de la tienda", bg: "from-gray-700 to-gray-500" },
    { label: "Ofertas especiales", bg: "from-orange-700 to-orange-500" },
    { label: "Nuevos ingresos", bg: "from-emerald-700 to-emerald-500" },
  ],
  salud: [
    { label: "Fachada del consultorio", bg: "from-cyan-900 to-cyan-700" },
    { label: "Sala de espera", bg: "from-teal-600 to-cyan-500" },
    { label: "Equipo médico", bg: "from-blue-800 to-blue-600" },
    { label: "Equipo profesional", bg: "from-gray-700 to-gray-500" },
    { label: "Instalaciones", bg: "from-cyan-700 to-teal-500" },
    { label: "Certificaciones", bg: "from-emerald-700 to-green-500" },
  ],
  taller: [
    { label: "Fachada del taller", bg: "from-gray-900 to-gray-700" },
    { label: "Área de trabajo", bg: "from-slate-600 to-gray-500" },
    { label: "Herramientas y equipo", bg: "from-zinc-800 to-zinc-600" },
    { label: "Trabajos realizados", bg: "from-amber-700 to-amber-500" },
    { label: "Equipo de trabajo", bg: "from-gray-700 to-slate-500" },
    { label: "Clientes satisfechos", bg: "from-green-700 to-emerald-500" },
  ],
  general: [
    { label: "Fachada del negocio", bg: "from-blue-900 to-blue-700" },
    { label: "Interior / Ambiente", bg: "from-orange-600 to-amber-500" },
    { label: "Productos destacados", bg: "from-blue-800 to-indigo-600" },
    { label: "Equipo de trabajo", bg: "from-gray-700 to-gray-500" },
    { label: "Clientes satisfechos", bg: "from-orange-700 to-orange-500" },
    { label: "Promociones", bg: "from-blue-700 to-cyan-600" },
  ],
};

export default async function DemoPage({ params }: DemoPageProps) {
  const { slug } = await params;
  const name = slugToName(slug);
  const businessType = detectBusinessType(slug);
  const SERVICES = SERVICES_BY_TYPE[businessType];
  const GALLERY = GALLERY_BY_TYPE[businessType];

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
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-indexa-orange px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indexa-orange/90 hover:shadow-xl hover:-translate-y-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2 1.5 1.5M16.5 5.5 18 4"/><path d="m5 22 14-14"/><path d="m14.5 3.5 5 5"/><path d="m3.5 18.5 3 3"/><path d="M2 22h4"/></svg>
              Crear Mi Sitio Web Gratis
            </a>
            <a href={`https://wa.me/+525512345678?text=${encodeURIComponent(`Hola, vi la demo de INDEXA para ${name} y me interesa tener mi propio sitio web profesional.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-[#1fb855] hover:shadow-xl hover:-translate-y-0.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Hablar con un Asesor
            </a>
          </div>
          <p className="mt-4 text-sm text-white/50">Sin contratos · Cancela cuando quieras · Empieza gratis</p>
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
