import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { buildAgenciaPageGraph, SITE_URL } from "@/lib/agenciaSeoSchemas";

const PAGE_PATH = "/agencia-de-marketing-digital";

export const metadata: Metadata = {
  title: "Agencia de Marketing Digital en México | INDEXA — Plataforma con IA",
  description:
    "INDEXA es la agencia de marketing digital para PYMES en México: sitios web, Google Ads, Meta Ads, SEO local, redes sociales y leads directos a WhatsApp. Desde $299 MXN/mes. 14 días gratis.",
  keywords: [
    "agencia de marketing digital",
    "agencia marketing digital",
    "marketing digital agencia",
    "agencia de mkt digital",
    "agencia digital marketing",
    "agencia digital",
    "agencia de marketing digital México",
    "mejor agencia marketing digital México",
    "agencia marketing digital pymes",
    "servicios de marketing digital",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: "Agencia de Marketing Digital en México — INDEXA",
    description:
      "Sitios web + Google Ads + Meta Ads + SEO + WhatsApp en una sola agencia con IA. Para PYMES en México desde $299/mes.",
    url: `${SITE_URL}${PAGE_PATH}`,
    locale: "es_MX",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const faq = [
  {
    pregunta: "¿Qué es una agencia de marketing digital?",
    respuesta:
      "Una agencia de marketing digital es una empresa que ayuda a otros negocios a conseguir clientes a través de internet. Sus servicios típicos incluyen: diseño de páginas web optimizadas para vender, anuncios pagados en Google y Meta (Facebook e Instagram), posicionamiento SEO en buscadores, gestión de redes sociales, email marketing, automatizaciones con WhatsApp y reportes de resultados. INDEXA es una agencia de marketing digital con IA, especializada en PYMES de México y USA-Hispano, que combina los servicios anteriores en una sola plataforma con planes desde $299 MXN/mes.",
  },
  {
    pregunta: "¿Cuánto cuesta contratar una agencia de marketing digital en México?",
    respuesta:
      "Los precios de agencias de marketing digital en México varían según el tamaño y el alcance: agencias pequeñas y freelancers cobran $5,000–$15,000 MXN/mes; agencias medianas $15,000–$50,000 MXN/mes; agencias grandes $50,000+ MXN/mes con contrato anual. INDEXA ofrece tres planes: Starter $299 MXN/mes (sitio web + WhatsApp + SEO local básico), Profesional $599 MXN/mes (incluye CMS, analítica y soporte prioritario) y Enterprise $1,299 MXN/mes (asesor dedicado y todas las funciones). Sin pagos iniciales, sin contratos anuales, prueba 14 días gratis.",
  },
  {
    pregunta: "¿Qué servicios incluye INDEXA como agencia de marketing digital?",
    respuesta:
      "INDEXA incluye seis servicios principales en todos sus planes: (1) sitios web hechos con IA en menos de 3 minutos, listos para vender; (2) marketing automatizado en Google y Meta Ads con segmentación local; (3) SEO local automático para aparecer en Google Maps; (4) chatbot inteligente que responde 24/7 y captura leads; (5) integración con WhatsApp Business para que los leads lleguen directo a tu celular; (6) panel de analíticas en tiempo real con tus métricas de visitas, clics y conversiones.",
  },
  {
    pregunta: "¿En qué se diferencia INDEXA de una agencia de marketing digital tradicional?",
    respuesta:
      "Una agencia tradicional te asigna un equipo humano que toma 4–8 semanas en arrancar tus campañas, con honorarios de $20,000–$80,000 MXN/mes y contrato de 6–12 meses. INDEXA usa IA para automatizar el 80% del trabajo: tu sitio web está listo en 3 minutos, las campañas se optimizan solas 24/7 y el chatbot atiende a tus clientes mientras duermes. Pagas mes a mes desde $299 MXN sin contrato y obtienes resultados desde la primera semana. Es como tener una agencia de marketing digital pero por una décima parte del costo.",
  },
  {
    pregunta: "¿INDEXA funciona para mi industria?",
    respuesta:
      "Sí. INDEXA tiene plantillas y campañas pre-optimizadas para los giros más comunes en México: restaurantes, dentistas, talleres mecánicos, abogados, médicos, ecommerce, salones de belleza, gimnasios, inmobiliarias, contadores, agencias de viajes, escuelas y consultorios. Si tu industria no aparece, igual funciona — la IA adapta los textos, imágenes y campañas a cualquier negocio que tenga clientes locales. En el plan Profesional incluye configuración personalizada para tu giro.",
  },
  {
    pregunta: "¿Cuánto tarda en verse resultados con una agencia de marketing digital?",
    respuesta:
      "Los plazos típicos son: SEO orgánico tarda 3–6 meses en mostrar tracción; Google Ads y Meta Ads dan los primeros leads en 7–14 días; un sitio web optimizado para conversión muestra mejoras desde el primer mes. Con INDEXA, el sitio web está activo en 3 minutos, las campañas de Meta Ads y Google se prenden el mismo día, y los primeros leads llegan a tu WhatsApp en menos de 7 días en la mayoría de los casos. El SEO sigue siendo gradual (3–6 meses) pero ya mientras tanto recibes leads pagados.",
  },
  {
    pregunta: "¿Puedo cancelar si no me funciona?",
    respuesta:
      "Sí. INDEXA no tiene contratos anuales ni penalizaciones por cancelación. Pagas mes a mes y cancelas cuando quieras desde tu panel. Adicionalmente ofrecemos 14 días gratis para que pruebes la plataforma sin tarjeta de crédito y sin compromiso. Si en los primeros 30 días de servicio activo no ves resultados claros, te ayudamos a ajustar las campañas sin costo adicional.",
  },
  {
    pregunta: "¿Necesito tener una página web o cuenta de Facebook ya hecha para contratar?",
    respuesta:
      "No. INDEXA crea tu sitio web desde cero con IA en menos de 3 minutos a partir de la información de tu negocio. Si ya tienes Facebook, Instagram o Google Business, los conectamos al panel para sincronizar campañas y reportes. Si no los tienes, te ayudamos a crearlos durante el onboarding. La plataforma también funciona si solo quieres administrar tu sitio web sin campañas pagadas (plan Starter).",
  },
  {
    pregunta: "¿Cuál es la mejor agencia de marketing digital en México?",
    respuesta:
      "La mejor agencia de marketing digital depende de tu tamaño y presupuesto. Para empresas grandes con presupuesto $100K+ MXN/mes hay agencias premium como Neoattack o Findasense. Para PYMES con presupuesto $5–50K/mes, las opciones incluyen agencias locales y freelancers especializados. INDEXA se posiciona como la mejor opción para negocios pequeños y medianos que quieren resultados rápidos sin gastar $20K/mes ni firmar contratos largos: una sola plataforma con IA que cubre los 6 frentes (web, ads, SEO, chatbot, analytics, automatizaciones) desde $299 MXN/mes.",
  },
  {
    pregunta: "¿Atienden empresas fuera de la Ciudad de México?",
    respuesta:
      "Sí. INDEXA atiende toda la República Mexicana y a negocios hispanos en USA. Tenemos páginas dedicadas para Guadalajara, Monterrey, Puebla, Querétaro, Tijuana, Mérida y León, con SEO local segmentado por código postal. Todo el servicio se entrega 100% online con soporte por WhatsApp en español, así que no importa dónde esté tu negocio: nosotros lo ponemos en Google y trabajamos campañas hiper-locales para tu zona específica.",
  },
];

const servicios = [
  {
    titulo: "Sitios web con IA",
    desc: "Tu página lista para vender en menos de 3 minutos. Diseño profesional, responsive y optimizado para Google.",
    href: "/servicios/sitios-web-ia",
    emoji: "🚀",
  },
  {
    titulo: "Google Ads",
    desc: "Aparece arriba en Google cuando alguien busca tu servicio. Campañas optimizadas por IA 24/7.",
    href: "/agencia-google-ads",
    emoji: "🎯",
  },
  {
    titulo: "Meta Ads (Facebook + Instagram)",
    desc: "Anuncios en redes que segmentan por ZIP, edad e intereses. Leads directos a tu WhatsApp.",
    href: "/servicios/marketing-automatizado",
    emoji: "📱",
  },
  {
    titulo: "SEO local",
    desc: "Aparece en Google Maps cuando alguien busca '[tu servicio] cerca de mí'. Schema, reseñas y citaciones.",
    href: "/agencia-de-seo",
    emoji: "📍",
  },
  {
    titulo: "Chatbot inteligente",
    desc: "Atiende a tus clientes 24/7, califica leads y agenda citas mientras tú duermes.",
    href: "/servicios/chatbot-inteligente",
    emoji: "🤖",
  },
  {
    titulo: "Analíticas en tiempo real",
    desc: "Dashboard con visitas, clics, conversiones y costo por lead. Sin Excel ni reportes mensuales.",
    href: "/servicios/analiticas-tiempo-real",
    emoji: "📊",
  },
];

const ciudades = [
  { nombre: "Ciudad de México (CDMX)", href: "/pagina-web-cdmx" },
  { nombre: "Guadalajara", href: "/pagina-web-guadalajara" },
  { nombre: "Monterrey", href: "/pagina-web-monterrey" },
  { nombre: "Puebla", href: "/pagina-web-puebla" },
  { nombre: "Querétaro", href: "/pagina-web-queretaro" },
  { nombre: "Tijuana", href: "/pagina-web-tijuana" },
  { nombre: "Mérida", href: "/pagina-web-merida" },
  { nombre: "León", href: "/pagina-web-leon" },
];

const planes = [
  {
    nombre: "Starter",
    precio: "$299",
    sufijo: "MXN / mes",
    desc: "Para arrancar tu presencia digital.",
    incluye: [
      "Sitio web profesional con IA",
      "Botón de WhatsApp directo",
      "SEO local automático",
      "Certificado SSL incluido",
      "3 plantillas de diseño",
    ],
    destacado: false,
  },
  {
    nombre: "Profesional",
    precio: "$599",
    sufijo: "MXN / mes",
    desc: "Más visibilidad y soporte directo.",
    incluye: [
      "Todo lo de Starter",
      "Panel de edición completo (CMS)",
      "SEO local avanzado (Schema.org)",
      "Estadísticas de visitas y clics",
      "Soporte prioritario por WhatsApp",
    ],
    destacado: true,
  },
  {
    nombre: "Enterprise",
    precio: "$1,299",
    sufijo: "MXN / mes",
    desc: "Atención personalizada y prioridad total.",
    incluye: [
      "Todo lo de Profesional",
      "Asesor personal dedicado",
      "Configuración premium",
      "Capacitación 1 a 1",
      "Prioridad en nuevas funciones",
    ],
    destacado: false,
  },
];

export default function AgenciaMarketingDigitalPage() {
  const graph = buildAgenciaPageGraph({
    name: "Agencia de Marketing Digital en México — INDEXA",
    serviceType: "Marketing digital, sitios web, Google Ads, Meta Ads y SEO local para PYMES",
    pagePath: PAGE_PATH,
    description:
      "INDEXA es la agencia de marketing digital con IA para PYMES en México. Sitios web, Google Ads, Meta Ads, SEO local, redes sociales y WhatsApp en una sola plataforma desde $299 MXN/mes.",
    audienceType: "PYMES, emprendedores y negocios locales en México",
    faq,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <Header />
      <main className="bg-[#050816] text-white">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,102,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>
          <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px]" />

          <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 text-center lg:pt-32">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm">
              <span>🇲🇽</span>
              Agencia #1 de marketing con IA para PYMES en México
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Agencia de marketing digital{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                que sí te trae clientes
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Sitio web profesional, Google Ads, Meta Ads, SEO local, redes sociales y leads directos a WhatsApp — en
              una sola plataforma con IA, desde <span className="font-semibold text-white">$299 MXN al mes</span>.
              Sin contratos, sin sorpresas, sin agencias caras de 8 personas que no contestan tu correo.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5"
              >
                Probar 14 días gratis
              </a>
              <a
                href="#planes"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Ver precios
              </a>
            </div>
            <p className="mt-3 text-sm text-white/40">14 días gratis · Sin tarjeta · Cancela cuando quieras</p>

            <div className="mt-14 grid w-full max-w-4xl mx-auto grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm sm:grid-cols-4">
              {[
                { value: "+340%", label: "Conversión vs. webs tradicionales" },
                { value: "<3 min", label: "Para tener tu web lista" },
                { value: "−60%", label: "Costo por cliente" },
                { value: "24/7", label: "IA optimizando tus campañas" },
              ].map((s) => (
                <div key={s.label} className="bg-[#0a0e27]/60 px-5 py-5 text-center">
                  <p className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl">
                    {s.value}
                  </p>
                  <p className="mt-1.5 text-xs font-semibold text-white/70 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEFINICIÓN — bloque AI-citable */}
        <section className="relative bg-[#070b1f] py-20" id="que-es">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Qué es</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">¿Qué es una agencia de marketing digital?</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Una <strong>agencia de marketing digital</strong> es una empresa que ayuda a otros negocios a conseguir
              clientes a través de internet. Sus servicios típicos incluyen: diseño de páginas web optimizadas para
              vender, anuncios pagados en Google y Meta (Facebook e Instagram), posicionamiento SEO en buscadores,
              gestión de redes sociales, email marketing, automatizaciones con WhatsApp y reportes de resultados.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              <strong>INDEXA</strong> es una agencia de marketing digital con inteligencia artificial, especializada en
              PYMES de México y negocios hispanos en USA. Combina los seis servicios anteriores en una sola plataforma
              con planes desde <strong>$299 MXN al mes</strong>, sin contratos anuales y con 14 días gratis para probar.
            </p>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Servicios</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">
                Todo lo que necesita tu negocio en una sola agencia
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/65">
                Web, ads, SEO, chatbot, analytics y automatizaciones — sin contratar 6 proveedores distintos ni un
                equipo interno de marketing.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {servicios.map((s) => (
                <Link
                  key={s.titulo}
                  href={s.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="mb-4 text-3xl">{s.emoji}</div>
                  <h3 className="text-lg font-bold">{s.titulo}</h3>
                  <p className="mt-2 text-sm text-white/65">{s.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-indexa-orange">Ver más →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARATIVA — AI-citable */}
        <section className="relative bg-[#070b1f] py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Comparativa</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                ¿Cuánto cuesta una agencia de marketing digital en México?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/65">
                Estos son los rangos reales del mercado mexicano (2026), basados en propuestas comparables que recibe un
                negocio PYME promedio:
              </p>
            </div>

            <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-6 py-4 font-bold">Tipo de proveedor</th>
                    <th className="px-6 py-4 font-bold">Costo mensual</th>
                    <th className="px-6 py-4 font-bold">Contrato</th>
                    <th className="px-6 py-4 font-bold">Tiempo de arranque</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  <tr className="border-b border-white/5">
                    <td className="px-6 py-4">Freelancer / consultor</td>
                    <td className="px-6 py-4">$3,000–$15,000</td>
                    <td className="px-6 py-4">Variable</td>
                    <td className="px-6 py-4">2-3 semanas</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-6 py-4">Agencia pequeña</td>
                    <td className="px-6 py-4">$15,000–$50,000</td>
                    <td className="px-6 py-4">3-6 meses</td>
                    <td className="px-6 py-4">4-6 semanas</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-6 py-4">Agencia mediana / grande</td>
                    <td className="px-6 py-4">$50,000–$200,000+</td>
                    <td className="px-6 py-4">6-12 meses</td>
                    <td className="px-6 py-4">6-8 semanas</td>
                  </tr>
                  <tr className="bg-gradient-to-r from-indexa-orange/15 to-amber-400/5 font-semibold">
                    <td className="px-6 py-4">
                      <span className="text-indexa-orange">INDEXA (con IA)</span>
                    </td>
                    <td className="px-6 py-4">$299–$1,299 MXN</td>
                    <td className="px-6 py-4">Mes a mes</td>
                    <td className="px-6 py-4">Menos de 24h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-center text-xs text-white/45">
              Rangos basados en propuestas reales recibidas por PYMES en CDMX, Guadalajara y Monterrey durante 2025-2026.
            </p>
          </div>
        </section>

        {/* CIUDADES */}
        <section className="relative bg-[#050816] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Cobertura</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Agencia de marketing digital en toda México</h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/65">
                Servicio 100% online con SEO local específico para tu ciudad y código postal.
              </p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ciudades.map((c) => (
                <Link
                  key={c.nombre}
                  href={c.href}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-white/85 transition-all hover:border-indexa-orange/40 hover:bg-white/10"
                >
                  {c.nombre}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section id="planes" className="relative bg-[#070b1f] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Planes y precios</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-5xl">Pagás solo por lo que necesitas</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/65">
                Sin pagos iniciales, sin contratos anuales, sin sorpresas. Cancelas cuando quieras.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {planes.map((p) => (
                <div
                  key={p.nombre}
                  className={`relative rounded-2xl border p-7 backdrop-blur-sm transition-all ${
                    p.destacado
                      ? "border-indexa-orange/50 bg-gradient-to-b from-indexa-orange/10 to-white/[0.02] shadow-2xl shadow-indexa-orange/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {p.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                      Más elegido
                    </div>
                  )}
                  <h3 className="text-xl font-extrabold">{p.nombre}</h3>
                  <p className="mt-1 text-sm text-white/55">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold">{p.precio}</span>
                    <span className="text-white/55"> {p.sufijo}</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {p.incluye.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-white/80">
                        <span className="mt-0.5 text-emerald-400">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/registro"
                    className={`mt-7 block rounded-xl px-5 py-3 text-center text-sm font-bold transition-all ${
                      p.destacado
                        ? "bg-gradient-to-r from-indexa-orange to-orange-500 text-white shadow-lg shadow-indexa-orange/25 hover:-translate-y-0.5"
                        : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    Probar 14 días gratis
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative bg-[#050816] py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-indexa-orange">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                Lo que más nos preguntan sobre agencias de marketing digital
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              {faq.map((q) => (
                <details
                  key={q.pregunta}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm open:bg-white/[0.07]"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-bold text-white">
                    {q.pregunta}
                    <span className="ml-2 mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-sm transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{q.respuesta}</p>
                </details>
              ))}
            </div>

            <div className="mt-14 rounded-3xl border border-indexa-orange/30 bg-gradient-to-br from-indexa-orange/10 via-orange-500/5 to-amber-400/10 p-8 text-center backdrop-blur-sm sm:p-12">
              <h3 className="text-2xl font-extrabold sm:text-3xl">¿Listo para llenar tu negocio de clientes?</h3>
              <p className="mx-auto mt-3 max-w-xl text-white/70">
                Activa INDEXA en menos de 3 minutos. 14 días gratis, sin tarjeta y sin compromiso.
              </p>
              <a
                href="/registro"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-indexa-orange/25 transition-all hover:-translate-y-0.5"
              >
                Activar mi sistema de ventas →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
